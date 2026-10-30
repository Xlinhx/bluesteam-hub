import { useMemo, useRef, useState } from 'react';
import { Volume2, RotateCcw, CheckCircle2, Sparkles, Hand, Shell } from 'lucide-react';
import { oceanAudio } from '../../audio/oceanAudio';
import { type ActivityRuntimeProps, type SortingGameConfig, type SortingTargetZone, type SortingDraggableObject } from '../types';
import './sorting-game.css';
import { usePlacementMotion } from '../../ui/motion/useInteractiveMotion';
export function normalizeSortingConfig(raw: Record<string, unknown> | SortingGameConfig) {
    const config = (raw || {}) as SortingGameConfig;
    const targets: SortingTargetZone[] = (config.targets || config.zones || []).map((target, index, all) => ({ ...target, bounds: target.bounds || { x: .04 + index * .94 / all.length, y: .5, width: .86 / all.length, height: .28 } }));
    const objects: SortingDraggableObject[] = (config.objects || config.items || []).map((object, index) => ({
        ...object, id: object.id || `obj-${index + 1}`, label: object.label || `Bạn biển ${index + 1}`,
        imageUrl: object.imageUrl || '', audioText: object.audioText || object.label,
        scale: Number.isFinite(object.scale) ? Math.max(.5, Math.min(2, object.scale!)) : 1,
        acceptedTargetIds: Array.isArray(object.acceptedTargetIds) ? object.acceptedTargetIds : object.targetZoneId ? [object.targetZoneId] : [],
        points: object.points ?? 1,
    }));
    return { instructionText: config.instructionText || config.prompt || 'Chạm vào một bạn, rồi chạm nơi sống.', narrationUrl: config.narrationUrl, allowRetry: config.allowRetry !== false, scoringEnabled: config.scoringEnabled !== false, backgroundUrl: config.backgroundUrl || '/assets/generated/backgrounds/habitat_placement_bg.jpg', targets, objects };
}
export function SortingGameRuntime({ context = 'standalone', title, config, isPaused = false, readOnly = false, onPracticeFeedback, onComplete, onUsageInteraction, onRestart }: ActivityRuntimeProps) {
    const presentationLayout = context === 'presentation';
    const game = useMemo(() => normalizeSortingConfig(config as SortingGameConfig), [config]);
    const [stage, setStage] = useState<'recognition' | 'placement' | 'feedback'>(context === 'standalone' ? 'recognition' : 'placement');
    const [selected, setSelected] = useState<string | null>(game.objects[0]?.id || null);
    const [placed, setPlaced] = useState<Record<string, string>>({});
    const root = useRef<HTMLDivElement>(null);
    const capturePlacement = usePlacementMotion(root, placed, isPaused);
    const [locked, setLocked] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{
        correct: boolean;
        message: string;
    } | null>(null);
    const [burst, setBurst] = useState<{
        targetId: string;
        key: number;
    } | null>(null);
    const [hintFor, setHintFor] = useState<string | null>(null);
    const [pending, setPending] = useState<string | null>(null);
    const submitting = useRef(false);
    const attempts = useRef<Record<string, number>>({});

    const complete = game.objects.length > 0 && game.objects.every(object => placed[object.id] || locked[object.id]);
    const currentObject = game.objects.find(object => object.id === selected);
    const focusedInstruction = currentObject ? `Tìm nơi sống cho ${currentObject.label.toLocaleLowerCase('vi')}` : game.instructionText;
    const interactive = !isPaused && !readOnly && !pending;
    const place = async (objectId: string, targetId: string) => {
        if (!interactive || submitting.current || placed[objectId] || locked[objectId])
            return;
        const object = game.objects.find(o => o.id === objectId);
        const target = game.targets.find(t => t.id === targetId);
        if (!object || !target)
            return;
        let correct = object.acceptedTargetIds.includes(targetId);
        onUsageInteraction?.({type:'game_answer',itemId:objectId,answerId:targetId});
        const attempt = (attempts.current[objectId] || 0) + 1;

        submitting.current = true;
        setPending(objectId);
        try {
            ;
            attempts.current[objectId] = attempt;
            const nextPlaced = correct ? { ...placed, [objectId]: object.acceptedTargetIds.includes(targetId) ? targetId : object.acceptedTargetIds[0] } : placed;
            const nextLocked = !correct && !game.allowRetry ? { ...locked, [objectId]: targetId } : locked;
            const message = correct ? `${object.label} đã về đúng nhà!` : game.allowRetry ? `${object.label} thích một nơi khác. Bé thử lại nhé!` : 'Đã ghi nhận lượt của bé. Cùng khám phá bạn tiếp theo nhé.';
            if (correct && context !== 'presentation') capturePlacement(objectId);
            setPlaced(nextPlaced);
            setLocked(nextLocked);
            setFeedback({ correct, message });
            if (correct)
                setBurst({ targetId, key: Date.now() });
            oceanAudio.speak(message);
            onPracticeFeedback?.({ itemId: objectId, isCorrect: correct, message });
            if (correct || !game.allowRetry)
                setSelected(game.objects.find(o => !nextPlaced[o.id] && !nextLocked[o.id])?.id || null);
            if (game.objects.every(o => nextPlaced[o.id] || nextLocked[o.id])) {
                if (context === 'standalone')
                    setStage('feedback');
                onComplete?.({ completedItems: Object.keys(nextPlaced).length, totalItems: game.objects.length, earnedPoints: 0 });
            }
        }
        catch (error) {
            setFeedback({ correct: false, message: error instanceof Error ? error.message : 'Chưa ghi nhận được câu trả lời. Bé thử lại nhé.' });
        }
        finally {
            submitting.current = false;
            setPending(null);
        }
    };
    const reset = () => {
        onRestart?.();
        if (submitting.current)
            return;
        setPlaced({});
        setLocked({});
        setFeedback(null);
        setBurst(null);
        attempts.current = {};

        setSelected(game.objects[0]?.id || null);
        setStage('placement');
    };
    return <div ref={root} className="sorting-ocean" data-testid="sorting-game-runtime" data-context={context} data-paused={isPaused} data-layout={presentationLayout ? 'presentation' : 'explore'} aria-busy={!!pending}>
    {context === 'standalone' && <nav className="sorting-journey__steps" aria-label="Các bước khám phá">{(['recognition', 'placement', 'feedback'] as const).map((step, index) => <button key={step} aria-current={stage === step ? 'step' : undefined} disabled={isPaused || (step === 'feedback' && !complete)} onClick={() => { oceanAudio.stop(); setStage(step); }}><span>{index + 1}</span>{['Quan sát', 'Thử đặt', 'Khám phá'][index]}</button>)}</nav>}
    {context === 'standalone' && stage === 'recognition' && <section className="sorting-journey__observation" aria-label="Quan sát các bạn biển"><img className="sorting-journey__backdrop" src={game.backgroundUrl} alt=""/><div className="sorting-journey__intro"><h2>Cùng quan sát các bạn biển</h2><p>Chạm một bạn để nghe tên, rồi cùng tìm nơi sống nhé.</p><div className="sorting-journey__creatures">{game.objects.map(object => <button key={object.id} disabled={isPaused} onClick={() => void oceanAudio.playNarration(object.audioUrl, object.audioText || object.label)}>{object.imageUrl && <img src={object.imageUrl} alt=""/>}<span>{object.label}</span><Volume2 size={18}/></button>)}</div><button className="sorting-journey__start" disabled={isPaused} onClick={() => { oceanAudio.stop(); setStage('placement'); }}>Bắt đầu tìm nhà</button></div></section>}
    <div hidden={context === 'standalone' && stage === 'recognition'}>
    <div className="sorting-ocean__scene">
      <img className="sorting-ocean__background" src={game.backgroundUrl} alt=""/>
      <div className="sorting-ocean__rays" aria-hidden="true"/>
      <div className="sorting-ocean__instruction"><button type="button" aria-label="Nghe câu lệnh" onClick={() => void oceanAudio.playNarration(game.narrationUrl, presentationLayout ? focusedInstruction : game.instructionText)}><Volume2 /></button><span><span className="sr-only">{title}: </span>{presentationLayout ? focusedInstruction : game.instructionText}</span></div>
      <div className="sorting-ocean__progress" aria-label={`Đã hoàn thành ${Object.keys(placed).length + Object.keys(locked).length} trên ${game.objects.length}`}>{Object.keys(placed).length + Object.keys(locked).length}/{game.objects.length}</div>
      {game.targets.map((target, index) => {
            const bounds = target.bounds!;
            return <button type="button" key={target.id} data-testid={`sorting-zone-${target.id}`} className={`sorting-ocean__target sorting-ocean__target--${index % 4} ${hintFor === selected && currentObject?.acceptedTargetIds.includes(target.id) ? 'is-hinted' : ''}`} disabled={!interactive} style={{ borderRadius: target.shape === 'rectangle' ? 12 : '50%', left: `${bounds.x * 100}%`, top: `${bounds.y * 100}%`, width: `${bounds.width * 100}%`, height: `${bounds.height * 100}%` }} onClick={() => selected && void place(selected, target.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (id)
                void place(id, target.id); }} aria-label={`Đưa ${game.objects.find(o => o.id === selected)?.label || 'bạn biển'} tới ${target.label}`}>
          <span className="sorting-ocean__landing" style={{ borderRadius: target.shape === 'rectangle' ? 12 : '50%' }} aria-hidden="true"/>
          <span className="sorting-ocean__residents">{game.objects.filter(o => placed[o.id] === target.id).map(o => <img key={o.id} data-resident-id={o.id} src={o.imageUrl} alt={o.label} style={{ transform: `scale(${o.scale})` }}/>)}</span>
          <span className="sorting-ocean__sign">{target.label}</span>
          {burst?.targetId === target.id && <span key={burst.key} className="sorting-ocean__burst" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map(n => <i key={n} style={{ '--bubble-index': n } as React.CSSProperties}/>)}</span>}
        </button>;
        })}
      {feedback && <div key={feedback.message + burst?.key} role="status" data-testid="sorting-feedback" className={`sorting-ocean__feedback ${feedback.correct ? 'is-correct' : ''}`}>{feedback.correct && <CheckCircle2 size={22}/>}{feedback.message}</div>}
    </div>
    <div className="sorting-ocean__tray">
      {game.objects.filter(object => !presentationLayout || object.id === selected).map(object => <button type="button" key={object.id} className={`sorting-ocean__object ${selected === object.id ? 'is-selected' : ''} ${placed[object.id] || locked[object.id] ? 'is-done' : ''}`} aria-pressed={selected === object.id} disabled={!interactive || !!placed[object.id] || !!locked[object.id]} draggable={interactive && !placed[object.id] && !locked[object.id]} data-sorting-object={object.id} data-testid={`sorting-item-${object.id}`} onClick={() => { setSelected(object.id); void oceanAudio.playNarration(object.audioUrl, object.audioText || object.label); }} onDragStart={event => { event.dataTransfer.setData('text/plain', object.id); setSelected(object.id); }}>
        <img src={object.imageUrl || undefined} alt="" style={{ transform: `scale(${object.scale})` }}/><span>{object.label}</span>{placed[object.id] && <CheckCircle2 className="sorting-ocean__done-mark" size={22}/>}
      </button>)}
      {presentationLayout && !complete && <><div className="sorting-room-guidance"><span><Hand /> Chạm bạn biển, rồi chạm nơi sống</span><div className="sorting-room-dots" aria-label="Tiến trình các bạn biển">{game.objects.map(object => <i key={object.id} className={placed[object.id] || locked[object.id] ? 'is-done' : object.id === selected ? 'is-current' : ''}/>)}</div></div><button type="button" className="sorting-room-hint" aria-label="Gợi ý" disabled={!interactive || !currentObject} onClick={() => { setHintFor(selected); oceanAudio.speak('Con quan sát nơi sáng lên nhé.'); }}><Shell /> Gợi ý</button></>}
      {!presentationLayout && <button type="button" className="sorting-ocean__reset" aria-label="Làm lại từ đầu" onClick={reset} disabled={!!pending}><RotateCcw size={24}/><span>Làm lại</span></button>}
    </div>
    {complete && <div className="sorting-ocean__complete" data-testid="sorting-complete-banner" role="status"><Sparkles size={28}/><div><strong>{Object.keys(locked).length ? 'Bé đã khám phá xong!' : 'Các bạn biển đã về đúng nhà!'}</strong><p>{'Cùng khám phá thêm một lần nữa nhé.'}</p></div>{<button onClick={reset}>Chơi lại</button>}</div>}
    </div>
    {isPaused && <div className="sorting-ocean__pause" role="status"><div><strong>{'Nghỉ một chút nhé'}</strong><p>{'Chạm nút tiếp tục khi bé sẵn sàng.'}</p></div></div>}
  </div>;
}

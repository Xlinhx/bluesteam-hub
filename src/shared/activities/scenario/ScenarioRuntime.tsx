import { useState, useMemo, useEffect, useRef } from 'react';
import { Volume2, RotateCcw, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { oceanAudio } from '../../audio/oceanAudio';
import { type ActivityRuntimeProps, type ScenarioActivityConfig, type ScenarioSceneNode, type ScenarioChoiceBranch, } from '../types';
import { isTerminalScene } from './validateScenario';
import { useScenarioMotion } from '../simulations/useSimulationMotion';
export function normalizeScenarioConfig(raw: Record<string, unknown> | ScenarioActivityConfig): ScenarioActivityConfig {
    const c = (raw || {}) as ScenarioActivityConfig;
    const rawScenes = Array.isArray(c.scenes) ? c.scenes : [];
    const scenes: ScenarioSceneNode[] = rawScenes.map((s: any, idx: number) => ({
        id: s.id || `scene-${idx + 1}`,
        title: s.title || `Cảnh ${idx + 1}`,
        backgroundUrl: s.backgroundUrl || s.imageUrl || '/assets/generated/simulations/sim_bottle_beach.png',
        narrationText: s.narrationText || s.prompt || '',
        narrationUrl: s.narrationUrl,
        isEnd: Boolean(s.isEnd || s.isTerminal || s.isEnding),
        isTerminal: Boolean(s.isEnd || s.isTerminal || s.isEnding),
        choices: Array.isArray(s.choices)
            ? s.choices.map((ch: any, cIdx: number) => ({
                id: ch.id || `choice-${cIdx + 1}`,
                label: ch.label || `Lựa chọn ${cIdx + 1}`,
                imageUrl: ch.imageUrl || '/assets/generated/r2-scenarios/choice_pickup_bottle_bin.jpg',
                nextSceneId: ch.nextSceneId ?? null,
                feedbackText: ch.feedbackText || 'Cùng xem điều gì xảy ra tiếp theo nhé!',
                feedbackAudioUrl: ch.feedbackAudioUrl,
                isCorrect: ch.isCorrect !== undefined ? Boolean(ch.isCorrect) : Boolean(ch.isPositive),
                points: Number(ch.points ?? (ch.isCorrect !== false ? 1 : 0)),
            }))
            : [],
    }));
    const scoringMode = (c as any).scoringMode;
    const scoringEnabled = scoringMode === 'none' ? false : c.scoringEnabled !== false;
    return {
        templateKey: 'scenario',
        startSceneId: c.startSceneId || scenes[0]?.id || 'scene-1',
        scoringEnabled,
        scenes,
    };
}
export function ScenarioRuntime({ context, config, isPaused = false, readOnly = false, onPracticeFeedback, onComplete, activeSceneIdOverride, onUsageInteraction, onRestart }: ActivityRuntimeProps & {
    activeSceneIdOverride?: string | null;
}) {
    const normalized = useMemo(() => normalizeScenarioConfig(config as ScenarioActivityConfig), [config]);
    const [currentSceneId, setCurrentSceneId] = useState<string>(activeSceneIdOverride || normalized.startSceneId);
    const [selectedChoice, setSelectedChoice] = useState<ScenarioChoiceBranch | null>(null);

    const pending = false;
    const error = '';
    const submitting = useRef(false);

    const visited = useRef(new Set<string>([normalized.startSceneId]));
    const completed = useRef(false);
    useEffect(() => {
        if (activeSceneIdOverride) {
            setCurrentSceneId(activeSceneIdOverride);
            setSelectedChoice(null);
        }
    }, [activeSceneIdOverride]);
    const currentScene = normalized.scenes.find((s) => s.id === currentSceneId) || normalized.scenes[0];
    const illustration=useRef<HTMLImageElement>(null);
    useScenarioMotion(illustration,currentScene?.id);
    const isInteractive = !isPaused && !readOnly && !pending;
    const terminal = currentScene ? isTerminalScene(currentScene) : false;
    const handleSelectChoice = async (choice: ScenarioChoiceBranch) => {
        if (!isInteractive || !currentScene || submitting.current)
            return;
        const isPositive = choice.isCorrect !== false;
        onUsageInteraction?.({type:'scenario_choice',sceneId:currentScene.id,choiceId:choice.id});

        {
            onPracticeFeedback?.({
                itemId: currentScene.id,
                isCorrect: isPositive,
                message: choice.feedbackText,
            });
        }
        setSelectedChoice(choice);
        void oceanAudio.playNarration(choice.feedbackAudioUrl, choice.feedbackText || choice.label);
        // If user picked a choice with nextSceneId, allow immediate or 1-click transition
        if (choice.nextSceneId) {
            const targetScene = normalized.scenes.find((s) => s.id === choice.nextSceneId);
            if (targetScene && isTerminalScene(targetScene) && !completed.current) {
                completed.current = true;
                visited.current.add(currentScene.id);
                visited.current.add(targetScene.id);
                onComplete?.({
                    completedItems: visited.current.size,
                    totalItems: normalized.scenes.length,
                    earnedPoints: 0,
                });
            }
        }
    };
    const handleAdvance = (nextId: string | null) => {
        if (!nextId)
            return;
        const exists = normalized.scenes.some((s) => s.id === nextId);
        if (exists) {
            visited.current.add(nextId);
            setCurrentSceneId(nextId);
            setSelectedChoice(null);
        }
    };
    const handleReset = () => {
        onRestart?.();
        if (submitting.current)
            return;
        completed.current = false;
        visited.current = new Set([normalized.startSceneId]);
        setCurrentSceneId(normalized.startSceneId);
        setSelectedChoice(null);
    };
    if (!currentScene) {
        return (<div className="p-6 rounded-3xl bg-[#FAF6EE] text-[#102A38] text-sm font-bold">
        Tình huống chưa có cảnh nào.
      </div>);
    }
    return (<div data-testid="scenario-runtime" data-context={context} data-scene-id={currentScene.id} className="relative w-full rounded-[28px] overflow-hidden border border-[#12384B]/12 bg-[#FAF6EE] text-[#102A38] shadow-[0_12px_30px_rgba(16,42,56,0.12)] select-none">
      {/* Scene Illustration & Prompt Banner */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#102A38]">
        <img ref={illustration} src={currentScene.backgroundUrl} alt={currentScene.title} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2533]/85 via-[#0A2533]/25 to-transparent"/>

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-white/92 text-[#102A38] text-xs font-extrabold shadow-xs">
            {currentScene.title}
          </span>
          {(<button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white text-[#102A38] text-xs font-extrabold shadow-xs cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5"/>
              <span>Từ đầu</span>
            </button>)}
        </div>

        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-3 bg-[#FAF6EE]/95 backdrop-blur-xs rounded-2xl p-3 sm:p-3.5 border border-white/80 shadow-md">
          <button type="button" onClick={() => void oceanAudio.playNarration(currentScene.narrationUrl, currentScene.narrationText || currentScene.title)} className="w-10 h-10 rounded-xl bg-[#17657A] text-white flex items-center justify-center hover:bg-[#124E5E] transition-colors cursor-pointer shrink-0" aria-label="Nghe câu hỏi tình huống">
            <Volume2 className="w-5 h-5"/>
          </button>
          <p className="text-sm sm:text-base font-black text-[#102A38] leading-snug">
            {currentScene.narrationText}
          </p>
        </div>
      </div>

      {/* Choices or Terminal Celebration */}
      <div className="p-4 sm:p-5">
        {error && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-amber-950">{error}</p>}
        {!terminal ? (<>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentScene.choices.map((choice) => {
                const isSelected = selectedChoice?.id === choice.id;
                return (<button key={choice.id} type="button" disabled={!isInteractive} data-testid={`scenario-choice-${choice.id}`} onClick={() => handleSelectChoice(choice)} className={`group flex flex-col rounded-2xl overflow-hidden border-2 text-left transition-[background-color,border-color,box-shadow,color,opacity,transform] cursor-pointer ${isSelected
                        ? choice.isCorrect !== false
                            ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/20 shadow-md'
                            : 'bg-amber-50 border-amber-500 ring-4 ring-amber-500/20 shadow-md'
                        : 'bg-white border-[#12384B]/12 hover:border-[#17657A] hover:-translate-y-0.5 shadow-xs'}`}>
                    {choice.imageUrl && (<div className="w-full h-32 sm:h-36 overflow-hidden bg-slate-100">
                        <img src={choice.imageUrl} alt={choice.label} className="w-full h-full object-cover group-hover:scale-103 transition-transform"/>
                      </div>)}
                    <div className="p-3.5 flex items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-[#102A38]">
                        {choice.label}
                      </span>
                      {isSelected && (<CheckCircle2 className={`w-5 h-5 shrink-0 ${choice.isCorrect !== false ? 'text-emerald-600' : 'text-amber-600'}`}/>)}
                    </div>
                  </button>);
            })}
            </div>

            {selectedChoice && (<div role="status" data-testid="scenario-feedback" className={`mt-4 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 border ${selectedChoice.isCorrect !== false
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border-amber-200'}`}>
                <span className="text-xs sm:text-sm font-extrabold">
                  {selectedChoice.feedbackText}
                </span>
                {selectedChoice.nextSceneId && (<button type="button" data-testid="scenario-next-scene" onClick={() => handleAdvance(selectedChoice.nextSceneId)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#17657A] text-white text-xs font-extrabold hover:bg-[#124E5E] cursor-pointer">
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-3.5 h-3.5"/>
                  </button>)}
              </div>)}
          </>) : (<div data-testid="scenario-terminal-banner" className="p-5 rounded-2xl bg-emerald-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-amber-200 shrink-0"/>
              <div>
                <div className="text-base sm:text-lg font-black">
                  Hoàn thành tình huống: {currentScene.title}
                </div>
                <div className="text-xs sm:text-sm text-emerald-50 font-semibold">
                  {currentScene.narrationText}
                </div>
              </div>
            </div>
            {<button type="button" onClick={handleReset} className="px-4 py-2 rounded-full bg-white text-emerald-800 text-xs sm:text-sm font-extrabold hover:bg-emerald-50 cursor-pointer shrink-0">
              Chơi lại tình huống
            </button>}
          </div>)}
      </div>
    </div>);
}

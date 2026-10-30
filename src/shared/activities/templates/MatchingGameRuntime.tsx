import { useState, useMemo, useRef } from 'react';
import { Volume2, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { oceanAudio } from '../../audio/oceanAudio';
import { type ActivityRuntimeProps, type MatchingGameConfig, } from '../types';
export interface NormalizedMatchingPair {
    id: string;
    leftId: string;
    leftLabel: string;
    leftImageUrl: string;
    leftAudioUrl?: string;
    rightId: string;
    rightLabel: string;
    rightImageUrl: string;
    rightIsSilhouette: boolean;
    points: number;
}
export function normalizeMatchingConfig(raw: Record<string, unknown> | MatchingGameConfig): {
    instructionText: string;
    allowRetry: boolean;
    scoringEnabled: boolean;
    pairs: NormalizedMatchingPair[];
} {
    const c = (raw || {}) as MatchingGameConfig;
    const rawPairs = Array.isArray(c.pairs) ? c.pairs : [];
    const pairs: NormalizedMatchingPair[] = rawPairs.map((p: any, idx: number) => ({
        id: p.id || `pair-${idx + 1}`,
        leftId: p.left?.id || p.leftId || `L-${idx + 1}`,
        leftLabel: p.left?.label || p.leftLabel || `Hình ${idx + 1}`,
        leftImageUrl: p.leftImageUrl ?? p.left?.imageUrl ?? '',
        leftAudioUrl: p.leftAudioUrl,
        rightId: p.right?.id || p.rightId || `R-${idx + 1}`,
        rightLabel: p.right?.label || p.rightLabel || `Đôi bạn ${idx + 1}`,
        rightImageUrl: p.rightImageUrl ?? p.right?.imageUrl ?? '',
        rightIsSilhouette: Boolean(p.right?.isSilhouette),
        points: Number(p.points || 1),
    }));
    return {
        instructionText: c.instructionText || c.prompt || 'Chạm vào hai hình bạn sinh vật giống nhau nhé!',
        allowRetry: c.allowRetry !== false,
        scoringEnabled: c.scoringEnabled !== false,
        pairs,
    };
}
export function MatchingGameRuntime({ context, title, config, isPaused = false, readOnly = false, onPracticeFeedback, onComplete, onUsageInteraction, onRestart }: ActivityRuntimeProps) {
    const normalized = useMemo(() => normalizeMatchingConfig(config as MatchingGameConfig), [config]);
    const [selectedLeftPairId, setSelectedLeftPairId] = useState<string | null>(normalized.pairs[0]?.id || null);
    const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
    const [lockedLeftIds, setLockedLeftIds] = useState<Record<string, boolean>>({});
    const [attemptsByPairId, setAttemptsByPairId] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState<{
        isCorrect: boolean;
        message: string;
    } | null>(null);
    const [pending, setPending] = useState(false);
    const submitting = useRef(false);

    const isInteractive = !isPaused && !readOnly && !pending;
    const doneCount = normalized.pairs.filter((p) => matchedPairIds.includes(p.id) || lockedLeftIds[p.id]).length;
    const allCompleted = normalized.pairs.length > 0 && doneCount === normalized.pairs.length;
    const handleMatchRight = async (rightPairId: string) => {
        if (!isInteractive || !selectedLeftPairId)
            return;
        if (matchedPairIds.includes(rightPairId))
            return;
        if (matchedPairIds.includes(selectedLeftPairId) || lockedLeftIds[selectedLeftPairId])
            return;
        const leftPair = normalized.pairs.find((p) => p.id === selectedLeftPairId);
        const rightPair = normalized.pairs.find((p) => p.id === rightPairId);
        if (!leftPair || !rightPair)
            return;
        const pairAttempt = (attemptsByPairId[leftPair.id] || 0) + 1;


        let isCorrect = leftPair.id === rightPair.id;
        onUsageInteraction?.({type:'game_answer',itemId:leftPair.id,answerId:rightPair.id});
        if (submitting.current)
            return;
        submitting.current = true;
        setPending(true);

            submitting.current = false;
            setPending(false);

        setAttemptsByPairId(prev => ({ ...prev, [leftPair.id]: pairAttempt }));
        if (isCorrect) {
            const nextMatched = [...matchedPairIds, leftPair.id];
            setMatchedPairIds(nextMatched);
            const msg = `Chính xác! ${leftPair.leftLabel} đã ghép đúng đôi.`;
            setFeedback({ isCorrect: true, message: msg });
            oceanAudio.speak(msg);
            const nextUnmatched = normalized.pairs.find((p) => !nextMatched.includes(p.id) && !lockedLeftIds[p.id]);
            setSelectedLeftPairId(nextUnmatched ? nextUnmatched.id : null);
            {
                onPracticeFeedback?.({
                    itemId: leftPair.id,
                    isCorrect: true,
                    message: msg,
                });
            }
            const nextDone = normalized.pairs.filter((p) => nextMatched.includes(p.id) || lockedLeftIds[p.id]).length;
            if (nextDone === normalized.pairs.length) {
                onComplete?.({
                    completedItems: nextMatched.length,
                    totalItems: normalized.pairs.length,
                    earnedPoints: 0,
                });
            }
        }
        else {
            const msg = normalized.allowRetry
                ? 'Chưa trùng khớp rồi! Bé quan sát kỹ hình dáng và thử lại nhé.'
                : 'Chưa trùng khớp rồi! Lượt ghép của mục này đã được khóa.';
            setFeedback({ isCorrect: false, message: msg });
            oceanAudio.speak(msg);
            let nextLocked = lockedLeftIds;
            if (!normalized.allowRetry) {
                nextLocked = { ...lockedLeftIds, [leftPair.id]: true };
                setLockedLeftIds(nextLocked);
                const nextUnmatched = normalized.pairs.find((p) => !matchedPairIds.includes(p.id) && !nextLocked[p.id]);
                setSelectedLeftPairId(nextUnmatched ? nextUnmatched.id : null);
            }
            {
                onPracticeFeedback?.({
                    itemId: leftPair.id,
                    isCorrect: false,
                    message: msg,
                });
            }
            if (!normalized.allowRetry) {
                const nextDone = normalized.pairs.filter((p) => matchedPairIds.includes(p.id) || nextLocked[p.id]).length;
                if (nextDone === normalized.pairs.length) {
                    onComplete?.({
                        completedItems: matchedPairIds.length,
                        totalItems: normalized.pairs.length,
                        earnedPoints: 0,
                    });
                }
            }
        }
    };
    const handleReset = () => {
        onRestart?.();
        if (submitting.current)
            return;
        setMatchedPairIds([]);
        setLockedLeftIds({});
        setFeedback(null);
        setSelectedLeftPairId(normalized.pairs[0]?.id || null);
    };
    // Deterministic right column order (rotated by 1 so it isn't trivially aligned row-by-row)
    const rightOrder = useMemo(() => {
        if (normalized.pairs.length <= 1)
            return normalized.pairs;
        return [...normalized.pairs.slice(1), normalized.pairs[0]];
    }, [normalized.pairs]);
    return (<div data-testid="matching-game-runtime" data-context={context} className="relative w-full rounded-[28px] overflow-hidden border border-[#12384B]/12 bg-[#FAF6EE] text-[#102A38] p-4 sm:p-6 shadow-[0_12px_28px_rgba(16,42,56,0.1)] select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => oceanAudio.speak(normalized.instructionText)} className="w-10 h-10 rounded-xl bg-[#17657A] text-white flex items-center justify-center hover:bg-[#124E5E] transition-colors cursor-pointer shrink-0" aria-label="Nghe câu lệnh">
            <Volume2 className="w-5 h-5"/>
          </button>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#17657A]">
              {title}
            </div>
            <div className="text-base sm:text-lg font-black text-[#102A38]">
              {normalized.instructionText}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#12384B]/12 text-xs font-extrabold text-[#102A38]">
            Đã ghép: {matchedPairIds.length}/{normalized.pairs.length}
          </span>
          {(<button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#12384B]/15 text-xs font-extrabold text-[#102A38] hover:bg-slate-50 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5"/>
              <span>Làm lại</span>
            </button>)}
        </div>
      </div>

      {feedback && (<div role="status" data-testid="matching-feedback" data-feedback={feedback.isCorrect ? 'correct' : 'retry'} className={`mb-4 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold border ${feedback.isCorrect
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
          {feedback.message}
        </div>)}

      {allCompleted && (<div data-testid="matching-complete-banner" className="mb-4 p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-200"/>
            <span className="font-black text-sm sm:text-base">
              Tuyệt vời! Bé đã hoàn thành lượt tìm đôi bạn biển.
            </span>
          </div>
          {(<button type="button" onClick={handleReset} className="px-4 py-1.5 rounded-full bg-white text-emerald-800 text-xs font-extrabold cursor-pointer">
              Chơi lại
            </button>)}
        </div>)}

      {/* Two Columns: Left Items & Right Matches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#416070]">
            1. Chọn bạn sinh vật
          </div>
          {normalized.pairs.map((pair) => {
            const isMatched = matchedPairIds.includes(pair.id);
            const isLocked = Boolean(lockedLeftIds[pair.id]);
            const isDone = isMatched || isLocked;
            const isSelected = selectedLeftPairId === pair.id && !isDone;
            return (<button key={pair.id} type="button" disabled={isDone || !isInteractive} data-response={isMatched ? 'correct' : undefined} data-match-side="left" data-testid={`matching-left-${pair.id}`} onClick={() => {
                    if (!isDone && isInteractive) {
                        setSelectedLeftPairId(pair.id);
                        void oceanAudio.playNarration(pair.leftAudioUrl, pair.leftLabel);
                    }
                }} className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 transition-[background-color,border-color,box-shadow,color,opacity,transform] min-h-[76px] cursor-pointer ${isMatched
                    ? 'bg-emerald-50 border-emerald-300 opacity-65'
                    : isLocked
                        ? 'bg-amber-50 border-amber-300 opacity-65'
                        : isSelected
                            ? 'bg-white border-[#DC6B52] ring-4 ring-[#DC6B52]/20 shadow-md'
                            : 'bg-white border-[#12384B]/12 hover:border-[#17657A]'}`}>
                <div className="flex items-center gap-3">
                  <img src={pair.leftImageUrl || undefined} alt={pair.leftLabel} className="w-14 h-14 object-contain rounded-xl bg-[#F4EFE6] p-1.5"/>
                  <span className="text-sm sm:text-base font-extrabold text-[#102A38]">
                    {pair.leftLabel}
                  </span>
                </div>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/>}
              </button>);
        })}
        </div>

        <div className="space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#416070]">
            2. Chạm vào hình tương ứng
          </div>
          {rightOrder.map((pair) => {
            const isMatched = matchedPairIds.includes(pair.id);
            return (<button key={pair.id} type="button" disabled={isMatched || !isInteractive} data-response={isMatched ? 'correct' : undefined} data-match-side="right" data-testid={`matching-right-${pair.id}`} onClick={() => handleMatchRight(pair.id)} className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 transition-[background-color,border-color,box-shadow,color,opacity,transform] min-h-[76px] cursor-pointer ${isMatched
                    ? 'bg-emerald-50 border-emerald-300 opacity-65'
                    : 'bg-white border-[#12384B]/12 hover:border-[#17657A] hover:shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <img src={pair.rightImageUrl || undefined} alt={pair.rightLabel} className={`w-14 h-14 object-contain rounded-xl bg-[#F4EFE6] p-1.5 ${pair.rightIsSilhouette ? 'brightness-0 contrast-200 opacity-80' : ''}`}/>
                  <span className="text-sm sm:text-base font-extrabold text-[#102A38]">
                    {pair.rightLabel}
                  </span>
                </div>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/>}
              </button>);
        })}
        </div>
      </div>
    </div>);
}

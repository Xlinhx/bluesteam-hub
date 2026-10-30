import { useState, useMemo, useRef } from 'react';
import { Volume2, RotateCcw, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { oceanAudio } from '../../audio/oceanAudio';
import { type ActivityRuntimeProps, type ChoiceGameConfig, type ChoiceQuestionItem, } from '../types';
export function normalizeChoiceConfig(raw: Record<string, unknown> | ChoiceGameConfig): {
    instructionText: string;
    allowRetry: boolean;
    scoringEnabled: boolean;
    questions: ChoiceQuestionItem[];
} {
    const c = (raw || {}) as ChoiceGameConfig;
    const rawQuestions = Array.isArray(c.questions) ? c.questions : [];
    const questions: ChoiceQuestionItem[] = rawQuestions.map((q: any, idx: number) => ({
        id: q.id || `q-${idx + 1}`,
        promptText: q.promptText || q.prompt || `Câu hỏi ${idx + 1}`,
        audioText: q.audioText || q.promptText || q.prompt,
        audioUrl: q.audioUrl,
        feedbackAudioUrl: q.feedbackAudioUrl,
        options: Array.isArray(q.options)
            ? q.options.map((opt: any, oIdx: number) => ({
                id: opt.id || `opt-${oIdx + 1}`,
                label: opt.label || `Lựa chọn ${oIdx + 1}`,
                imageUrl: opt.imageUrl || '',
            }))
            : [],
        correctOptionId: q.correctOptionId || '',
        feedbackText: q.feedbackText || 'Chính xác! Bé giỏi lắm.',
        points: Number(q.points || 1),
    }));
    return {
        instructionText: c.instructionText || questions[0]?.promptText || 'Bé hãy chạm vào đáp án đúng nhé!',
        allowRetry: c.allowRetry !== false,
        scoringEnabled: c.scoringEnabled !== false,
        questions,
    };
}
export function ChoiceGameRuntime({ context, title, config, isPaused = false, readOnly = false, onPracticeFeedback, onComplete, onUsageInteraction, onRestart }: ActivityRuntimeProps) {
    const normalized = useMemo(() => normalizeChoiceConfig(config as ChoiceGameConfig), [config]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [answeredIds, setAnsweredIds] = useState<Record<string, boolean>>({});
    const [lockedQuestionIds, setLockedQuestionIds] = useState<Record<string, boolean>>({});
    const [attemptsByQuestionId, setAttemptsByQuestionId] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState<{
        isCorrect: boolean;
        message: string;
    } | null>(null);
    const [pending, setPending] = useState(false);
    const submitting = useRef(false);

    const isInteractive = !isPaused && !readOnly && !pending;
    const currentQuestion = normalized.questions[currentIdx] || normalized.questions[0];
    const doneCount = normalized.questions.filter((q) => answeredIds[q.id] || lockedQuestionIds[q.id]).length;
    const allCompleted = normalized.questions.length > 0 && doneCount === normalized.questions.length;
    const handleSelectOption = async (optionId: string) => {
        if (!isInteractive || !currentQuestion)
            return;
        if (answeredIds[currentQuestion.id] || lockedQuestionIds[currentQuestion.id])
            return;
        const qAttempt = (attemptsByQuestionId[currentQuestion.id] || 0) + 1;

        let isCorrect = optionId === currentQuestion.correctOptionId;
        onUsageInteraction?.({type:'game_answer',itemId:currentQuestion.id,answerId:optionId});
        if (submitting.current)
            return;
        submitting.current = true;
        setPending(true);

            submitting.current = false;
            setPending(false);

        setSelectedOptionId(optionId);
        setAttemptsByQuestionId(prev => ({ ...prev, [currentQuestion.id]: qAttempt }));
        if (isCorrect) {
            const nextAnswered = { ...answeredIds, [currentQuestion.id]: true };
            setAnsweredIds(nextAnswered);
            const msg = currentQuestion.feedbackText || 'Đúng rồi! Bé đã chọn chính xác bạn sinh vật.';
            setFeedback({ isCorrect: true, message: msg });
            void oceanAudio.playNarration(currentQuestion.feedbackAudioUrl, msg);
            {
                onPracticeFeedback?.({
                    itemId: currentQuestion.id,
                    isCorrect: true,
                    message: msg,
                });
            }
            const nextDone = normalized.questions.filter((q) => nextAnswered[q.id] || lockedQuestionIds[q.id]).length;
            if (nextDone === normalized.questions.length) {
                onComplete?.({
                    completedItems: Object.keys(nextAnswered).length,
                    totalItems: normalized.questions.length,
                    earnedPoints: 0,
                });
            }
        }
        else {
            const msg = normalized.allowRetry
                ? 'Chưa đúng rồi! Bé hãy nghe lại câu hỏi và chọn bạn khác nhé.'
                : 'Chưa đúng rồi! Câu hỏi này chỉ cho phép trả lời một lần.';
            setFeedback({ isCorrect: false, message: msg });
            oceanAudio.speak(msg);
            let nextLocked = lockedQuestionIds;
            if (!normalized.allowRetry) {
                nextLocked = { ...lockedQuestionIds, [currentQuestion.id]: true };
                setLockedQuestionIds(nextLocked);
            }
            {
                onPracticeFeedback?.({
                    itemId: currentQuestion.id,
                    isCorrect: false,
                    message: msg,
                });
            }
            if (!normalized.allowRetry) {
                const nextDone = normalized.questions.filter((q) => answeredIds[q.id] || nextLocked[q.id]).length;
                if (nextDone === normalized.questions.length) {
                    onComplete?.({
                        completedItems: Object.keys(answeredIds).length,
                        totalItems: normalized.questions.length,
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
        setCurrentIdx(0);
        setSelectedOptionId(null);
        setAnsweredIds({});
        setLockedQuestionIds({});
        setFeedback(null);
    };
    if (!currentQuestion) {
        return (<div className="p-6 rounded-3xl bg-[#FAF6EE] text-[#102A38] text-sm font-bold">
        Trò chơi chưa có câu hỏi nào.
      </div>);
    }
    return (<div data-testid="choice-game-runtime" data-context={context} className="relative w-full rounded-[28px] overflow-hidden border border-[#12384B]/12 bg-[#FAF6EE] text-[#102A38] p-4 sm:p-6 shadow-[0_12px_28px_rgba(16,42,56,0.1)] select-none">
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void oceanAudio.playNarration(currentQuestion.audioUrl, currentQuestion.promptText || normalized.instructionText)} className="w-10 h-10 rounded-xl bg-[#17657A] text-white flex items-center justify-center hover:bg-[#124E5E] transition-colors cursor-pointer shrink-0" aria-label="Nghe câu hỏi">
            <Volume2 className="w-5 h-5"/>
          </button>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#17657A]">
              {title} • Câu {currentIdx + 1}/{normalized.questions.length}
            </div>
            <div className="text-base sm:text-xl font-black text-[#102A38]">
              {currentQuestion.promptText}
            </div>
          </div>
        </div>

        {(<button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#12384B]/15 text-xs font-extrabold text-[#102A38] hover:bg-slate-50 cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5"/>
            <span>Làm lại</span>
          </button>)}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectChoice = opt.id === currentQuestion.correctOptionId;
            const isQuestionSolved = Boolean(answeredIds[currentQuestion.id]);
            const isQuestionLocked = Boolean(lockedQuestionIds[currentQuestion.id]);
            return (<button key={opt.id} type="button" disabled={!isInteractive || isQuestionSolved || isQuestionLocked} data-response={isSelected ? isCorrectChoice ? 'correct' : 'retry' : undefined} data-testid={`choice-option-${opt.id}`} onClick={() => handleSelectOption(opt.id)} className={`group flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-[background-color,border-color,box-shadow,color,opacity,transform] min-h-[180px] cursor-pointer ${isSelected && isCorrectChoice
                    ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/20 shadow-md'
                    : isSelected && !isCorrectChoice
                        ? 'bg-amber-50 border-amber-500'
                        : isQuestionSolved && isCorrectChoice
                            ? 'bg-emerald-50/70 border-emerald-400'
                            : 'bg-white border-[#12384B]/12 hover:border-[#17657A] hover:-translate-y-0.5 shadow-xs'}`}>
              <div className="w-full h-28 flex items-center justify-center rounded-xl bg-[#F4EFE6] p-3 mb-3">
                {opt.imageUrl && (<img src={opt.imageUrl} alt={opt.label} className="max-h-24 w-auto object-contain group-hover:scale-105 transition-transform"/>)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#102A38]">{opt.label}</span>
                {isQuestionSolved && isCorrectChoice && (<CheckCircle2 className="w-5 h-5 text-emerald-600"/>)}
              </div>
            </button>);
        })}
      </div>

      {/* Feedback & Next Button */}
      {feedback && (<div role="status" data-testid="choice-feedback" data-feedback={feedback.isCorrect ? 'correct' : 'retry'} className={`mt-4 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 border ${feedback.isCorrect
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-amber-50 text-amber-950 border-amber-200'}`}>
          <span className="text-xs sm:text-sm font-extrabold">{feedback.message}</span>
          {(feedback.isCorrect || lockedQuestionIds[currentQuestion.id]) &&
                currentIdx < normalized.questions.length - 1 && (<button type="button" data-testid="choice-next-question" onClick={() => {
                    setCurrentIdx((idx) => idx + 1);
                    setSelectedOptionId(null);
                    setFeedback(null);
                }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#17657A] text-white text-xs font-extrabold hover:bg-[#124E5E] cursor-pointer">
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </button>)}
        </div>)}

      {allCompleted && (<div data-testid="choice-complete-banner" className="mt-4 p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-200"/>
            <span className="text-sm font-black">
              Bé đã trả lời đúng tất cả {normalized.questions.length} câu hỏi!
            </span>
          </div>
          <button type="button" onClick={handleReset} className="px-4 py-1.5 rounded-full bg-white text-emerald-800 text-xs font-extrabold cursor-pointer">
            Chơi lại
          </button>
        </div>)}
    </div>);
}

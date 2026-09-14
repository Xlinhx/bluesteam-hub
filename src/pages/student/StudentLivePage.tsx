import { useState, useEffect } from 'react';
import { useRouter } from '../../app/router';
import { useTheme } from '../../themes/ThemeProvider';
import { defaultSessionTransport } from '../../demo/session-transport/transport';
import { demoStore } from '../../demo/storage/demoStore';
import { getExperienceById } from '../../content/seed';
import { renderExperience } from '../../experiences/registry';
import { PacingMode } from '../../domain/session/types';
import {
  Radio,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Check,
  Lock,
} from 'lucide-react';

export function StudentLivePage() {
  const { navigate } = useRouter();
  useTheme();

  const [activeSession, setActiveSession] = useState(() => demoStore.getActiveSession());
  const [pacingMode, setPacingMode] = useState<PacingMode>(activeSession?.pacingMode || 'guided');
  const [currentExpId, setCurrentExpId] = useState<string>(
    activeSession?.currentExperienceId || 'exp-sim-water-column'
  );

  const [livePrompt, setLivePrompt] = useState<{
    question: string;
    options: { id: string; label: string }[];
  } | null>(null);

  const [submittedChoice, setSubmittedChoice] = useState<string | null>(null);

  const experience = getExperienceById(currentExpId) || getExperienceById('exp-sim-water-column')!;

  useEffect(() => {
    const unsubscribe = defaultSessionTransport.subscribe((msg) => {
      if (msg.type === 'EXPERIENCE_CHANGED') {
        const payload = msg.payload as { experienceId: string };
        if (payload?.experienceId && pacingMode === 'guided') {
          setCurrentExpId(payload.experienceId);
        }
      }
      if (msg.type === 'PACING_CHANGED') {
        const payload = msg.payload as { pacingMode: PacingMode };
        if (payload?.pacingMode) {
          setPacingMode(payload.pacingMode);
        }
      }
      if (msg.type === 'PROMPT_OPENED') {
        const payload = msg.payload as {
          question: string;
          options: { id: string; label: string }[];
        };
        if (payload?.question) {
          setLivePrompt({
            question: payload.question,
            options: payload.options || [
              { id: 'opt-a', label: 'Option A' },
              { id: 'opt-b', label: 'Option B' },
            ],
          });
          setSubmittedChoice(null);
        }
      }
      if (msg.type === 'PROMPT_CLOSED') {
        setLivePrompt(null);
      }
      if (msg.type === 'SESSION_ENDED') {
        setActiveSession(null);
        navigate('/student');
      }
    });

    return unsubscribe;
  }, [pacingMode, navigate]);

  const handleSubmitResponse = (choiceId: string) => {
    setSubmittedChoice(choiceId);
    defaultSessionTransport.send('RESPONSE_SUBMITTED', {
      studentId: 'student-elena',
      choiceId,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-surface text-ink-primary pb-28">
      {/* Synchronized Classroom Live Header */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-borderUi-soft/60">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student')}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-interactive border border-borderUi-soft text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            title="Leave Session"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Studio 104 Live Session
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-sunken text-ink-muted">
                Pacing: {pacingMode.toUpperCase()}
              </span>
            </div>
            <h1 className="font-serif font-bold text-lg text-ink-primary leading-tight">
              {experience.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {pacingMode === 'guided' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-sunken text-ink-muted border border-borderUi-soft">
              <Lock className="w-3.5 h-3.5" />
              <span>Teacher Navigation Sync</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Surface Viewport */}
      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Active Teacher Inquiry Prompt Alert Modal */}
        {livePrompt && (
          <div className="bg-amber-950/30 border-2 border-amber-500/80 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Teacher Inquiry Prompt — Submit Your Prediction</span>
            </div>

            <h3 className="text-xl font-serif font-bold text-ink-primary">
              {livePrompt.question}
            </h3>

            {/* Tap-to-submit prediction choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {livePrompt.options.map((opt) => {
                const isSelected = submittedChoice === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSubmitResponse(opt.id)}
                    className={`p-4 rounded-xl border text-center font-mono text-xs font-bold transition-all cursor-pointer touch-target-child flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400'
                        : 'bg-surface-elevated hover:bg-surface-interactive border-borderUi-strong text-ink-primary'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            {submittedChoice && (
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-mono text-center pt-1 flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Response transmitted to teacher console.</span>
              </p>
            )}
          </div>
        )}

        {/* Pacing Mode Observe Screen vs Interactive Canvas */}
        {pacingMode === 'observe' ? (
          <div className="bg-surface-elevated rounded-3xl p-12 border border-borderUi-soft text-center space-y-4 max-w-2xl mx-auto my-12 shadow-md">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-ink-primary">
              Look Up at the Classroom Screen
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Dr. Vance is demonstrating the active simulation on the main wall projection. Follow along and be ready to answer inquiry prompts!
            </p>
          </div>
        ) : (
          <div>
            {renderExperience({
              experience,
              isTeacher: false,
              isPresentation: false,
              sessionId: activeSession?.id || 'demo-session',
            })}
          </div>
        )}
      </main>
    </div>
  );
}

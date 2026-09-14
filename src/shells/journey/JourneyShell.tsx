import React from 'react';
import { useRouter } from '../../app/router';
import { useTheme } from '../../themes/ThemeProvider';
import { SEED_PATHS } from '../../content/seed/paths';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface JourneyShellProps {
  children?: React.ReactNode;
  activePathId?: string;
  onSelectStep?: (unitId: string, experienceId: string) => void;
}

export function JourneyShell({
  children,
  activePathId = 'path-abyssal-expedition',
  onSelectStep,
}: JourneyShellProps) {
  const { navigate } = useRouter();
  const { theme } = useTheme();
  const path = SEED_PATHS.find((p) => p.id === activePathId) || SEED_PATHS[0];

  const isTactile = theme === 'tactile';

  return (
    <div className="w-full space-y-6">
      {/* Journey Expedition Ribbon Header */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isTactile
            ? 'bg-[#1e2732] border-slate-700 shadow-xl'
            : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Active Guided Expedition</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-sunken text-ink-muted">
                Step 2 of {path.steps.length}
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-ink-primary">
              {path.title}
            </h2>
            <p className="text-xs text-ink-secondary">{path.tagline}</p>
          </div>

          <button
            onClick={() => navigate('/student/experience/exp-sim-water-column')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-mono font-bold rounded-xl shadow hover:opacity-90 transition-all cursor-pointer touch-target-child"
          >
            <span>Continue Expedition</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chronological Waypoint Stepper Trail */}
        <div className="mt-6 pt-4 border-t border-borderUi-soft/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {path.steps.map((step) => {
              const isCompleted = step.order < 2;
              const isCurrent = step.order === 2;
              const isLocked = step.order > 2;

              return (
                <div
                  key={step.order}
                  onClick={() => !isLocked && onSelectStep?.(step.unitId, step.recommendedExperienceId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-primary/10 border-brand-primary ring-2 ring-brand-primary shadow-md'
                      : isCompleted
                      ? 'bg-surface-elevated/70 border-emerald-500/40 opacity-90'
                      : 'bg-surface-sunken/40 border-borderUi-soft opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Waypoint 0{step.order}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-ink-muted" />
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-ink-primary line-clamp-1">
                    {step.waypointName}
                  </h4>
                  <p className="text-[10px] text-ink-muted mt-0.5">
                    {isCurrent ? 'Current Target' : isCompleted ? 'Explored' : 'Locked Station'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

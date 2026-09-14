import React from 'react';
import { useRouter } from '../../app/router';
import { useTheme } from '../../themes/ThemeProvider';
import { demoStore } from '../../demo/storage/demoStore';
import {
  Users,
  Radio,
  ArrowRight,
  Tv,
} from 'lucide-react';

interface ClassroomShellProps {
  children?: React.ReactNode;
  isTeacher?: boolean;
}

export function ClassroomShell({
  children,
  isTeacher = false,
}: ClassroomShellProps) {
  const { navigate } = useRouter();
  const { theme } = useTheme();
  const activeSession = demoStore.getActiveSession();

  const isTactile = theme === 'tactile';
  const hasLiveSession = activeSession && activeSession.status === 'active';

  return (
    <div className="w-full space-y-6">
      {/* Live Classroom Orchestration Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isTactile
            ? 'bg-[#1a232c] border-slate-700 shadow-xl'
            : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Classroom Orchestration Subsystem</span>
              </span>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                  hasLiveSession
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold animate-pulse'
                    : 'bg-surface-sunken text-ink-muted'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>{hasLiveSession ? 'Session Live Now' : 'Class Ready'}</span>
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-ink-primary">
              Studio 104 · Early Marine Explorers
            </h2>
            <p className="text-xs text-ink-secondary">
              {hasLiveSession
                ? `Synchronized with ${activeSession.participants.length} connected student tablets.`
                : 'Whole-class interactive inquiry ready to launch.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTeacher ? (
              <>
                <button
                  onClick={() => navigate('/teacher/session/demo-session')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-mono font-bold rounded-xl shadow hover:opacity-90 transition-all cursor-pointer touch-target-child"
                >
                  <Radio className="w-4 h-4" />
                  <span>Open Teacher Console</span>
                </button>
                <button
                  onClick={() => navigate('/session/demo-session/present')}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-elevated border border-borderUi-strong text-ink-primary text-xs font-mono rounded-xl hover:bg-surface-interactive transition-colors cursor-pointer"
                  title="Open Projector Presentation Surface"
                >
                  <Tv className="w-4 h-4" />
                  <span>Present View</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/session/demo-session/student')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg transition-all cursor-pointer touch-target-child"
              >
                <Radio className="w-4 h-4 animate-ping" />
                <span>Join Live Activity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

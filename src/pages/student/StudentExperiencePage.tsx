import { useRouter, matchRoute } from '../../app/router';
import { useTheme } from '../../themes/ThemeProvider';
import { getExperienceById, getUnitById } from '../../content/seed';
import { renderExperience } from '../../experiences/registry';
import {
  ArrowLeft,
  Tv,
} from 'lucide-react';

export function StudentExperiencePage() {
  const { currentPath, navigate } = useRouter();
  useTheme();

  // Extract experienceId from URL: /student/experience/:experienceId
  const match = matchRoute('/student/experience/:experienceId', currentPath);
  const experienceId = match.params.experienceId || 'exp-sim-water-column';

  const experience = getExperienceById(experienceId) || getExperienceById('exp-sim-water-column')!;
  const unit = getUnitById(experience.unitId);

  return (
    <div className="min-h-screen bg-surface text-ink-primary pb-28">
      {/* Top Experience Navigation Bar */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-borderUi-soft/60">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student')}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-interactive border border-borderUi-soft text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            title="Return to Student Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
              <span>{unit ? unit.title : 'Ocean Science'}</span>
              <span>/</span>
              <span className="capitalize text-brand-primary">{experience.type}</span>
            </div>
            <h1 className="font-serif font-bold text-lg text-ink-primary leading-tight">
              {experience.title}
            </h1>
          </div>
        </div>

        {/* Presentation Shortcut */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => navigate(`/present/${experience.id}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-interactive border border-borderUi-soft text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            title="Project this experience in clean public view"
          >
            <Tv className="w-4 h-4 text-brand-primary" />
            <span className="hidden sm:inline">Present Screen</span>
          </button>
        </div>
      </header>

      {/* Main Experience Viewport */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {renderExperience({
          experience,
          isTeacher: false,
          isPresentation: false,
          onPresentationRequest: () => navigate(`/present/${experience.id}`),
        })}
      </main>
    </div>
  );
}

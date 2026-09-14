import { useState } from 'react';
import { useRouter } from '../../app/router';
import { useTheme } from '../../themes/ThemeProvider';
import { SEED_UNITS } from '../../content/seed/units';
import { SEED_PATHS } from '../../content/seed/paths';
import {
  Compass,
  ArrowRight,
} from 'lucide-react';

type ExploreFilter = 'all' | 'depth' | 'geology' | 'life';

export function StudentExplorePage() {
  const { ia, navigate } = useRouter();
  useTheme();
  const [selectedFilter, setSelectedFilter] = useState<ExploreFilter>('all');

  const activePath = SEED_PATHS[0];

  const filteredUnits = SEED_UNITS.filter((unit) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'depth') return unit.tagIds.includes('depth');
    if (selectedFilter === 'geology') return unit.tagIds.includes('geology');
    if (selectedFilter === 'life') return unit.tagIds.includes('biodiversity');
    return true;
  });

  const filterTabs: { id: ExploreFilter; label: string }[] = [
    { id: 'all', label: 'All Exhibits' },
    { id: 'depth', label: 'Depth & Light' },
    { id: 'geology', label: 'Geology' },
    { id: 'life', label: 'Deep Creatures' },
  ];

  return (
    <div className="min-h-screen bg-surface text-ink-primary pb-24">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-borderUi-soft/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-ink-primary leading-tight">
              {ia === 'journey' ? 'Expedition Depth Map' : 'Natural History Exhibits'}
            </h1>
            <span className="font-mono text-[11px] text-ink-muted">
              {ia === 'journey' ? 'Continuous Vertical Descent' : 'Thematic Marine Science Gallery'}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/student')}
          className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-interactive border border-borderUi-soft text-xs font-mono text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
        >
          Back to Student Home
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* IA Variation 1 & 2: Journey Mode — Vertical Waypoint Descent */}
        {ia === 'journey' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary block mb-1">
                Expedition Pathway
              </span>
              <h2 className="text-3xl font-serif font-bold text-ink-primary">
                {activePath.title}
              </h2>
              <p className="text-sm text-ink-secondary mt-1 leading-relaxed">
                Follow the scientific vertical stations from the warm sunlit surface down into the perpetual midnight of the ocean trenches.
              </p>
            </div>

            {/* Vertical Trail Steps */}
            <div className="relative border-l-2 border-brand-primary/40 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8 my-8">
              {activePath.steps.map((step) => {
                const unit = SEED_UNITS.find((u) => u.id === step.unitId) || SEED_UNITS[0];
                const isCurrent = step.order === 2;

                return (
                  <div key={step.order} className="relative group">
                    {/* Node Dot on Timeline */}
                    <div
                      className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold ${
                        isCurrent
                          ? 'bg-brand-primary border-white text-white ring-4 ring-brand-primary/30'
                          : 'bg-surface-elevated border-brand-primary text-brand-primary'
                      }`}
                    >
                      0{step.order}
                    </div>

                    {/* Step Card */}
                    <div
                      onClick={() => navigate(`/student/experience/${step.recommendedExperienceId}`)}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                        isCurrent
                          ? 'bg-surface-elevated border-brand-primary ring-1 ring-brand-primary/50'
                          : 'bg-surface hover:bg-surface-elevated border-borderUi-soft'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary">
                          {step.waypointName}
                        </span>
                        <span className="text-xs font-mono text-ink-muted">
                          {isCurrent ? '● Active Target' : 'Available Station'}
                        </span>
                      </div>

                      <h3 className="text-xl font-serif font-bold text-ink-primary mb-1">
                        {unit.title}
                      </h3>
                      <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed mb-4">
                        {unit.summary}
                      </p>

                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-brand-primary text-white text-xs font-mono font-bold rounded-xl shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5">
                          <span>Enter Waypoint</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono text-ink-muted">
                          ~{unit.estimatedTotalMinutes} mins
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* IA Variation 3 & 4: Explore Mode — Gallery Breadth */}
        {ia === 'explore' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary block mb-1">
                  Exhibits & Sandboxes
                </span>
                <h2 className="text-3xl font-serif font-bold text-ink-primary">
                  The Natural History Collection
                </h2>
                <p className="text-sm text-ink-secondary mt-1">
                  Select any marine science phenomenon to begin direct experimentation.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-surface-elevated p-1 rounded-xl border border-borderUi-soft">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      selectedFilter === tab.id
                        ? 'bg-brand-primary text-white font-semibold'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => navigate(`/student/unit/${unit.id}`)}
                  className="bg-surface-elevated rounded-2xl p-6 border border-borderUi-soft hover:border-brand-primary shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
                      <span className="capitalize">{unit.ageBand}</span>
                      <span>~{unit.estimatedTotalMinutes} mins</span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-ink-primary">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3">
                      {unit.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {unit.concepts.slice(0, 2).map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-surface-sunken text-ink-muted text-[10px] font-mono"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-borderUi-soft/60 flex items-center justify-between">
                    <span className="text-xs font-mono text-brand-primary font-bold">
                      Open Unit Exhibits
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IA Variation 5 & 6: Classroom Mode — Assigned Modules Queue */}
        {ia === 'classroom' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Assigned Curriculum Queue
              </span>
              <h2 className="text-3xl font-serif font-bold text-ink-primary">
                Kindergarten Marine Exploration Syllabus
              </h2>
              <p className="text-sm text-ink-secondary mt-1 leading-relaxed">
                Units ordered according to Dr. Vance's curriculum schedule for Studio 104.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {SEED_UNITS.map((unit, idx) => (
                <div
                  key={unit.id}
                  onClick={() => navigate(`/student/unit/${unit.id}`)}
                  className="p-5 rounded-2xl bg-surface-elevated border border-borderUi-soft hover:border-brand-primary transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-sunken font-mono font-bold text-xs text-ink-muted flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-ink-primary">
                        {unit.title}
                      </h3>
                      <p className="text-xs text-ink-muted line-clamp-1">{unit.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-ink-muted">
                      {unit.experienceIds.length} experiences
                    </span>
                    <button className="px-3.5 py-1.5 bg-brand-primary text-white text-xs font-mono rounded-lg hover:opacity-90">
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

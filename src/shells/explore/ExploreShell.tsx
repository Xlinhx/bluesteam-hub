import React, { useState } from 'react';
import { useRouter } from '../../app/router';
import { useTheme } from '../../themes/ThemeProvider';
import { SEED_COLLECTIONS } from '../../content/seed/collections';
import {
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ExploreShellProps {
  children?: React.ReactNode;
  activeCategoryId?: string;
  onSelectCategory?: (catId: string) => void;
}

export function ExploreShell({
  children,
  activeCategoryId = 'all',
  onSelectCategory,
}: ExploreShellProps) {
  const { navigate } = useRouter();
  const { theme } = useTheme();
  const [selectedCat, setSelectedCat] = useState(activeCategoryId);

  const categories = [
    { id: 'all', label: 'All Exhibits' },
    { id: 'depth-zones', label: 'Vertical Depth Zones' },
    { id: 'geology', label: 'Seafloor Geology' },
    { id: 'biodiversity', label: 'Deep Biodiversity' },
  ];

  const handleCategoryClick = (catId: string) => {
    setSelectedCat(catId);
    onSelectCategory?.(catId);
  };

  const isTactile = theme === 'tactile';

  return (
    <div className="w-full space-y-6">
      {/* Natural History Discovery Gallery Header */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isTactile
            ? 'bg-[#18232c] border-slate-700 shadow-xl'
            : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Open Discovery Gallery</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-sunken text-ink-muted">
                {SEED_COLLECTIONS.length} Curated Collections
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-ink-primary">
              Oceanic Natural History Exhibits
            </h2>
            <p className="text-xs text-ink-secondary">
              Freely explore interactive simulations, specimens, and acoustic recordings across marine zones.
            </p>
          </div>

          <button
            onClick={() => navigate('/student/experience/exp-sim-water-column')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-mono font-bold rounded-xl shadow hover:opacity-90 transition-all cursor-pointer touch-target-child"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Featured Sim</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thematic Category Filter Bar */}
        <div className="mt-5 pt-4 border-t border-borderUi-soft/60 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-primary text-white font-semibold shadow-sm'
                    : 'bg-surface-interactive text-ink-secondary hover:text-ink-primary border border-borderUi-soft/70'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}

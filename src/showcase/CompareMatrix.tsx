import { useState } from 'react';
import { useRouter } from '../app/router';
import { useTheme } from '../themes/ThemeProvider';
import { VARIANTS, VariantId } from '../domain/variant/types';
import {
  Compass,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export type CompareSurface =
  | 'landing'
  | 'student-home'
  | 'explore-journey'
  | 'teacher-dashboard'
  | 'water-simulation'
  | 'classroom-live';

const SURFACES: { id: CompareSurface; label: string; route: string; description: string }[] = [
  {
    id: 'landing',
    label: 'Landing & Whale Hero',
    route: '/',
    description: 'How the 3D whale hero, typography, and atmospheric depth orient the first-time visitor without edtech marketing sludge.',
  },
  {
    id: 'student-home',
    label: 'Student Home',
    route: '/student',
    description: 'Comparison of progression-first (Journey) vs exhibit-first (Explore) vs live-session-first (Classroom) primary viewports.',
  },
  {
    id: 'explore-journey',
    label: 'Explore / Journey Map',
    route: '/student/explore',
    description: 'Linear vertical depth waypoint trail vs open topical discovery gallery of marine exhibits.',
  },
  {
    id: 'teacher-dashboard',
    label: 'Teacher Dashboard',
    route: '/teacher',
    description: 'High-density editorial lesson schedule vs tactile switchboard activity queue with zero-lag previews.',
  },
  {
    id: 'water-simulation',
    label: 'Water Column Sim',
    route: '/student/experience/exp-sim-water-column',
    description: 'Direct depth slider manipulation, light attenuation, and hydrostatic pressure progressive disclosure.',
  },
  {
    id: 'classroom-live',
    label: 'Live Session & Presentation',
    route: '/session/demo-session/present',
    description: 'Whole-class projection legibility, clean presentation surface, and real-time student prediction sync.',
  },
];

export function CompareMatrix() {
  const { setVariant, navigate } = useRouter();
  const { setTheme } = useTheme();
  const [selectedSurface, setSelectedSurface] = useState<CompareSurface>('student-home');

  const activeSurfaceInfo = SURFACES.find((s) => s.id === selectedSurface)!;

  const handleLaunchVariant = (vId: VariantId) => {
    setVariant(vId);
    setTheme(VARIANTS[vId].theme);
    navigate(activeSurfaceInfo.route);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 pb-28">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Design Hypotheses Matrix · 6 Variants</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Variant Comparison & Evaluation
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
              Judge hierarchy, pre-reader comprehension, teacher density, and visual taste across the six design variants on the identical shared architecture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student')}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded-lg transition-colors"
            >
              Exit to Student Home
            </button>
            <button
              onClick={() => navigate('/teacher')}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white text-xs font-mono font-medium rounded-lg transition-colors shadow-lg shadow-sky-950"
            >
              Exit to Teacher Dashboard
            </button>
          </div>
        </div>

        {/* Surface Switcher Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {SURFACES.map((surface) => {
            const isSelected = selectedSurface === surface.id;
            return (
              <button
                key={surface.id}
                onClick={() => setSelectedSurface(surface.id)}
                className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-950'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{surface.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3 text-xs text-neutral-300 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-white">Active Focus:</strong> {activeSurfaceInfo.description}
          </span>
        </div>
      </div>

      {/* 2x3 Grid Matrix of the 6 Variants */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(VARIANTS) as VariantId[]).map((vId) => {
          const variant = VARIANTS[vId];
          const isEditorial = variant.theme === 'editorial';

          return (
            <div
              key={vId}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all hover:border-neutral-600 ${
                isEditorial
                  ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-neutral-800'
                  : 'bg-gradient-to-b from-slate-900 to-neutral-950 border-slate-800'
              }`}
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-neutral-800 text-sky-300 font-mono text-xs font-bold rounded">
                    {vId.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                    <span className="capitalize px-2 py-0.5 bg-neutral-800/80 rounded">
                      IA: {variant.ia}
                    </span>
                    <span className={`capitalize px-2 py-0.5 rounded ${
                      isEditorial ? 'bg-stone-800 text-stone-200' : 'bg-cyan-950 text-cyan-300'
                    }`}>
                      {variant.theme}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-serif font-bold text-white mb-1">
                  {variant.name}
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed mb-4">
                  {variant.description}
                </p>

                {/* Conceptual Simulation Frame of this Variant */}
                <div className={`w-full rounded-lg border p-4 mb-4 text-xs ${
                  isEditorial
                    ? 'bg-[#fcfbf9] text-neutral-900 border-neutral-300 font-serif'
                    : 'bg-[#151c24] text-neutral-100 border-neutral-700 font-sans'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-300/40 text-[10px] uppercase font-mono tracking-wider opacity-70 mb-2">
                    <span>{activeSurfaceInfo.label}</span>
                    <span>{variant.name}</span>
                  </div>

                  {/* Contextual thumbnail preview mockup */}
                  <div className="py-2">
                    {variant.ia === 'journey' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isEditorial ? 'bg-sky-800' : 'bg-cyan-400'}`} />
                          <span className="font-semibold text-xs">Waypoint Alpha · 200m</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-300/60 rounded-full overflow-hidden">
                          <div className={`h-full w-2/3 ${isEditorial ? 'bg-sky-800' : 'bg-cyan-400'}`} />
                        </div>
                        <p className="text-[11px] opacity-75">Linear depth progression priority</p>
                      </div>
                    )}

                    {variant.ia === 'explore' && (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className={`p-2 rounded border text-[10px] ${
                            isEditorial ? 'bg-white border-neutral-200' : 'bg-neutral-800 border-neutral-700'
                          }`}>
                            <span className="font-semibold block">Exhibit 01</span>
                            <span className="opacity-70">Vertical Zones</span>
                          </div>
                          <div className={`p-2 rounded border text-[10px] ${
                            isEditorial ? 'bg-white border-neutral-200' : 'bg-neutral-800 border-neutral-700'
                          }`}>
                            <span className="font-semibold block">Exhibit 02</span>
                            <span className="opacity-70">Sediment Silt</span>
                          </div>
                        </div>
                        <p className="text-[11px] opacity-75">Curated thematic exhibits breadth</p>
                      </div>
                    )}

                    {variant.ia === 'classroom' && (
                      <div className="space-y-1.5">
                        <div className={`p-2 rounded border flex items-center justify-between text-[11px] ${
                          isEditorial ? 'bg-white border-neutral-200' : 'bg-cyan-950/40 border-cyan-800/60'
                        }`}>
                          <span className="font-semibold">Live Class In Session</span>
                          <span className="font-mono text-[10px] text-emerald-500">● 5 Connected</span>
                        </div>
                        <p className="text-[11px] opacity-75">Orchestration & instant launch priority</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Winning Strengths */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                    Hypothesis Strengths:
                  </span>
                  {variant.winningStrengths.map((strength, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>

                {/* Evaluation Question */}
                <div className="bg-neutral-900/80 rounded-lg p-3 border border-neutral-800 mb-4 text-xs text-neutral-300">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                    Evaluation Question:
                  </span>
                  <p className="italic text-neutral-300 text-[11px] leading-snug">
                    "{variant.evaluationCriterion}"
                  </p>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleLaunchVariant(vId)}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-sky-600 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all group shadow"
              >
                <span>Launch {variant.name}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

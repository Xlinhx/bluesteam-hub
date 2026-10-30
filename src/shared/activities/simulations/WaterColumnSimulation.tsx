import { useState, useMemo } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import {
  Sun,
  Thermometer,
  Gauge,
  Fish,
  Eye,
  EyeOff,
  HelpCircle,
  Volume2,
  Tv,
  Check,
  Compass,
  ArrowDown,
} from 'lucide-react';

interface WaterColumnSimulationProps {
  initialDepth?: number;
  isTeacher?: boolean;
  isPresentation?: boolean;
  onDepthChange?: (depth: number) => void;
  onPresentationRequest?: () => void;
}

interface OceanZoneInfo {
  id: 'sunlit' | 'twilight' | 'midnight' | 'abyssal';
  name: string;
  scientificName: string;
  depthRange: string;
  minDepth: number;
  maxDepth: number;
  tempRange: string;
  lightStatus: string;
  pressureDescription: string;
  colorHex: string;
  specimens: {
    id: string;
    name: string;
    depthMeters: number;
    description: string;
    adaptation: string;
  }[];
}

const ZONES: OceanZoneInfo[] = [
  {
    id: 'sunlit',
    name: 'Sunlight Zone',
    scientificName: 'Epipelagic Zone',
    depthRange: '0m – 200m',
    minDepth: 0,
    maxDepth: 200,
    tempRange: '24°C – 18°C',
    lightStatus: 'Full Sunlight (Phototrophic)',
    pressureDescription: '1 to 21 atmospheres (Surface standard)',
    colorHex: '#0ea5e9',
    specimens: [
      { id: 'turtle', name: 'Green Sea Turtle', depthMeters: 45, description: 'Surfaces to breathe air; swims in sunlit reefs.', adaptation: 'Hydrodynamic shell & air storage lungs' },
      { id: 'dolphin', name: 'Bottlenose Dolphin', depthMeters: 80, description: 'Echolocates fish shoals in clear upper water.', adaptation: 'High-frequency acoustic clicks' },
    ],
  },
  {
    id: 'twilight',
    name: 'Twilight Zone',
    scientificName: 'Mesopelagic Zone',
    depthRange: '200m – 1,000m',
    minDepth: 200,
    maxDepth: 1000,
    tempRange: '18°C – 4°C (Thermocline drop)',
    lightStatus: 'Faint Blue Dusk (No plant photosynthesis)',
    pressureDescription: '21 to 101 atmospheres (100x surface pressure)',
    colorHex: '#0369a1',
    specimens: [
      { id: 'lanternfish', name: 'Silver Lanternfish', depthMeters: 550, description: 'Migrates vertically every night to feed.', adaptation: 'Bioluminescent belly photophores (counter-illumination)' },
      { id: 'hatchetfish', name: 'Deep Sea Hatchetfish', depthMeters: 750, description: 'Ultra-thin reflective silver body.', adaptation: 'Upward-pointing binocular tubular eyes' },
    ],
  },
  {
    id: 'midnight',
    name: 'Midnight Zone',
    scientificName: 'Bathypelagic Zone',
    depthRange: '1,000m – 4,000m',
    minDepth: 1000,
    maxDepth: 4000,
    tempRange: '4°C – 2°C (Perpetual cold)',
    lightStatus: 'Total Natural Darkness',
    pressureDescription: '101 to 401 atmospheres (Crushes unreinforced hulls)',
    colorHex: '#082f49',
    specimens: [
      { id: 'anglerfish', name: 'Black Seadevil Anglerfish', depthMeters: 1800, description: 'Ambush predator living in total pitch black.', adaptation: 'Bioluminescent symbiotic bacteria lure (esca)' },
      { id: 'squid', name: 'Giant Architeuthis Squid', depthMeters: 2400, description: 'Largest invertebrate eye on Earth (30cm diameter).', adaptation: 'Huge optical sensors detecting whale wakes' },
    ],
  },
  {
    id: 'abyssal',
    name: 'Abyssal Plain',
    scientificName: 'Abyssopelagic Zone',
    depthRange: '4,000m – 6,000m+',
    minDepth: 4000,
    maxDepth: 6000,
    tempRange: '2°C – 1°C (Near freezing)',
    lightStatus: 'Absolute Darkness',
    pressureDescription: '401 to 601+ atmospheres (Extreme hydrostatic force)',
    colorHex: '#020617',
    specimens: [
      { id: 'tripodfish', name: 'Benthic Tripod Fish', depthMeters: 4600, description: 'Stands motionless on elongated fin stilts on the muddy seabed.', adaptation: 'Tactile pelvic rays sensing water vibrations' },
    ],
  },
];

export function WaterColumnSimulation({
  initialDepth = 150,
  isTeacher = false,
  isPresentation = false,
  onDepthChange,
  onPresentationRequest,
}: WaterColumnSimulationProps) {
  useTheme();
  const [depth, setDepth] = useState(initialDepth);
  const [labelsRevealed, setLabelsRevealed] = useState(isTeacher || isPresentation);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Find active depth zone
  const currentZone = useMemo(() => {
    return ZONES.find((z) => depth >= z.minDepth && depth < z.maxDepth) || ZONES[ZONES.length - 1];
  }, [depth]);

  // Derived physics values based on scientific formulas
  const calculatedAtmospheres = useMemo(() => {
    return (1 + depth / 10).toFixed(1);
  }, [depth]);

  const calculatedPsi = useMemo(() => {
    return (14.7 + depth * 0.444).toFixed(0);
  }, [depth]);

  const calculatedTempCelsius = useMemo(() => {
    if (depth <= 200) {
      return (24 - (depth / 200) * 6).toFixed(1);
    } else if (depth <= 1000) {
      return (18 - ((depth - 200) / 800) * 14).toFixed(1);
    } else {
      return Math.max(1.2, 4 - ((depth - 1000) / 3000) * 2.8).toFixed(1);
    }
  }, [depth]);

  const lightPercent = useMemo(() => {
    if (depth <= 50) return ((1 - depth / 50 * 0.5) * 100).toFixed(0);
    if (depth <= 200) return Math.max(1, ((1 - depth / 200) * 50)).toFixed(0);
    if (depth <= 1000) return (Math.max(0.01, (1 - depth / 1000) * 0.9)).toFixed(2);
    return '0.00';
  }, [depth]);

  // Sync state via BroadcastChannel when depth changes
  const handleDepthInput = (newDepth: number) => {
    setDepth(newDepth);
    onDepthChange?.(newDepth);
  };

  const handleRevealToggle = () => {
    const next = !labelsRevealed;
    setLabelsRevealed(next);
  };

  const handleAskPrediction = () => {
    setShowPredictionModal(true);
  };

  const handleSpeakZone = () => {
    const speech = `Depth ${depth} meters. You are in the ${currentZone.name}. The water temperature is ${calculatedTempCelsius} degrees Celsius, with ${calculatedAtmospheres} atmospheres of hydrostatic pressure.`;
    setSpeakingText(speech);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speech);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingText(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setSpeakingText(null), 4000);
    }
  };

  return (
    <div className={`relative w-full ${isPresentation ? 'p-8 max-w-7xl mx-auto' : 'p-4 md:p-8'}`}>
      {/* Instrument Masthead (Clean Scientific Editorial Standard) */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-borderUi-strong">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-primary flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-widest block">
              Oceanographic Transect Instrument
            </span>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-ink-primary leading-none mt-0.5">
              Vertical Water Column & Depth Physics
            </h2>
          </div>
        </div>

        {/* Global Instrument Readout & Controls */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded bg-surface-sunken border border-borderUi-soft text-ink-primary font-bold">
            DEPTH: <span className="text-brand-primary">{depth} M</span>
          </div>

          <button
            onClick={handleSpeakZone}
            className={`p-2 rounded border border-borderUi-soft transition-colors cursor-pointer ${
              speakingText ? 'bg-amber-500 text-neutral-950 animate-pulse' : 'bg-surface hover:bg-surface-interactive text-ink-primary'
            }`}
            title="Listen to Audible Reading"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {isTeacher && (
            <>
              <button
                onClick={handleRevealToggle}
                className="px-3 py-1.5 rounded border border-borderUi-soft bg-surface hover:bg-surface-interactive text-ink-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Toggle scientific nomenclature labels"
              >
                {labelsRevealed ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-sky-600" />}
                <span>{labelsRevealed ? 'Hide Labels' : 'Reveal Labels'}</span>
              </button>

              <button
                onClick={handleAskPrediction}
                className="px-3 py-1.5 rounded border border-amber-600/40 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Class Prediction</span>
              </button>
            </>
          )}

          {!isPresentation && (
            <button
              onClick={onPresentationRequest}
              className="p-2 rounded border border-borderUi-soft text-ink-secondary hover:text-ink-primary hover:bg-surface-interactive transition-colors cursor-pointer"
              title="Open Public Presentation View"
            >
              <Tv className="w-4 h-4 text-brand-primary" />
            </button>
          )}
        </div>
      </header>

      {/* Main Scientific Instrument Surface (Grid without Card Enclosures) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Left Aspect: Oceanographic Depth Winch & Vertical Rail (Col 3) */}
        <div className="lg:col-span-3 border-r border-borderUi-soft pr-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-borderUi-soft text-[11px] font-mono text-ink-muted">
              <span>Winch Control</span>
              <span>0m — 4,000m</span>
            </div>

            {/* Tactile Vertical Depth Slider Gauge */}
            <div className="relative w-full h-80 my-6 flex justify-center items-center">
              {/* Depth Rail Line */}
              <div className="absolute inset-y-0 w-3 rounded-full bg-gradient-to-b from-sky-300 via-sky-700 via-indigo-950 to-neutral-950 border border-borderUi-strong" />

              {/* Tick Marks along the rail */}
              <div className="absolute left-8 h-full flex flex-col justify-between text-[10px] font-mono text-ink-muted select-none py-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <ArrowDown className="w-3 h-3 text-sky-500" /> 0m
                </span>
                <span className="flex items-center gap-1.5">
                  <ArrowDown className="w-3 h-3 text-sky-700" /> 200m
                </span>
                <span className="flex items-center gap-1.5">
                  <ArrowDown className="w-3 h-3 text-indigo-800" /> 1,000m
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  <ArrowDown className="w-3 h-3 text-neutral-800" /> 4,000m
                </span>
              </div>

              {/* Native Accessible Range Input positioned over the rail */}
              <input
                type="range"
                min="0"
                max="4000"
                step="10"
                value={depth}
                onChange={(e) => handleDepthInput(Number(e.target.value))}
                aria-label="Ocean Depth in Meters"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {/* Visual Tactile Draggable Slider Knob */}
              <div
                className="absolute w-8 h-6 rounded bg-surface border-2 border-brand-primary shadow-subtle flex items-center justify-center pointer-events-none transition-all duration-75"
                style={{
                  top: `${(depth / 4000) * 88}%`,
                }}
              >
                <div className="w-3 h-0.5 bg-brand-primary" />
              </div>
            </div>
          </div>

          {/* Quick Depth Presets (Generous 48px Touch Targets for Young Learners) */}
          <div className="space-y-2 border-t border-borderUi-soft pt-4">
            <span className="text-[10px] font-mono uppercase text-ink-muted block font-bold">
              Rapid Zone Jumps
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDepthInput(50)}
                className="py-2.5 px-2 text-xs font-mono rounded bg-surface-interactive hover:bg-brand-primary hover:text-white transition-colors cursor-pointer border border-borderUi-soft touch-target-child"
              >
                0m Surface
              </button>
              <button
                onClick={() => handleDepthInput(500)}
                className="py-2.5 px-2 text-xs font-mono rounded bg-surface-interactive hover:bg-brand-primary hover:text-white transition-colors cursor-pointer border border-borderUi-soft touch-target-child"
              >
                500m Twilight
              </button>
              <button
                onClick={() => handleDepthInput(2000)}
                className="py-2.5 px-2 text-xs font-mono rounded bg-surface-interactive hover:bg-brand-primary hover:text-white transition-colors cursor-pointer border border-borderUi-soft touch-target-child"
              >
                2,000m Abyss
              </button>
              <button
                onClick={() => handleDepthInput(4000)}
                className="py-2.5 px-2 text-xs font-mono rounded bg-surface-interactive hover:bg-brand-primary hover:text-white transition-colors cursor-pointer border border-borderUi-soft touch-target-child"
              >
                4,000m Floor
              </button>
            </div>
          </div>
        </div>

        {/* Center Aspect: Deep Ocean Optical Transect Viewport (Col 6) */}
        <div
          className="lg:col-span-6 rounded-lg border border-borderUi-strong overflow-hidden relative min-h-[460px] flex flex-col justify-between p-8 transition-colors duration-700 shadow-elevated"
          style={{
            backgroundColor: currentZone.id === 'sunlit'
              ? '#0e3a53'
              : currentZone.id === 'twilight'
              ? '#072438'
              : currentZone.id === 'midnight'
              ? '#031420'
              : '#01080e',
          }}
        >
          {/* Surface sunlight caustic attenuation */}
          <div
            className="absolute inset-x-0 top-0 h-44 pointer-events-none bg-gradient-to-b from-sky-200/25 via-sky-400/10 to-transparent transition-opacity duration-700"
            style={{ opacity: Math.max(0, 1 - depth / 350) }}
          />

          {/* Top Transect Legend */}
          <div className="relative z-10 flex items-center justify-between text-white drop-shadow font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/20">
              STRATUM: {labelsRevealed ? currentZone.scientificName : currentZone.name}
            </span>
            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/20 font-bold">
              {depth} METERS
            </span>
          </div>

          {/* Biological Specimen Plates Floating at Current Depth */}
          <div className="relative z-10 my-8 space-y-4">
            {currentZone.specimens.map((specimen) => (
              <div
                key={specimen.id}
                className="bg-neutral-950/75 backdrop-blur-md border border-white/20 rounded p-4 text-white max-w-md transition-all shadow-lg"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Fish className="w-4 h-4 text-sky-400" />
                    <h4 className="font-serif font-bold text-base text-sky-100">{specimen.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                    Depth: ~{specimen.depthMeters}m
                  </span>
                </div>
                <p className="text-xs text-neutral-200 font-sans leading-relaxed">{specimen.description}</p>
                {labelsRevealed && (
                  <div className="mt-2.5 pt-2 border-t border-white/15 text-xs text-amber-300 font-mono flex items-start gap-1.5">
                    <strong className="text-white shrink-0">Physiological Adaptation:</strong>
                    <span>{specimen.adaptation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Telemetry Footer */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/80 border-t border-white/20 pt-2.5">
            <span>Residual Light: {lightPercent}%</span>
            <span>Temperature: {calculatedTempCelsius}°C</span>
          </div>
        </div>

        {/* Right Aspect: Physical Telemetry Columns (Col 3) */}
        <div className="lg:col-span-3 border-l border-borderUi-soft pl-6 space-y-6 font-mono text-xs">
          <div className="border-b border-borderUi-soft pb-2 text-[10px] text-ink-muted uppercase font-bold tracking-wider">
            In-Situ Physical Telemetry
          </div>

          {/* Sunlight Optical Extinction */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-ink-primary font-bold">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Optical Transmission</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-brand-primary">{lightPercent}%</span>
              <span className="text-[10px] text-ink-muted">Surface Intensity</span>
            </div>
            <div className="w-full h-1.5 bg-surface-sunken rounded overflow-hidden border border-borderUi-soft">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Number(lightPercent))}%` }}
              />
            </div>
            <p className="text-[11px] font-sans text-ink-secondary leading-relaxed">
              {depth < 200
                ? 'Phototrophic light available. Red wavelengths absorbed in first 15 meters.'
                : depth < 1000
                ? 'Mesopelagic twilight dusk. Insufficient for cellular photosynthesis.'
                : 'Absolute natural darkness. Extinguished below 1,000 meters.'}
            </p>
          </div>

          {/* Hydrostatic Pressure */}
          <div className="space-y-2 pt-4 border-t border-borderUi-soft">
            <div className="flex items-center gap-2 text-ink-primary font-bold">
              <Gauge className="w-4 h-4 text-sky-600" />
              <span>Hydrostatic Pressure</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-sky-700">{calculatedAtmospheres} atm</span>
              <span className="text-[10px] text-ink-muted">{calculatedPsi} PSI</span>
            </div>
            <div className="w-full h-1.5 bg-surface-sunken rounded overflow-hidden border border-borderUi-soft">
              <div
                className="h-full bg-sky-600 transition-all duration-300"
                style={{ width: `${Math.min(100, (Number(calculatedAtmospheres) / 401) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] font-sans text-ink-secondary leading-relaxed">
              +1 atmosphere for every 10 meters descended. At {depth}m, hydrostatic weight exerts {calculatedAtmospheres}× surface standard.
            </p>
          </div>

          {/* Thermocline Temperature Curve */}
          <div className="space-y-2 pt-4 border-t border-borderUi-soft">
            <div className="flex items-center gap-2 text-ink-primary font-bold">
              <Thermometer className="w-4 h-4 text-rose-600" />
              <span>Thermocline Gradient</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-rose-700">{calculatedTempCelsius}°C</span>
              <span className="text-[10px] text-ink-muted">
                {((Number(calculatedTempCelsius) * 9) / 5 + 32).toFixed(1)}°F
              </span>
            </div>
            <p className="text-[11px] font-sans text-ink-secondary leading-relaxed">
              {depth < 200
                ? 'Warm, wind-mixed surface boundary layer.'
                : depth < 1000
                ? 'Steep thermocline boundary where water rapidly cools from 18°C to 4°C.'
                : 'Deep isothermal ocean water hovering between 1°C and 4°C.'}
            </p>
          </div>
        </div>
      </div>

      {/* Whole-Class Inquiry Modal Overlay */}
      {showPredictionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-borderUi-strong rounded-lg max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-borderUi-soft pb-3 text-xs font-mono">
              <span className="text-brand-primary font-bold uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Inquiry Hypothesis Prompt
              </span>
              <span className="text-ink-muted">Studio 104</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-ink-primary">
                What occurs to sunlight and water pressure at 1,000 meters?
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Before descending the physical column, select your observation hypothesis.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'opt-dark-high', label: 'Complete darkness and crushing high pressure (101 atmospheres)', correct: true },
                { id: 'opt-warm-light', label: 'Water remains warm and sunlight continues', correct: false },
                { id: 'opt-no-change', label: 'Conditions remain identical to surface waters', correct: false },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setPredictionFeedback(
                      opt.correct
                        ? 'Hypothesis Confirmed: At 1,000m, sunlight is 100% extinguished and pressure reaches 101 atmospheres.'
                        : 'Hypothesis Incomplete: Re-evaluate how water absorbs light photons and the weight of overlying water.'
                    )
                  }
                  className="w-full text-left p-3.5 rounded border border-borderUi-strong hover:border-brand-primary bg-surface hover:bg-surface-interactive text-xs font-mono transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>{opt.label}</span>
                  {predictionFeedback && opt.correct && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>

            {predictionFeedback && (
              <div className="p-3.5 rounded bg-surface-sunken border border-borderUi-soft text-xs font-mono text-ink-primary">
                {predictionFeedback}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-borderUi-soft">
              <button
                onClick={() => {
                  setShowPredictionModal(false);
                  setPredictionFeedback(null);
                }}
                className="px-5 py-2 bg-brand-primary text-white text-xs font-mono font-bold rounded cursor-pointer"
              >
                Close Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

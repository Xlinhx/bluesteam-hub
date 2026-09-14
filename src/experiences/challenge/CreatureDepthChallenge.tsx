import { useState } from 'react';
import { useTheme } from '../../themes/ThemeProvider';
import { demoStore } from '../../demo/storage/demoStore';
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowDown,
  Fish,
} from 'lucide-react';

interface CreatureDepthChallengeProps {
  onComplete?: () => void;
  isPresentation?: boolean;
}

interface CreatureItem {
  id: string;
  name: string;
  targetZoneId: 'sunlit' | 'twilight' | 'midnight';
  hint: string;
  placedZoneId: 'sunlit' | 'twilight' | 'midnight' | null;
  accentColor: string;
}

const INITIAL_CREATURES: CreatureItem[] = [
  {
    id: 'turtle',
    name: 'Green Sea Turtle',
    targetZoneId: 'sunlit',
    hint: 'Breathes air at the surface and grazes on shallow sunlit seagrass beds.',
    placedZoneId: null,
    accentColor: '#10b981',
  },
  {
    id: 'lanternfish',
    name: 'Silver Lanternfish',
    targetZoneId: 'twilight',
    hint: 'Emits faint blue light from its belly to blend into the mesopelagic dusk.',
    placedZoneId: null,
    accentColor: '#38bdf8',
  },
  {
    id: 'anglerfish',
    name: 'Deep Sea Anglerfish',
    targetZoneId: 'midnight',
    hint: 'Dangles a glowing bioluminescent lure in perpetual pitch-black water.',
    placedZoneId: null,
    accentColor: '#f59e0b',
  },
];

const TARGET_ZONES = [
  {
    id: 'sunlit' as const,
    title: 'Sunlight Zone',
    depthLabel: '0m – 200m',
    colorHex: '#0ea5e9',
    lightDescription: 'Bright surface water with plant life',
  },
  {
    id: 'twilight' as const,
    title: 'Twilight Zone',
    depthLabel: '200m – 1,000m',
    colorHex: '#0369a1',
    lightDescription: 'Faint blue dusk, rapid temperature drop',
  },
  {
    id: 'midnight' as const,
    title: 'Midnight Zone',
    depthLabel: '1,000m – 4,000m',
    colorHex: '#082f49',
    lightDescription: 'Perpetual darkness and crushing pressure',
  },
];

export function CreatureDepthChallenge({ onComplete, isPresentation = false }: CreatureDepthChallengeProps) {
  const { theme } = useTheme();
  const [creatures, setCreatures] = useState<CreatureItem[]>(INITIAL_CREATURES);
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const allCompleted = creatures.every((c) => c.placedZoneId === c.targetZoneId);

  // Single-pointer tap alternative (WCAG 2.2)
  const handleSelectCreature = (id: string) => {
    if (selectedCreatureId === id) {
      setSelectedCreatureId(null);
    } else {
      setSelectedCreatureId(id);
      const c = creatures.find((item) => item.id === id);
      if (c) {
        setFeedbackMessage(`Selected ${c.name}. Now tap the ocean zone where it lives.`);
      }
    }
  };

  const handlePlaceInZone = (zoneId: 'sunlit' | 'twilight' | 'midnight') => {
    if (!selectedCreatureId) return;

    const targetCreature = creatures.find((c) => c.id === selectedCreatureId);
    if (!targetCreature) return;

    if (targetCreature.targetZoneId === zoneId) {
      // Correct Match!
      const updated = creatures.map((c) =>
        c.id === selectedCreatureId ? { ...c, placedZoneId: zoneId } : c
      );
      setCreatures(updated);
      setSelectedCreatureId(null);
      setFeedbackMessage(`Correct! ${targetCreature.name} lives in the ${zoneId.toUpperCase()} zone.`);

      // Check if all complete
      if (updated.every((c) => c.placedZoneId === c.targetZoneId)) {
        // Record progress in demo store
        const currentProgress = demoStore.getProgress();
        currentProgress.totalObservationsMade += 3;
        demoStore.setProgress(currentProgress);
        onComplete?.();
      }
    } else {
      // Incorrect Match
      setFeedbackMessage(`Not quite. Look at the depth: ${targetCreature.hint}`);
    }
  };

  const resetChallenge = () => {
    setCreatures(INITIAL_CREATURES);
    setSelectedCreatureId(null);
    setFeedbackMessage(null);
  };

  const speakInstruction = (text: string) => {
    if (speakingText) {
      window.speechSynthesis?.cancel();
      setSpeakingText(null);
      return;
    }
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.onend = () => setSpeakingText(null);
      setSpeakingText(text);
      window.speechSynthesis.speak(u);
    }
  };

  const isTactile = theme === 'tactile';

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border p-6 transition-all ${
        isTactile
          ? 'bg-gradient-to-b from-[#1c232b] to-[#12171d] border-slate-700 shadow-2xl text-slate-100'
          : 'bg-gradient-to-b from-[#f9f8f5] to-[#ece8dc] border-stone-300 shadow-xl text-stone-900'
      } ${isPresentation ? 'min-h-[80vh]' : 'min-h-[560px]'}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-borderUi-soft/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Interactive Challenge · Pre-Reader Visual Sorting
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated font-mono text-ink-muted border border-borderUi-soft">
              {creatures.filter((c) => c.placedZoneId !== null).length} of 3 Placed
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold mt-0.5">
            Match Creatures to Their Ocean Home
          </h2>
        </div>

        {/* Audio prompt button for pre-readers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              speakInstruction(
                'Tap an ocean creature, then tap the ocean zone where it lives. Listen to the clues!'
              )
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              speakingText
                ? 'bg-emerald-500 text-neutral-950 animate-pulse'
                : 'bg-surface-elevated border border-borderUi-soft text-ink-primary hover:bg-surface-interactive'
            }`}
            title="Listen to Instructions"
          >
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">{speakingText ? 'Playing...' : 'Audio Clue'}</span>
          </button>

          <button
            onClick={resetChallenge}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-interactive hover:bg-surface-elevated border border-borderUi-soft rounded-xl text-xs font-mono text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            title="Reset Challenge"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Challenge Layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Available Creatures Pool (Top / Left) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-elevated rounded-xl p-4 border border-borderUi-soft shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink-muted mb-3 flex items-center justify-between">
              <span>Selectable Organisms</span>
              <span className="text-[10px] lowercase font-normal">(tap to select)</span>
            </h3>

            <div className="space-y-2.5">
              {creatures.map((creature) => {
                const isSelected = selectedCreatureId === creature.id;
                const isPlaced = creature.placedZoneId !== null;

                return (
                  <button
                    key={creature.id}
                    onClick={() => !isPlaced && handleSelectCreature(creature.id)}
                    disabled={isPlaced}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between touch-target-child cursor-pointer ${
                      isPlaced
                        ? 'opacity-40 bg-surface-sunken border-borderUi-soft cursor-not-allowed'
                        : isSelected
                        ? 'bg-brand-primary/10 border-brand-primary ring-2 ring-brand-primary shadow-md'
                        : 'bg-surface hover:bg-surface-interactive border-borderUi-soft hover:border-brand-primary/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: creature.accentColor }}
                      >
                        <Fish className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-ink-primary">{creature.name}</h4>
                        <p className="text-[11px] text-ink-muted line-clamp-1">{creature.hint}</p>
                      </div>
                    </div>

                    {isPlaced ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : isSelected ? (
                      <ArrowDown className="w-5 h-5 text-brand-primary animate-bounce shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMessage && (
            <div className="p-4 rounded-xl bg-surface-sunken border border-borderUi-soft text-xs text-ink-primary font-mono leading-relaxed">
              {feedbackMessage}
            </div>
          )}

          {/* Success card if all done */}
          {allCompleted && (
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-emerald-300 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Expedition Discovery Complete!</span>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                You successfully mapped all three deep-sea specimens to their vertical oceanic habitats.
              </p>
            </div>
          )}
        </div>

        {/* Ocean Depth Zones Target Slots (Right) */}
        <div className="lg:col-span-8 space-y-3">
          {TARGET_ZONES.map((zone) => {
            const placedCreaturesInThisZone = creatures.filter(
              (c) => c.placedZoneId === zone.id
            );

            return (
              <div
                key={zone.id}
                onClick={() => handlePlaceInZone(zone.id)}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  selectedCreatureId
                    ? 'border-dashed border-sky-400/80 hover:bg-sky-950/20 shadow-md'
                    : 'border-borderUi-soft'
                }`}
                style={{
                  backgroundColor: `${zone.colorHex}22`,
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zone.colorHex }}
                    />
                    <h3 className="font-serif font-bold text-base text-ink-primary">
                      {zone.title}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/30 text-white">
                      {zone.depthLabel}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">{zone.lightDescription}</p>
                </div>

                {/* Placed creatures badges inside this zone */}
                <div className="flex flex-wrap gap-2 items-center">
                  {placedCreaturesInThisZone.length === 0 ? (
                    <span className="text-xs font-mono text-ink-muted italic">
                      {selectedCreatureId ? 'Tap to place organism here' : 'Zone empty'}
                    </span>
                  ) : (
                    placedCreaturesInThisZone.map((c) => (
                      <div
                        key={c.id}
                        className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-borderUi-strong text-ink-primary text-xs font-mono font-bold flex items-center gap-2 shadow-sm"
                      >
                        <Fish className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{c.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

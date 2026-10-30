import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import {
  Play,
  Pause,
  RotateCcw,
  SplitSquareVertical,
  Volume2,
  Tv,
} from 'lucide-react';

interface SedimentTerracesSimulationProps {
  isTeacher?: boolean;
  isPresentation?: boolean;
  onPresentationRequest?: () => void;
}

type GrainComposition = 'mixed' | 'gravel' | 'sand' | 'silt';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'gravel' | 'sand' | 'silt';
  size: number;
  mass: number;
  settled: boolean;
  color: string;
}

export function SedimentTerracesSimulation({
  isTeacher = false,
  isPresentation = false,
  onPresentationRequest,
}: SedimentTerracesSimulationProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation Parameters
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [slopeAngleDeg, setSlopeAngleDeg] = useState(20);
  const [flowVelocity, setFlowVelocity] = useState(1.6);
  const [grainType, setGrainType] = useState<GrainComposition>('mixed');
  const [compareMode, setCompareMode] = useState(false);
  const [depositedCount, setDepositedCount] = useState(0);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Heightmap for accumulated sediment across 60 columns
  const heightmapRef = useRef<number[]>(new Array(60).fill(0));
  const particlesRef = useRef<Particle[]>([]);

  // Reset Simulation
  const resetSimulation = () => {
    heightmapRef.current = new Array(60).fill(0);
    particlesRef.current = [];
    setDepositedCount(0);
  };

  // Particle spawning & physics animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let spawnCounter = 0;

    const spawnParticle = (width: number) => {
      let type: 'gravel' | 'sand' | 'silt' = 'sand';
      if (grainType === 'mixed') {
        const r = Math.random();
        type = r < 0.25 ? 'gravel' : r < 0.75 ? 'sand' : 'silt';
      } else {
        type = grainType;
      }

      const mass = type === 'gravel' ? 3.5 : type === 'sand' ? 1.8 : 0.6;
      const size = type === 'gravel' ? 5 : type === 'sand' ? 3.5 : 2;
      const color =
        type === 'gravel'
          ? '#94a3b8' // Slate pebble
          : type === 'sand'
          ? '#f59e0b' // Amber quartz sand
          : '#d97706'; // Fine silt ochre

      particlesRef.current.push({
        x: Math.random() * (width * 0.15) + 10,
        y: 30 + Math.random() * 20,
        vx: flowVelocity * (2 + Math.random() * 1.5),
        vy: 0.5 + Math.random() * 0.8,
        type,
        size,
        mass,
        settled: false,
        color,
      });
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Draw Water and Slope Terrain
      const slopeRadian = (slopeAngleDeg * Math.PI) / 180;
      const startX = 0;
      const startY = height * 0.35;
      const shelfWidth = width * 0.35;
      const slopeEndWidth = shelfWidth + width * 0.45;
      const slopeDrop = Math.tan(slopeRadian) * (width * 0.4);
      const floorY = Math.min(height - 20, startY + slopeDrop);

      // Bedrock background path
      ctx.fillStyle = theme === 'editorial' ? '#e5e0d3' : '#1e2832';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(shelfWidth, startY); // Continental Shelf
      ctx.lineTo(slopeEndWidth, floorY); // Continental Slope
      ctx.lineTo(width, floorY); // Submarine Canyon Fan
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Water current arrows
      ctx.strokeStyle = theme === 'editorial' ? 'rgba(14, 165, 233, 0.4)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      for (let x = 30; x < width - 40; x += 90) {
        ctx.beginPath();
        ctx.moveTo(x, 25);
        ctx.lineTo(x + flowVelocity * 15, 25);
        ctx.stroke();
      }

      // Spawn new particles if playing
      if (isPlaying) {
        spawnCounter++;
        const spawnInterval = isSlowMo ? 14 : 4;
        if (spawnCounter % spawnInterval === 0 && particlesRef.current.length < 350) {
          spawnParticle(width);
        }
      }

      // Update & Draw Particles
      const particles = particlesRef.current;
      const heightmap = heightmapRef.current;
      const colWidth = width / heightmap.length;

      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (!p.settled && isPlaying) {
          const speedMod = isSlowMo ? 0.35 : 1;

          // Gravity vs Hydrodynamic Buoyancy (Stokes' settling velocity)
          p.vy += 0.08 * p.mass * speedMod;
          p.x += p.vx * speedMod;
          p.y += p.vy * speedMod;

          // Flow decay downstream
          p.vx *= 0.992;

          // Check collision with bedrock terrain
          let groundY = floorY;
          if (p.x < shelfWidth) {
            groundY = startY;
          } else if (p.x < slopeEndWidth) {
            const slopeFraction = (p.x - shelfWidth) / (slopeEndWidth - shelfWidth);
            groundY = startY + slopeFraction * (floorY - startY);
          }

          // Column index in heightmap
          const colIdx = Math.max(0, Math.min(heightmap.length - 1, Math.floor(p.x / colWidth)));
          const accumulatedHeight = heightmap[colIdx];
          const surfaceY = groundY - accumulatedHeight;

          // Settle condition
          if (p.y >= surfaceY) {
            p.settled = true;
            p.y = surfaceY;
            heightmap[colIdx] = Math.min(height * 0.4, heightmap[colIdx] + p.size * 0.8);
            setDepositedCount((c) => c + 1);
          }
        }

        // Render Particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Prune off-screen particles
        if (p.x > width + 20 || p.y > height + 20) {
          particles.splice(i, 1);
        }
      }
      ctx.restore();

      // Render Accumulated Geological Sediment Terraces
      ctx.fillStyle = theme === 'editorial' ? '#c29d68' : '#a17945';
      ctx.beginPath();
      for (let c = 0; c < heightmap.length; c++) {
        const colX = c * colWidth;
        let groundY = floorY;
        if (colX < shelfWidth) {
          groundY = startY;
        } else if (colX < slopeEndWidth) {
          const slopeFraction = (colX - shelfWidth) / (slopeEndWidth - shelfWidth);
          groundY = startY + slopeFraction * (floorY - startY);
        }
        const topY = groundY - heightmap[c];

        if (c === 0) {
          ctx.moveTo(colX, topY);
        } else {
          ctx.lineTo(colX, topY);
        }
      }
      ctx.lineTo(width, floorY);
      ctx.lineTo(0, startY);
      ctx.closePath();
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, isSlowMo, slopeAngleDeg, flowVelocity, grainType, theme]);

  const speakAudioPrompt = (text: string) => {
    if (speakingText) {
      window.speechSynthesis?.cancel();
      setSpeakingText(null);
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingText(null);
      setSpeakingText(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isTactile = theme === 'tactile';

  const grainOptions: { id: GrainComposition; label: string }[] = [
    { id: 'mixed', label: 'Natural Mixed' },
    { id: 'gravel', label: 'Heavy Gravel' },
    { id: 'sand', label: 'Quartz Sand' },
    { id: 'silt', label: 'Fine Silt Dust' },
  ];

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border p-6 transition-all ${
        isTactile
          ? 'bg-gradient-to-b from-[#1c232b] to-[#12171d] border-slate-700 shadow-2xl text-slate-100'
          : 'bg-gradient-to-b from-[#f9f8f5] to-[#ece8dc] border-stone-300 shadow-xl text-stone-900'
      } ${isPresentation ? 'min-h-[80vh]' : 'min-h-[560px]'}`}
    >
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-borderUi-soft/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Fluid Dynamics · Marine Geology
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated font-mono text-ink-muted border border-borderUi-soft">
              Settled Grains: <strong className="text-amber-500">{depositedCount}</strong>
            </span>
            {isTeacher && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 font-mono border border-amber-700">
                Teacher Prep Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl font-serif font-bold mt-0.5">
            Underwater Sediment Terraces
          </h2>
        </div>

        {/* Audio Instruction & Presentation Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              speakAudioPrompt(
                `Watch how rushing water carries sand down the continental slope. Heavy gravel drops first near the shore, while fine silt travels far out into the deep canyon floor.`
              )
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              speakingText
                ? 'bg-amber-500 text-neutral-950 animate-pulse'
                : 'bg-surface-elevated border border-borderUi-soft text-ink-primary hover:bg-surface-interactive'
            }`}
            title="Listen to Explanation"
          >
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">{speakingText ? 'Playing...' : 'Audio Prompt'}</span>
          </button>

          {/* Compare State Toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              compareMode
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-surface-elevated border border-borderUi-soft text-ink-secondary hover:text-ink-primary'
            }`}
            title="Split-screen Compare Run A vs Run B"
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span>{compareMode ? 'Comparing' : 'Compare Mode'}</span>
          </button>

          {onPresentationRequest && !isPresentation && (
            <button
              onClick={onPresentationRequest}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary hover:opacity-90 text-white rounded-xl text-xs font-mono font-medium transition-opacity cursor-pointer shadow-md"
            >
              <Tv className="w-4 h-4" />
              <span>Present</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas + Direct Manipulation Controls */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Display Viewport */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative w-full h-[360px] md:h-[400px] rounded-xl overflow-hidden border border-borderUi-soft/80 bg-[#092338]/90 shadow-inner">
            <canvas
              ref={canvasRef}
              width={760}
              height={400}
              className="w-full h-full object-cover"
            />

            {/* Labels for geological zones */}
            <div className="absolute top-3 left-4 text-[11px] font-mono text-white/75 bg-black/40 px-2 py-0.5 rounded pointer-events-none">
              Continental Shelf (Shallows)
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-[11px] font-mono text-white/75 bg-black/40 px-2 py-0.5 rounded pointer-events-none">
              Slope Incline ({slopeAngleDeg}°)
            </div>
            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-white/75 bg-black/40 px-2 py-0.5 rounded pointer-events-none">
              Submarine Basin Fan
            </div>
          </div>

          {/* Quick Playback Bar */}
          <div className="flex items-center justify-between gap-3 bg-surface-elevated p-2.5 rounded-xl border border-borderUi-soft">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-mono cursor-pointer hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={() => setIsSlowMo(!isSlowMo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                  isSlowMo
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold'
                    : 'bg-surface-interactive border-borderUi-soft text-ink-secondary hover:text-ink-primary'
                }`}
              >
                0.5x Slow
              </button>

              <button
                onClick={resetSimulation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-interactive border border-borderUi-soft text-ink-secondary hover:text-rose-400 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-ink-muted hidden sm:inline">
              Continuous Fluid Particle Field
            </span>
          </div>
        </div>

        {/* Tactile Control Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Slope Angle Slider */}
          <div className="bg-surface-elevated rounded-xl p-4 border border-borderUi-soft shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="slope-angle-slider-input" className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                Continental Slope Angle
              </label>
              <span className="text-xs font-mono font-bold text-amber-500">{slopeAngleDeg}°</span>
            </div>
            <input
              id="slope-angle-slider-input"
              type="range"
              min="5"
              max="35"
              step="1"
              value={slopeAngleDeg}
              onChange={(e) => setSlopeAngleDeg(Number(e.target.value))}
              aria-label="Continental Slope Angle in degrees"
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-1">
              <span>Gentle (5°)</span>
              <span>Standard (20°)</span>
              <span>Canyon Steep (35°)</span>
            </div>
          </div>

          {/* Current Flow Velocity */}
          <div className="bg-surface-elevated rounded-xl p-4 border border-borderUi-soft shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="current-flow-slider-input" className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
                Water Flow Speed
              </label>
              <span className="text-xs font-mono font-bold text-sky-500">{flowVelocity.toFixed(1)} m/s</span>
            </div>
            <input
              id="current-flow-slider-input"
              type="range"
              min="0.4"
              max="3.0"
              step="0.2"
              value={flowVelocity}
              onChange={(e) => setFlowVelocity(Number(e.target.value))}
              aria-label="Water Flow Speed in meters per second"
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-1">
              <span>Calm Current</span>
              <span>River Wash</span>
              <span>Torrential Rush</span>
            </div>
          </div>

          {/* Grain Particle Material Type */}
          <div className="bg-surface-elevated rounded-xl p-4 border border-borderUi-soft shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary block mb-2">
              Sediment Grain Composition
            </span>
            <div className="grid grid-cols-2 gap-2">
              {grainOptions.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrainType(g.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    grainType === g.id
                      ? 'bg-amber-600 text-white font-semibold shadow'
                      : 'bg-surface-interactive border border-borderUi-soft text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scientific Inquiry Observation Box */}
          <div className="p-3.5 bg-surface-sunken rounded-xl border border-borderUi-soft text-xs text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary block mb-1">Geological Cause & Effect:</strong>
            Notice how high water speed carries fine particles past the slope into the deep fan terrace, while heavy pebbles immediately drop on the upper shelf.
          </div>
        </div>
      </div>
    </div>
  );
}

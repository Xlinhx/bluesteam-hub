import { useEffect, useRef } from 'react';

interface UnderwaterCausticsLayerProps {
  /** Water surface split ratio from top of container (default ~0.33) */
  waterLineRatio?: number;
  className?: string;
  showFish?: boolean;
  showBubbles?: boolean;
  showRays?: boolean;
  showCaustics?: boolean;
}

interface FishCreature {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  size: number;
  color: string;
  finPhase: number;
  type: 'blue' | 'yellow' | 'striped';
}

interface BubbleParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  opacity: number;
}

interface PlanktonMote {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
}

export function UnderwaterCausticsLayer({
  waterLineRatio = 0.335,
  className = '',
  showFish = true,
  showBubbles = true,
  showRays = true,
  showCaustics = true,
}: UnderwaterCausticsLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initial school of reef fish
    const fishList: FishCreature[] = [
      { x: width * 0.75, y: height * 0.48, targetY: height * 0.48, vx: -0.65, size: 14, color: '#38BDF8', finPhase: 0, type: 'blue' },
      { x: width * 0.78, y: height * 0.46, targetY: height * 0.46, vx: -0.62, size: 11, color: '#0284C7', finPhase: 0.5, type: 'blue' },
      { x: width * 0.82, y: height * 0.51, targetY: height * 0.51, vx: -0.70, size: 13, color: '#FACC15', finPhase: 1.1, type: 'yellow' },
      { x: width * 0.86, y: height * 0.49, targetY: height * 0.49, vx: -0.68, size: 10, color: '#38BDF8', finPhase: 1.7, type: 'blue' },
      { x: width * 0.60, y: height * 0.58, targetY: height * 0.58, vx: 0.55,  size: 16, color: '#F97316', finPhase: 2.3, type: 'striped' },
      { x: width * 0.65, y: height * 0.62, targetY: height * 0.62, vx: 0.50,  size: 13, color: '#FACC15', finPhase: 3.0, type: 'yellow' },
    ];

    // Bubbles rising strictly below waterLine
    const bubbles: BubbleParticle[] = [];
    const maxBubbles = 18;
    const waterY = height * waterLineRatio;

    for (let i = 0; i < maxBubbles; i++) {
      bubbles.push({
        x: width * 0.25 + Math.random() * (width * 0.68),
        y: waterY + 40 + Math.random() * (height - waterY - 60),
        radius: 1.5 + Math.random() * 3.5,
        speed: 0.6 + Math.random() * 0.9,
        wobbleSpeed: 1.5 + Math.random() * 2.5,
        wobbleAmp: 4 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.25 + Math.random() * 0.5,
      });
    }

    // Drifting luminous marine plankton motes
    const motes: PlanktonMote[] = [];
    for (let i = 0; i < 28; i++) {
      motes.push({
        x: Math.random() * width,
        y: waterY + Math.random() * (height - waterY),
        size: 1 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.15 - Math.random() * 0.25,
        opacity: 0.2 + Math.random() * 0.6,
      });
    }

    // God Ray configurations (originating strictly at water line)
    const rayAngles = [-14, -8, -1, 6, 13, 20];
    const rayOrigins = [0.18, 0.32, 0.46, 0.62, 0.76, 0.88];
    const rayWidths = [45, 65, 80, 75, 55, 45];
    const raySpeeds = [0.4, 0.6, 0.5, 0.7, 0.45, 0.55];

    let time = 0;

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const currentWaterY = height * waterLineRatio;

      // =========================================================================
      // 1. WATER SURFACE MENISCUS / WAVE BOUNDARY (Ranh giới mặt nước)
      // =========================================================================
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, currentWaterY);
      for (let x = 0; x <= width; x += 12) {
        const wave =
          Math.sin(x * 0.008 + time * 1.5) * 2.2 +
          Math.sin(x * 0.02 + time * 2.2) * 1.0;
        ctx.lineTo(x, currentWaterY + wave);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = 'rgba(125, 225, 255, 0.8)';
      ctx.shadowBlur = 6;
      ctx.stroke();

      // Soft water boundary glow downwards
      ctx.lineTo(width, currentWaterY + 18);
      ctx.lineTo(0, currentWaterY + 18);
      ctx.closePath();
      const waveGlow = ctx.createLinearGradient(0, currentWaterY, 0, currentWaterY + 18);
      waveGlow.addColorStop(0, 'rgba(180, 240, 255, 0.28)');
      waveGlow.addColorStop(1, 'rgba(30, 160, 220, 0.0)');
      ctx.fillStyle = waveGlow;
      ctx.fill();
      ctx.restore();

      // =========================================================================
      // 2. GOD RAYS (Tia sáng vật lý: CHỈ CHIẾU TỪ MẶT NƯỚC XUỐNG ĐÁY)
      // =========================================================================
      if (showRays) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < rayOrigins.length; i++) {
          const sway = Math.sin(time * raySpeeds[i] + i * 1.3) * 18;
          const topX = width * rayOrigins[i] + sway;
          const angleRad = ((rayAngles[i] + Math.sin(time * 0.3 + i) * 3) * Math.PI) / 180;
          const rayH = height - currentWaterY;
          const bottomOffset = Math.tan(angleRad) * rayH;
          const bottomX = topX + bottomOffset;
          const wTop = rayWidths[i] * (0.85 + Math.sin(time * 0.8 + i) * 0.15);
          const wBottom = wTop * 2.8;

          const rayGrad = ctx.createLinearGradient(topX, currentWaterY, bottomX, height);
          const pulse = 0.22 + Math.sin(time * 1.2 + i * 1.8) * 0.08;
          rayGrad.addColorStop(0, `rgba(225, 250, 255, ${pulse * 1.4})`);
          rayGrad.addColorStop(0.25, `rgba(160, 235, 255, ${pulse * 0.9})`);
          rayGrad.addColorStop(0.7, `rgba(70, 190, 235, ${pulse * 0.35})`);
          rayGrad.addColorStop(1, 'rgba(20, 120, 180, 0.0)');

          ctx.beginPath();
          ctx.moveTo(topX - wTop * 0.5, currentWaterY);
          ctx.lineTo(topX + wTop * 0.5, currentWaterY);
          ctx.lineTo(bottomX + wBottom * 0.5, height);
          ctx.lineTo(bottomX - wBottom * 0.5, height);
          ctx.closePath();

          ctx.fillStyle = rayGrad;
          ctx.fill();
        }
        ctx.restore();
      }

      // =========================================================================
      // 3. UNDERWATER CAUSTICS (Mạng lưới ánh sáng loang lổ khúc xạ trên đáy cát & đá)
      // =========================================================================
      if (showCaustics) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';

        // High concentration on left sandy shelf (x: 0% to 40%, y: 50% to 90%)
        const sandCausticsCount = 14;
        const sandBaseX = width * 0.18;
        const sandBaseY = height * 0.68;
        const sandRx = width * 0.18;
        const sandRy = height * 0.22;

        for (let j = 0; j < sandCausticsCount; j++) {
          const u = (j / sandCausticsCount) * Math.PI * 2;
          const causticsWave = Math.sin(time * 1.8 + j * 0.9);
          const cx = sandBaseX + Math.cos(u) * sandRx * (0.8 + causticsWave * 0.15);
          const cy = sandBaseY + Math.sin(u) * sandRy * (0.8 - causticsWave * 0.1);
          const cradius = 24 + Math.sin(time * 2.2 + j) * 10;

          const causticsGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, cradius);
          causticsGrad.addColorStop(0, 'rgba(255, 255, 220, 0.45)');
          causticsGrad.addColorStop(0.4, 'rgba(180, 245, 255, 0.25)');
          causticsGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.ellipse(cx, cy, cradius * 1.4, cradius * 0.7, 0.3, 0, Math.PI * 2);
          ctx.fillStyle = causticsGrad;
          ctx.fill();
        }

        // Secondary caustics ripple lines traversing the seafloor
        ctx.strokeStyle = 'rgba(255, 255, 240, 0.22)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let l = 0; l < 4; l++) {
          const lineY = currentWaterY + (height - currentWaterY) * (0.45 + l * 0.14);
          ctx.moveTo(0, lineY);
          for (let lx = 0; lx < width * 0.42; lx += 20) {
            const rippleY =
              lineY +
              Math.sin(lx * 0.03 + time * 2.0 + l) * 5 +
              Math.cos(lx * 0.015 - time * 1.4) * 3;
            ctx.lineTo(lx, rippleY);
          }
        }
        ctx.stroke();

        ctx.restore();
      }

      // =========================================================================
      // 4. SWIMMING TROPICAL REEF FISH (Đàn cá chuyển động tự nhiên)
      // =========================================================================
      if (showFish) {
        ctx.save();
        for (const fish of fishList) {
          fish.x += fish.vx;
          fish.finPhase += 0.18;
          fish.y += Math.sin(fish.finPhase * 0.5) * 0.4;

          // Wrap around horizontally within comfortable view bounds
          if (fish.vx < 0 && fish.x < width * 0.35) {
            fish.vx = Math.abs(fish.vx); // turn right
          } else if (fish.vx > 0 && fish.x > width * 0.94) {
            fish.vx = -Math.abs(fish.vx); // turn left
          }

          const facing = fish.vx >= 0 ? 1 : -1;
          const s = fish.size;

          ctx.save();
          ctx.translate(fish.x, fish.y);
          ctx.scale(facing, 1);

          // Fish Body
          ctx.beginPath();
          ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
          ctx.fillStyle = fish.color;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 4;
          ctx.fill();

          // Fish Tail
          const tailSway = Math.sin(fish.finPhase) * (s * 0.4);
          ctx.beginPath();
          ctx.moveTo(-s * 0.8, 0);
          ctx.lineTo(-s * 1.5, -s * 0.5 + tailSway);
          ctx.lineTo(-s * 1.5, s * 0.5 + tailSway);
          ctx.closePath();
          ctx.fillStyle = fish.color;
          ctx.fill();

          // Fish Fin
          ctx.beginPath();
          ctx.ellipse(-s * 0.2, s * 0.1, s * 0.3, s * 0.15, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();

          // Fish Eye
          ctx.beginPath();
          ctx.arc(s * 0.55, -s * 0.15, s * 0.14, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(s * 0.6, -s * 0.15, s * 0.08, 0, Math.PI * 2);
          ctx.fillStyle = '#0F172A';
          ctx.fill();

          // Striped detail if striped type
          if (fish.type === 'striped') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = s * 0.18;
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, -s * 0.48);
            ctx.lineTo(-s * 0.1, s * 0.48);
            ctx.moveTo(s * 0.25, -s * 0.4);
            ctx.lineTo(s * 0.25, s * 0.4);
            ctx.stroke();
          }

          ctx.restore();
        }
        ctx.restore();
      }

      // =========================================================================
      // 5. RISING BUBBLES (Bọt khí nổi từ đáy lên mặt nước)
      // =========================================================================
      if (showBubbles) {
        ctx.save();
        for (const b of bubbles) {
          b.y -= b.speed;
          b.phase += 0.04;
          const wobble = Math.sin(b.phase * b.wobbleSpeed) * b.wobbleAmp;

          // Pop when reaching waterLine and respawn from bottom
          if (b.y <= currentWaterY + 4) {
            b.y = height - 40 - Math.random() * 80;
            b.x = width * 0.25 + Math.random() * (width * 0.68);
          }

          const drawX = b.x + wobble;
          ctx.beginPath();
          ctx.arc(drawX, b.y, b.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity * 0.9})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Subtle bubble specular highlight
          ctx.beginPath();
          ctx.arc(drawX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.95})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // =========================================================================
      // 6. LUMINOUS PLANKTON / TYNDALL MOTES (Hạt bụi biển bắt sáng)
      // =========================================================================
      ctx.save();
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y <= currentWaterY) {
          m.y = height - 20;
          m.x = Math.random() * width;
        }
        if (m.x < 0) m.x = width;
        if (m.x > width) m.x = 0;

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 245, 255, ${m.opacity * 0.7})`;
        ctx.shadowColor = 'rgba(180, 240, 255, 0.8)';
        ctx.shadowBlur = 3;
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [waterLineRatio, showFish, showBubbles, showRays, showCaustics]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

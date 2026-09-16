import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  radius: number;
  speedY: number;
  oscAmp: number;
  oscSpeed: number;
  phase: number;
  opacity: number;
  color: string;
}

export interface OceanMotesCanvasProps {
  className?: string;
  count?: number;
  color?: string;
}

export function OceanMotesCanvas({
  className = '',
  count = 35,
  color,
}: OceanMotesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const defaultColors = [
      'rgba(46, 230, 202, ', // Cyan / mint
      'rgba(147, 240, 232, ', // Light aqua
      'rgba(255, 255, 255, ', // White sunlight bubble
      'rgba(125, 211, 252, ', // Sky blue
    ];

    const colors = color
      ? [color.includes(',') && !color.endsWith(',') ? color.replace(/,[^,]*\)$/, ', ') : color]
      : defaultColors;

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const baseX = Math.random() * width;
      particles.push({
        x: baseX,
        y: Math.random() * height,
        baseX,
        radius: 1.5 + Math.random() * 2.8,
        speedY: 0.35 + Math.random() * 0.55,
        oscAmp: 10 + Math.random() * 18,
        oscSpeed: 0.008 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.35 + Math.random() * 0.50,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;
    let time = 0;

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', onResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Float upward gently with organic wave oscillation
        p.y -= p.speedY;
        p.x = p.baseX + Math.sin(time * p.oscSpeed + p.phase) * p.oscAmp;

        // Wrap around when exiting top
        if (p.y < -12) {
          p.y = height + 12;
          p.baseX = Math.random() * width;
          p.x = p.baseX;
        }

        // Draw soft glowing bioluminescent bubble mote
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(46, 230, 202, 0.65)';
        ctx.fill();

        // Subtle specular highlight inside bubble
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}

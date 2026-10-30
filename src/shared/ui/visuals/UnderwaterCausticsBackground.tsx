import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  opacity: number;
}

interface Fish {
  id: number;
  x: number;
  y: number;
  baseY: number;
  speed: number;
  size: number;
  depth: number;
  tailPhase: number;
  verticalSpeed: number;
  verticalRange: number;
}

interface PlanktonParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulsePhase: number;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  intensity: number;
}

interface RayConfig {
  originRatio: number; // 0..1 across screen width
  angleDeg: number;    // nominal angle in degrees
  widthTop: number;
  widthBottom: number;
  baseIntensity: number;
  oscSpeed: number;
  oscAmp: number;
  phase: number;
}

interface ActiveRayState {
  currentTopX: number;
  currentAngle: number;
  widthTop: number;
  widthBottom: number;
  currentIntensity: number;
}

interface UnderwaterCausticsBackgroundProps {
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function UnderwaterCausticsBackground({
  interactive = true,
  className = '',
  children,
}: UnderwaterCausticsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const causticsCanvasRef = useRef<HTMLCanvasElement>(null);
  const raysCanvasRef = useRef<HTMLCanvasElement>(null);
  const creaturesCanvasRef = useRef<HTMLCanvasElement>(null);

  const [interactiveBubbles, setInteractiveBubbles] = useState<Bubble[]>([]);
  const nextBubbleIdRef = useRef(1);

  // Active ripples list for physical water refraction
  const ripplesRef = useRef<WaterRipple[]>([]);

  // Mouse tracking state for water disturbance
  const mouseRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    active: boolean;
    lastMoveTime: number;
  }>({
    x: -2000,
    y: -2000,
    targetX: -2000,
    targetY: -2000,
    active: false,
    lastMoveTime: 0,
  });

  // Shared active ray states for Tyndall scattering calculations
  const activeRaysRef = useRef<ActiveRayState[]>([]);

  // Play water bubble pop sound using Web Audio API
  const playBubbleSound = useCallback((freq = 550) => {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 2.2, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context may be restricted before user interaction
    }
  }, []);

  // Handle user click to spawn physical water ripple and burst bubbles
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if ((e.target as HTMLElement).closest('button, a, iframe, input')) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      playBubbleSound(480 + Math.random() * 220);

      // 1. Trigger physical optical shockwave ripple
      ripplesRef.current.push({
        x: clickX,
        y: clickY,
        radius: 12,
        maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.75,
        speed: 4.8,
        intensity: 1.0,
      });

      // 2. Spawn 3-5 rising playful bubbles
      const count = 3 + Math.floor(Math.random() * 3);
      const newBubbles: Bubble[] = [];
      for (let i = 0; i < count; i++) {
        newBubbles.push({
          id: nextBubbleIdRef.current++,
          x: clickX + (Math.random() - 0.5) * 35,
          y: clickY + (Math.random() - 0.5) * 20,
          radius: 3 + Math.random() * 6,
          speed: 1.5 + Math.random() * 2.2,
          wobbleSpeed: 2 + Math.random() * 3,
          wobbleAmp: 6 + Math.random() * 8,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.85,
        });
      }

      setInteractiveBubbles((prev) => [...prev.slice(-25), ...newBubbles]);
    },
    [interactive, playBubbleSound]
  );

  // Track pointer movements across the entire viewport for water parallax & ray refraction
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
      mouseRef.current.active = true;
      mouseRef.current.lastMoveTime = performance.now();
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  // =========================================================================
  // 1. DYNAMIC REFRACTIVE GOD RAYS & WATER SURFACE SHIMMER CANVAS
  // =========================================================================
  useEffect(() => {
    const canvas = raysCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 6 Distinct volumetric sunbeam configurations
    const rayConfigs: RayConfig[] = [
      { originRatio: 0.14, angleDeg: -16, widthTop: 50, widthBottom: 190, baseIntensity: 0.38, oscSpeed: 0.55, oscAmp: 30, phase: 0.0 },
      { originRatio: 0.28, angleDeg: -10, widthTop: 70, widthBottom: 250, baseIntensity: 0.46, oscSpeed: 0.70, oscAmp: 35, phase: 1.4 },
      { originRatio: 0.44, angleDeg: -4,  widthTop: 95, widthBottom: 320, baseIntensity: 0.58, oscSpeed: 0.50, oscAmp: 42, phase: 2.8 },
      { originRatio: 0.62, angleDeg: 5,   widthTop: 85, widthBottom: 280, baseIntensity: 0.52, oscSpeed: 0.65, oscAmp: 38, phase: 4.1 },
      { originRatio: 0.79, angleDeg: 12,  widthTop: 65, widthBottom: 230, baseIntensity: 0.42, oscSpeed: 0.60, oscAmp: 32, phase: 5.3 },
      { originRatio: 0.93, angleDeg: 17,  widthTop: 45, widthBottom: 170, baseIntensity: 0.32, oscSpeed: 0.45, oscAmp: 25, phase: 0.9 },
    ];

    let time = 0;

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse spring interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Update and prune physical ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.intensity *= 0.985;
        if (r.radius > r.maxRadius || r.intensity < 0.02) {
          ripples.splice(i, 1);
        }
      }

      // --- A. Render Realistic Volumetric Light Rays ---
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const currentActiveRays: ActiveRayState[] = [];

      rayConfigs.forEach((ray) => {
        // Physical surface wave modulation for ray origin & angle
        const waveTopShift =
          Math.sin(time * ray.oscSpeed + ray.phase) * ray.oscAmp +
          Math.cos(time * 0.8 + ray.phase * 1.5) * (ray.oscAmp * 0.35);

        const currentTopX = width * ray.originRatio + waveTopShift;
        const currentAngleDeg = ray.angleDeg + Math.sin(time * 0.6 + ray.phase) * 3.5;
        const currentAngleRad = (currentAngleDeg * Math.PI) / 180;

        // Wave crest focusing: when surface wave crests over the ray, light focuses and brightens
        const waveFocus = 0.8 + Math.sin(time * 1.6 + ray.phase) * 0.2 + Math.cos(time * 0.9) * 0.1;
        const currentIntensity = ray.baseIntensity * waveFocus;

        currentActiveRays.push({
          currentTopX,
          currentAngle: currentAngleDeg,
          widthTop: ray.widthTop,
          widthBottom: ray.widthBottom,
          currentIntensity,
        });

        // Generate curved fluid ray contour along 14 depth slices
        const slices = 14;
        const leftPoints: { x: number; y: number }[] = [];
        const rightPoints: { x: number; y: number }[] = [];

        for (let s = 0; s <= slices; s++) {
          const depthRatio = s / slices;
          const y = depthRatio * (height + 80) - 20;

          // Nominal straight ray path
          const nominalX = currentTopX + Math.tan(currentAngleRad) * (y + 20);
          const nominalW = ray.widthTop + (ray.widthBottom - ray.widthTop) * depthRatio + Math.sin(time * 2.2 + s * 0.6) * 8;

          // Natural liquid wave undulation
          const liquidUndulation =
            Math.sin(time * 1.4 + s * 0.45 + ray.phase) * 14 +
            Math.cos(time * 0.9 + s * 0.7) * 7;

          // Mouse fluid deflection (acts like stirring water with a hand)
          let mouseDeflection = 0;
          if (mouse.active) {
            const mdx = nominalX - mouse.x;
            const mdy = y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 350) {
              const factor = Math.exp(-mdist / 150);
              mouseDeflection = (mdx / (mdist + 40)) * 65 * factor;
            }
          }

          // Optical shockwave refraction from clicks
          let rippleRefraction = 0;
          for (const rip of ripples) {
            const rdx = nominalX - rip.x;
            const rdy = y - rip.y;
            const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
            const diff = rdist - rip.radius;
            if (Math.abs(diff) < 85) {
              rippleRefraction +=
                Math.sin(diff * 0.09) * rip.intensity * 28 * Math.exp(-Math.abs(diff) / 45);
            }
          }

          const centerX = nominalX + liquidUndulation + mouseDeflection + rippleRefraction;
          leftPoints.push({ x: centerX - nominalW / 2, y });
          rightPoints.push({ x: centerX + nominalW / 2, y });
        }

        // Draw the volumetric light beam polygon with smooth quadratic curves
        ctx.beginPath();
        ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
        for (let j = 1; j < leftPoints.length; j++) {
          const xc = (leftPoints[j - 1].x + leftPoints[j].x) / 2;
          const yc = (leftPoints[j - 1].y + leftPoints[j].y) / 2;
          ctx.quadraticCurveTo(leftPoints[j - 1].x, leftPoints[j - 1].y, xc, yc);
        }
        ctx.lineTo(leftPoints[leftPoints.length - 1].x, leftPoints[leftPoints.length - 1].y);
        ctx.lineTo(rightPoints[rightPoints.length - 1].x, rightPoints[rightPoints.length - 1].y);
        for (let j = rightPoints.length - 2; j >= 0; j--) {
          const xc = (rightPoints[j + 1].x + rightPoints[j].x) / 2;
          const yc = (rightPoints[j + 1].y + rightPoints[j].y) / 2;
          ctx.quadraticCurveTo(rightPoints[j + 1].x, rightPoints[j + 1].y, xc, yc);
        }
        ctx.closePath();

        // Beer-Lambert vertical light attenuation in water
        const rayGrad = ctx.createLinearGradient(currentTopX, -20, currentTopX + Math.tan(currentAngleRad) * height, height);
        rayGrad.addColorStop(0.0, `rgba(255, 255, 255, ${0.46 * currentIntensity})`);
        rayGrad.addColorStop(0.18, `rgba(225, 252, 255, ${0.34 * currentIntensity})`);
        rayGrad.addColorStop(0.52, `rgba(145, 240, 255, ${0.18 * currentIntensity})`);
        rayGrad.addColorStop(0.82, `rgba(75, 220, 250, ${0.06 * currentIntensity})`);
        rayGrad.addColorStop(1.0, 'rgba(30, 185, 225, 0)');

        ctx.fillStyle = rayGrad;
        ctx.fill();

        // Inner beam luminous core (condensed light shaft center)
        ctx.beginPath();
        ctx.moveTo(leftPoints[0].x + ray.widthTop * 0.35, leftPoints[0].y);
        for (let j = 1; j < leftPoints.length; j++) {
          const xc = (leftPoints[j - 1].x + rightPoints[j - 1].x) / 2;
          const yc = (leftPoints[j - 1].y + leftPoints[j].y) / 2;
          ctx.lineTo(xc, yc);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.22 * currentIntensity})`;
        ctx.lineWidth = ray.widthTop * 0.3;
        ctx.filter = 'blur(10px)';
        ctx.stroke();
        ctx.filter = 'none';

        // Optical entry glint at the water surface (meniscus lens flare)
        const lensGrad = ctx.createRadialGradient(currentTopX, 0, 0, currentTopX, 0, ray.widthTop * 0.85);
        lensGrad.addColorStop(0, `rgba(255, 255, 255, ${0.72 * currentIntensity})`);
        lensGrad.addColorStop(0.35, `rgba(200, 250, 255, ${0.40 * currentIntensity})`);
        lensGrad.addColorStop(1, 'rgba(100, 230, 255, 0)');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(currentTopX, 0, ray.widthTop * 0.85, 0, Math.PI);
        ctx.fill();
      });

      activeRaysRef.current = currentActiveRays;

      // --- B. Shimmering Water Surface Underside (Meniscus Line) ---
      ctx.beginPath();
      for (let x = 0; x <= width; x += 25) {
        const waveY =
          12 +
          Math.sin(x * 0.012 + time * 1.8) * 6 +
          Math.cos(x * 0.028 - time * 2.1) * 4;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      const surfaceGrad = ctx.createLinearGradient(0, 0, 0, 30);
      surfaceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      surfaceGrad.addColorStop(0.6, 'rgba(190, 245, 255, 0.20)');
      surfaceGrad.addColorStop(1, 'rgba(120, 220, 255, 0)');
      ctx.fillStyle = surfaceGrad;
      ctx.fill();

      // --- C. Expanding Physical Ripple Refraction Waves ---
      for (const rip of ripples) {
        ctx.save();
        ctx.strokeStyle = `rgba(235, 255, 255, ${rip.intensity * 0.28})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary ripple echo
        if (rip.radius > 35) {
          ctx.strokeStyle = `rgba(180, 245, 255, ${rip.intensity * 0.16})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(rip.x, rip.y, rip.radius * 0.72, rip.radius * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // =========================================================================
  // 2. PROCEDURAL CAUSTICS WEB CANVAS (Light Refraction Network on Seabed)
  // =========================================================================
  useEffect(() => {
    const canvas = causticsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = Math.floor(window.innerWidth / 3)); // Render at 1/3 scale for 60fps
    let height = (canvas.height = Math.floor(window.innerHeight / 3));

    const handleResize = () => {
      width = canvas.width = Math.floor(window.innerWidth / 3);
      height = canvas.height = Math.floor(window.innerHeight / 3);
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    // Moving caustic nodes in dual-phase harmonic orbits
    const nodeCount = 15;
    const nodes: { ox: number; oy: number; speedX: number; speedY: number; radius: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        ox: (i / nodeCount) * width,
        oy: height * 0.35 + Math.random() * (height * 0.65),
        speedX: 0.0008 + Math.random() * 0.0012,
        speedY: 0.001 + Math.random() * 0.0015,
        radius: width * (0.16 + Math.random() * 0.24),
      });
    }

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Composite multi-layered caustic rings with screen
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];
        const cx = node.ox + Math.sin(time * node.speedX * 60 + i) * (width * 0.12);
        const cy = node.oy + Math.cos(time * node.speedY * 60 + i * 1.5) * (height * 0.14);

        const grad = ctx.createRadialGradient(cx, cy, node.radius * 0.08, cx, cy, node.radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
        grad.addColorStop(0.35, 'rgba(195, 250, 255, 0.15)');
        grad.addColorStop(0.7, 'rgba(125, 230, 245, 0.06)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shimmering caustic wave crest filaments across the seabed
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0; x < width; x += 28) {
        const waveY =
          height * 0.68 +
          Math.sin(x * 0.045 + time * 1.3) * 10 +
          Math.cos(x * 0.022 + time * 0.85) * 7;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // =========================================================================
  // 3. DYNAMIC CREATURES & TYNDALL EFFECT PARTICLES CANVAS
  // =========================================================================
  useEffect(() => {
    const canvas = creaturesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize School of Fish (swimming across in deep water)
    const schoolSize = 8;
    const fishSchool: Fish[] = [];
    for (let i = 0; i < schoolSize; i++) {
      fishSchool.push({
        id: i,
        x: -80 - i * 28 + (Math.random() - 0.5) * 40,
        y: height * 0.35 + (i - schoolSize / 2) * 22 + (Math.random() - 0.5) * 30,
        baseY: height * 0.35 + (i - schoolSize / 2) * 22,
        speed: 1.1 + Math.random() * 0.45,
        size: 16 + Math.random() * 10,
        depth: 0.55 + Math.random() * 0.35,
        tailPhase: i * 0.45,
        verticalSpeed: 1.2 + Math.random() * 0.8,
        verticalRange: 8 + Math.random() * 10,
      });
    }

    // Initialize Ambient Rising Bubbles
    const ambientBubbleCount = 18;
    const ambientBubbles: Bubble[] = [];
    for (let i = 0; i < ambientBubbleCount; i++) {
      ambientBubbles.push({
        id: i,
        x: Math.random() * width,
        y: height + Math.random() * 200,
        radius: 3 + Math.random() * 7,
        speed: 0.6 + Math.random() * 1.1,
        wobbleSpeed: 1.2 + Math.random() * 1.8,
        wobbleAmp: 4 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.4 + Math.random() * 0.45,
      });
    }

    // Initialize Plankton / Marine Snow Particles with Tyndall Scattering
    const particleCount = 42;
    const particles: PlanktonParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.2 + Math.random() * 2.6,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: 0.15 + Math.random() * 0.35,
        opacity: 0.25 + Math.random() * 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Helper: Determine if a coordinate falls inside any active light shaft (Tyndall illumination)
    const computeTyndallIllumination = (px: number, py: number): number => {
      let maxIntensity = 0;
      const rays = activeRaysRef.current;
      for (let i = 0; i < rays.length; i++) {
        const r = rays[i];
        const rayAngleRad = (r.currentAngle * Math.PI) / 180;
        const rayCenterX = r.currentTopX + Math.tan(rayAngleRad) * (py + 20);
        const depthRatio = Math.max(0, Math.min(1, py / height));
        const rayW = r.widthTop + (r.widthBottom - r.widthTop) * depthRatio;
        const dist = Math.abs(px - rayCenterX);
        const halfW = rayW * 0.52;

        if (dist < halfW) {
          const normDist = dist / halfW;
          const beamIntensity = Math.cos(normDist * (Math.PI / 2)) * r.currentIntensity;
          if (beamIntensity > maxIntensity) maxIntensity = beamIntensity;
        }
      }
      return maxIntensity;
    };

    let time = 0;

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // --- A. Draw School of Fish ---
      for (const fish of fishSchool) {
        fish.x += fish.speed;
        fish.y = fish.baseY + Math.sin(time * fish.verticalSpeed + fish.tailPhase) * fish.verticalRange;

        if (fish.x > width + 120) {
          fish.x = -100 - Math.random() * 150;
          fish.baseY = height * (0.2 + Math.random() * 0.45);
        }

        ctx.save();
        ctx.translate(fish.x, fish.y);

        const scale = fish.depth;
        ctx.scale(scale, scale);
        ctx.globalAlpha = 0.55 * fish.depth;

        ctx.fillStyle = '#083344';
        ctx.beginPath();
        ctx.moveTo(-fish.size, 0);
        ctx.quadraticCurveTo(0, -fish.size * 0.38, fish.size, 0);
        ctx.quadraticCurveTo(0, fish.size * 0.38, -fish.size, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(fish.size * 0.2, 0);
        ctx.lineTo(fish.size * 0.05, fish.size * 0.4);
        ctx.lineTo(-fish.size * 0.15, fish.size * 0.1);
        ctx.fill();

        const tailAngle = Math.sin(time * 12 + fish.tailPhase) * 0.32;
        ctx.save();
        ctx.translate(-fish.size, 0);
        ctx.rotate(tailAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-fish.size * 0.5, -fish.size * 0.35);
        ctx.lineTo(-fish.size * 0.35, 0);
        ctx.lineTo(-fish.size * 0.5, fish.size * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      // --- B. Draw Ambient Rising Bubbles ---
      for (const bubble of ambientBubbles) {
        bubble.y -= bubble.speed;
        const currentX = bubble.x + Math.sin(time * bubble.wobbleSpeed + bubble.phase) * bubble.wobbleAmp;

        if (bubble.y < 30) {
          bubble.y = height + 10 + Math.random() * 60;
          bubble.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = bubble.opacity;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.lineWidth = 1.2;
        ctx.fillStyle = 'rgba(180, 245, 255, 0.12)';

        ctx.beginPath();
        ctx.arc(currentX, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Specular reflection highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(
          currentX - bubble.radius * 0.35,
          bubble.y - bubble.radius * 0.35,
          bubble.radius * 0.25,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
      }

      // --- C. Draw Marine Snow with Physical Tyndall Scattering ---
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(time + p.pulsePhase) * 0.25;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        const tyndall = computeTyndallIllumination(p.x, p.y);

        ctx.save();
        if (tyndall > 0.08) {
          // Tyndall Effect: Particle is inside a sunlight shaft!
          // Glows vividly with diamond shine and specular halo
          const flareOpacity = Math.min(1.0, 0.45 + tyndall * 0.75);
          ctx.globalAlpha = flareOpacity;
          ctx.shadowColor = 'rgba(215, 255, 255, 0.95)';
          ctx.shadowBlur = 8 + tyndall * 8;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + tyndall * 0.5), 0, Math.PI * 2);
          ctx.fill();

          // Subtle twinkle cross for prominent particles
          if (tyndall > 0.32 && p.size > 2.0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x - 3.5, p.y);
            ctx.lineTo(p.x + 3.5, p.y);
            ctx.moveTo(p.x, p.y - 3.5);
            ctx.lineTo(p.x, p.y + 3.5);
            ctx.stroke();
          }
        } else {
          // Shadow particle: soft, ambient marine snow
          const pulseOpacity = p.opacity * (0.6 + Math.sin(time * 2 + p.pulsePhase) * 0.25);
          ctx.globalAlpha = pulseOpacity;
          ctx.fillStyle = 'rgba(200, 240, 250, 0.65)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 4. Update interactive click-spawned bubbles
  useEffect(() => {
    if (interactiveBubbles.length === 0) return;
    const timer = setInterval(() => {
      setInteractiveBubbles((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.y - b.speed,
            x: b.x + Math.sin(b.phase) * 1.5,
            opacity: b.opacity - 0.008,
            phase: b.phase + 0.1,
          }))
          .filter((b) => b.y > 20 && b.opacity > 0.05)
      );
    }, 16);
    return () => clearInterval(timer);
  }, [interactiveBubbles.length]);

  return (
    <div
      ref={containerRef}
      onClick={handleBackgroundClick}
      className={`relative w-full h-full overflow-hidden select-none cursor-default ${className}`}
    >
      {/* 1. High-Res Realistic Underwater Panorama Base Image */}
      <img
        src="/assets/generated/backgrounds/ocean_underwater_viewer_bg.jpg"
        alt="Đáy biển ngập nắng"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] transition-transform duration-1000 ease-out pointer-events-none"
      />

      {/* 2. Deep Water Atmospheric Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#083042]/30 via-[#0c4a5f]/15 to-[#052331]/40 pointer-events-none" />

      {/* 3. Canvas: Dynamic Volumetric God Rays, Surface Shimmer & Optical Ripples */}
      <canvas
        ref={raysCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[4] mix-blend-screen opacity-90 transform-gpu"
      />

      {/* 4. Canvas: Procedural Underwater Caustics Web on Seabed */}
      <canvas
        ref={causticsCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[6] mix-blend-color-dodge opacity-50 transform-gpu"
      />

      {/* 5. Canvas: Marine Life & Tyndall Scattering Particles */}
      <canvas
        ref={creaturesCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 transform-gpu"
      />

      {/* 6. Interactive Click-Spawned Bubbles */}
      {interactiveBubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full border border-white/80 bg-white/15 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.6)] z-15"
          style={{
            left: `${b.x}px`,
            top: `${b.y}px`,
            width: `${b.radius * 2}px`,
            height: `${b.radius * 2}px`,
            opacity: b.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Specular dot */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              left: '25%',
              top: '25%',
              width: `${Math.max(2, b.radius * 0.45)}px`,
              height: `${Math.max(2, b.radius * 0.45)}px`,
            }}
          />
        </div>
      ))}

      {/* 7. Ambient Swaying Seagrass at Bottom Corners */}
      {/* Bottom-Left Seagrass Cluster */}
      <div className="absolute -bottom-4 -left-6 z-10 pointer-events-none opacity-40 mix-blend-luminosity filter blur-[0.8px]">
        <svg
          className="w-48 h-56 text-[#083042] transform origin-bottom animate-sway"
          viewBox="0 0 100 120"
          fill="currentColor"
        >
          <path d="M20 120C18 90 12 60 5 30C10 60 18 90 22 120Z" />
          <path d="M35 120C32 85 24 50 14 15C22 50 32 85 38 120Z" />
          <path d="M50 120C48 80 40 45 28 8C36 45 46 80 54 120Z" />
          <path d="M65 120C65 85 60 55 52 25C58 55 64 85 68 120Z" />
          <path d="M80 120C82 90 85 65 88 40C84 65 80 90 78 120Z" />
        </svg>
      </div>

      {/* Bottom-Right Seagrass Cluster */}
      <div className="absolute -bottom-6 -right-6 z-10 pointer-events-none opacity-35 mix-blend-luminosity filter blur-[0.8px]">
        <svg
          className="w-52 h-60 text-[#083042] transform origin-bottom animate-sway-reverse"
          viewBox="0 0 100 120"
          fill="currentColor"
        >
          <path d="M80 120C82 90 88 60 95 30C90 60 82 90 78 120Z" />
          <path d="M65 120C68 85 76 50 86 15C78 50 68 85 62 120Z" />
          <path d="M50 120C52 80 60 45 72 8C64 45 54 80 46 120Z" />
          <path d="M35 120C35 85 40 55 48 25C42 55 36 85 32 120Z" />
        </svg>
      </div>

      {/* 8. Content / 3D Canvas Injection Slot */}
      <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">{children}</div>
    </div>
  );
}


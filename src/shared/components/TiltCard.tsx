import { useState, useRef, type ReactNode, type HTMLAttributes } from 'react';

export interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxTilt?: number;
  glare?: boolean;
  className?: string;
}

export function TiltCard({
  children,
  maxTilt = 7,
  glare = true,
  className = '',
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState('none');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

    const rotX = ((0.5 - y) * maxTilt * 2).toFixed(2);
    const rotY = ((x - 0.5) * maxTilt * 2).toFixed(2);

    setTransform(`perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePos({ x: x * 100, y: y * 100, opacity: 0.28 });
    setIsHovered(true);

    if (onPointerMove) onPointerMove(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
    setIsHovered(false);

    if (onPointerLeave) onPointerLeave(e);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        ...style,
        transform,
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
      {...props}
    >
      {children}

      {/* Dynamic Specular Glass Glare Reflection */}
      {glare && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 overflow-hidden mix-blend-screen"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

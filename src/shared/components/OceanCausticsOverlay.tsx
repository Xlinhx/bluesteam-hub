export function OceanCausticsOverlay({
  className = '',
  opacity = 0.70,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Dynamic Caustic Light Ribbons */}
      <div className="absolute inset-0 ocean-caustics-layer ocean-caustics-1 mix-blend-screen" />
      <div className="absolute inset-0 ocean-caustics-layer ocean-caustics-2 mix-blend-overlay" />
      {/* Sunbeams piercing down from water surface */}
      <div className="absolute inset-0 ocean-sunbeams mix-blend-screen pointer-events-none" />
    </div>
  );
}

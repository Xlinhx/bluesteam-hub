/**
 * 360 Orbit rotation icon with orbit ring and arrow tip
 * Matching exact "Kéo để xoay" visual badge in mockup
 */
export function DragToRotateIcon({ className = 'w-7 h-7 text-white' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 3D Sphere Dome Arc */}
      <path
        d="M8.5 13.5C8.5 7.8 11.8 5 16 5C20.2 5 23.5 7.8 23.5 13.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Equatorial Orbit Ellipse */}
      <ellipse
        cx="16"
        cy="15"
        rx="12.5"
        ry="5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </svg>
  );
}

/**
 * Badge "Kéo để xoay" overlay for creature cards
 */
export function DragToRotateBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] ${className}`}
    >
      <DragToRotateIcon className="w-6 h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
      <span className="text-[10px] sm:text-[11px] font-semibold text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
        Kéo để xoay
      </span>
    </div>
  );
}

/**
 * Isometric 3D Cube Icon
 * Displays the 3 visible faces of an isometric box with clean line strokes
 */
export function IsometricCubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Top face */}
      <path d="M12 3 L20 7.5 L12 12 L4 7.5 Z" />
      {/* Left face */}
      <path d="M4 7.5 V16.5 L12 21 V12 Z" />
      {/* Right face */}
      <path d="M20 7.5 V16.5 L12 21 V12 Z" />
    </svg>
  );
}

/**
 * 4-Pointed Cyan Sparkle Star Icon
 * Matching the sparkle next to "Bé muốn ngắm bạn nào?"
 */
export function OceanSparkleIcon({ className = 'w-4 h-4 text-[#2EE6CA]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0 C12 6.6 17.4 12 24 12 C17.4 12 12 17.4 12 24 C12 17.4 6.6 12 0 12 C6.6 12 12 6.6 12 0 Z" />
    </svg>
  );
}

/**
 * Right Arrow for "Quan sát ➔" pill button
 */
export function RightArrowNavIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 10 H16" />
      <path d="M11 5 L16 10 L11 15" />
    </svg>
  );
}

/**
 * Starfish Doodle Outline
 * Ambient decorative element on the right margin of the page
 */
export function StarfishOutlineDoodle({ className = 'w-10 h-10 text-[#17657A]/20' }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M32 6 C33 18 36 23 48 24 C37 28 35 34 38 46 C30 38 25 39 18 48 C20 36 17 31 6 28 C18 25 21 19 22 8 Z" />
      <circle cx="32" cy="27" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Floating Marine Bubble
 */
export function FloatingBubbleIcon({
  size = 20,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`pointer-events-none select-none shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#17657A"
        strokeWidth="1.2"
        strokeOpacity="0.3"
        fill="#2EE6CA"
        fillOpacity="0.12"
      />
      <ellipse
        cx="8.5"
        cy="8"
        rx="2.5"
        ry="1.5"
        fill="white"
        fillOpacity="0.85"
        transform="rotate(-30 8.5 8)"
      />
    </svg>
  );
}

/**
 * Organic Wave Curve Divider
 * Smooth sine wave transitioning from underwater banner to page background
 */
export function OrganicWaveDivider({
  fillColor = '#FBF9F4',
  className = '',
}: {
  fillColor?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={`w-full h-8 sm:h-12 lg:h-14 block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0 0 C240 38 480 56 720 56 C960 56 1200 38 1440 0 V64 H0 Z"
        fill={fillColor}
      />
    </svg>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';

interface SketchfabTurtleViewerProps {
  autoRotate?: boolean;
  resetTrigger?: number;
  zoomTrigger?: number;
  className?: string;
  onLoaded?: () => void;
}

export function SketchfabTurtleViewer({
  autoRotate = false,
  resetTrigger = 0,
  zoomTrigger = 0,
  className = '',
  onLoaded,
}: SketchfabTurtleViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Store last reset trigger to detect explicit user resets
  const prevResetTriggerRef = useRef(resetTrigger);
  const prevZoomTriggerRef = useRef(zoomTrigger);

  useEffect(() => {
    if (zoomTrigger > prevZoomTriggerRef.current) {
      prevZoomTriggerRef.current = zoomTrigger;
    }
  }, [zoomTrigger]);

  // Fallback direct embed URL with all UI & watermark hidden and pure transparency
  const getEmbedUrl = useCallback((rotating: boolean) => {
    return `https://sketchfab.com/models/d78bafecfacb41c5a15e5ec3d7b36e10/embed?autostart=1&transparent=1&ui_watermark=0&ui_infos=0&ui_controls=0&ui_stop=0&ui_hint=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&autospin=${
      rotating ? '0.35' : '0'
    }`;
  }, []);

  // Handle iframe load event for seamless fade-in
  const handleIframeLoad = () => {
    // Delay slightly to ensure WebGL canvas inside iframe is fully rendered
    setTimeout(() => {
      setIsLoaded(true);
      onLoaded?.();
    }, 600);
  };

  // Watch for resetTrigger to smoothly re-center without flickering
  useEffect(() => {
    if (resetTrigger > prevResetTriggerRef.current) {
      prevResetTriggerRef.current = resetTrigger;
      // Reload iframe smoothly if reset was requested
      if (iframeRef.current) {
        iframeRef.current.src = getEmbedUrl(autoRotate);
      }
    }
  }, [resetTrigger, autoRotate, getEmbedUrl]);

  // Watch for autoRotate changes
  useEffect(() => {
    if (iframeRef.current && isLoaded) {
      // Update src smoothly
      iframeRef.current.src = getEmbedUrl(autoRotate);
    }
  }, [autoRotate, getEmbedUrl, isLoaded]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none ${
        isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      onMouseDown={() => setIsGrabbing(true)}
      onMouseUp={() => setIsGrabbing(false)}
      onMouseLeave={() => setIsGrabbing(false)}
    >
      {/* 1. Progressive Underwater Skeleton Loading State */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ease-out pointer-events-none z-20 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Holographic Water Silhouette Turtle */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Pulsing Water Ripples */}
          <div className="absolute inset-0 rounded-full border border-cyan-200/30 animate-ping opacity-25" />
          <div className="absolute inset-8 rounded-full border border-white/40 animate-pulse opacity-30" />

          {/* Turtle Silhouette with Shimmer */}
          <div className="relative w-48 h-48 rounded-full bg-cyan-400/10 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.25)]">
            <svg
              className="w-32 h-32 text-cyan-200/60 animate-pulse"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <ellipse cx="50" cy="50" rx="26" ry="34" />
              <circle cx="50" cy="18" r="10" />
              <path d="M26 34 Q 8 18 10 38 Q 20 48 26 44 Z" />
              <path d="M74 34 Q 92 18 90 38 Q 80 48 74 44 Z" />
              <path d="M30 76 Q 16 92 24 94 Q 34 88 34 78 Z" />
              <path d="M70 76 Q 84 92 76 94 Q 66 88 66 78 Z" />
            </svg>
          </div>
        </div>

        {/* Loading Message Pill */}
        <div className="mt-4 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/70 shadow-lg flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#17657A] animate-ping" />
          <span className="text-xs font-bold text-[#102A38] tracking-wide">
            Đang lặn xuống ngắm bạn rùa...
          </span>
        </div>
      </div>

      {/* 2. Persistent 3D Sketchfab Iframe (GPU Composited, Pure Transparency, 0 Watermark) */}
      <iframe
        ref={iframeRef}
        title="Model 117A - Juvenile Leatherback sea turtle by DigitalLife3D"
        className={`w-full h-full border-0 bg-transparent transform-gpu transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        src={getEmbedUrl(autoRotate)}
        onLoad={handleIframeLoad}
        onError={() => setHasError(true)}
      />

      {/* 3. Scientific Provenance Badge */}
      <div
        className={`hidden md:flex absolute bottom-24 left-6 lg:left-10 z-30 pointer-events-auto bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/70 shadow-sm text-[11px] font-semibold text-[#102A38]/90 items-center gap-2 transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Mẫu vật 3D khoa học: <strong>DigitalLife3D & Upwell Turtles</strong> (CC BY-NC 4.0)
        </span>
      </div>

      {/* Fallback notification if network fails */}
      {hasError && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-rose-50 text-rose-800 text-xs px-4 py-2 rounded-xl border border-rose-200">
          Không tải được mô hình trực tuyến. Bạn có thể chuyển sang chế độ Mô phỏng Three.js ở trên.
        </div>
      )}
    </div>
  );
}

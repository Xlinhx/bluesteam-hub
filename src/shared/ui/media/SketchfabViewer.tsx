import { useState, useEffect, useRef, useCallback } from 'react';
import {

  RotateCcw,
  Maximize2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { parseSketchfabUrlClient } from '../../api/catalog';

export type SketchfabViewerStatus = 'idle' | 'checking' | 'ready' | 'blocked' | 'timeout';

export function parseSketchfabUid(rawInput: string): string | null {
  const input = (rawInput || '').trim();
  if (/^[a-f0-9]{32}$/i.test(input)) return input.toLowerCase();
  const parsed = parseSketchfabUrlClient(input);
  return parsed.valid ? parsed.modelUid : null;
}

export interface SketchfabViewerProps {
  modelUidOrUrl?: string;
  modelUid?: string;
  uid?: string;
  title: string;
  coverUrl?: string;
  fallbackImage?: string;
  heightClassName?: string;
  className?: string;
  creatorName?: string;
  sourceUrl?: string;
  attribution?: {
    creator?: string;
    license?: string;
    sourceUrl?: string;
  };
  onStatusChange?: (status: SketchfabViewerStatus, modelUid: string | null) => void;
}

export function SketchfabViewer({
  modelUidOrUrl,
  modelUid,
  uid,
  title,
  coverUrl,
  fallbackImage,
  heightClassName = 'h-[420px] sm:h-[520px]',
  attribution,
  onStatusChange,
}: SketchfabViewerProps) {
  const resolvedInput = (modelUidOrUrl ?? modelUid ?? uid ?? '').trim();
  const effectiveCoverUrl = coverUrl ?? fallbackImage;

  const parsed = /^[a-f0-9]{32}$/i.test(resolvedInput)
    ? {
        valid: true,
        provider: 'sketchfab' as const,
        modelUid: resolvedInput.toLowerCase(),
        canonicalUrl: `https://sketchfab.com/3d-models/${resolvedInput.toLowerCase()}`,
        embedUrl: `https://sketchfab.com/models/${resolvedInput.toLowerCase()}/embed?autostart=1&ui_infos=0&ui_stop=0&ui_watermark=0`,
      }
    : parseSketchfabUrlClient(resolvedInput);

  const [status, setStatus] = useState<SketchfabViewerStatus>(() =>
    parsed.valid ? 'checking' : 'blocked',
  );
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const apiRef = useRef<any>(null);

  const updateStatus = useCallback(
    (next: SketchfabViewerStatus) => {
      setStatus(next);
      onStatusChange?.(next, parsed.modelUid);
    },
    [onStatusChange, parsed.modelUid],
  );

  useEffect(() => {
    if (!parsed.valid || !parsed.modelUid) {
      updateStatus('blocked');
      return;
    }

    updateStatus('checking');
    apiRef.current = null;

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !apiRef.current) {
        updateStatus('timeout');
      }
    }, 30000);

    const initSdk = () => {
      if (cancelled || !iframeRef.current) return;
      const SketchfabCtor = (window as any).Sketchfab;
      if (!SketchfabCtor) return;

      try {
        const client = new SketchfabCtor(iframeRef.current);
        client.init(parsed.modelUid, {
          autostart: 1,
          ui_infos: 0,
          ui_stop: 0,
          ui_watermark: 0,
          success: (api: any) => {
            if (cancelled) return;
            api.addEventListener('viewerready', () => {
              if (cancelled) return;
              window.clearTimeout(timeoutId);
              apiRef.current = api;
              updateStatus('ready');
            });
            api.start();
          },
          error: () => {
            if (cancelled) return;
            window.clearTimeout(timeoutId);
            updateStatus('blocked');
          },
        });
      } catch {
        if (!cancelled) {
          window.clearTimeout(timeoutId);
          updateStatus('blocked');
        }
      }
    };

    let existingScript = document.querySelector(
      'script[data-sketchfab-sdk="1"]',
    ) as HTMLScriptElement | null;
    if (existingScript?.dataset.failed === '1') { existingScript.remove(); existingScript = null; }
    const sdkFailure = () => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      updateStatus('blocked');
    };

    if ((window as any).Sketchfab) {
      initSdk();
    } else if (existingScript) {
      existingScript.addEventListener('load', initSdk);
      existingScript.addEventListener('error', sdkFailure);
    } else {
      const script = document.createElement('script');
      script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
      script.async = true;
      script.setAttribute('data-sketchfab-sdk', '1');
      script.onload = initSdk;
      script.onerror = () => {
        script.dataset.failed = '1';
        sdkFailure();
      };
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      existingScript?.removeEventListener('load', initSdk);
      existingScript?.removeEventListener('error', sdkFailure);
    };
  }, [parsed.valid, parsed.modelUid, retryCount, updateStatus]);

  const handleResetCamera = () => {
    if (apiRef.current && typeof apiRef.current.recenterCamera === 'function') {
      apiRef.current.recenterCamera();
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (typeof containerRef.current.requestFullscreen === 'function') {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        ref={containerRef}
        className={`relative w-full ${heightClassName} rounded-[20px] bg-[#0B2230] border border-[#D7E4E7] overflow-hidden`}
      >
        {effectiveCoverUrl && (
          <img
            src={effectiveCoverUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}

        {parsed.valid && parsed.embedUrl ? (
          <iframe
            ref={iframeRef}
            key={`${parsed.modelUid}-${retryCount}`}
            title={`Mô hình 3D: ${title}`}
            src={parsed.embedUrl}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            onError={() => updateStatus('blocked')}
            className={`relative z-10 w-full h-full border-0 transition-opacity duration-300 ${
              apiRef.current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        ) : null}

        {/* Checking Overlay */}
        {status === 'checking' && !effectiveCoverUrl && (
          <div className="absolute inset-0 bg-[#0B2230]/85 flex flex-col items-center justify-center gap-3 text-white p-6 text-center pointer-events-none">
            <Loader2 className="w-8 h-8 animate-spin text-[#2EE6CA]" />
            <div className="text-base font-bold">Đang chuẩn bị mô hình 3D...</div>
          </div>
        )}

        {/* Blocked / Timeout Error State with Retry */}
        {(status === 'blocked' || status === 'timeout') && (
          <div
            role="alert"
            className="absolute inset-0 z-20 bg-[#0B2230]/95 flex flex-col items-center justify-center gap-4 text-white p-6 text-center"
          >
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <div className="max-w-md space-y-1">
              <div className="text-lg font-bold">
                {status === 'timeout'
                  ? 'Mô hình 3D phản hồi quá thời gian'
                  : 'Không tải được liên kết mô hình 3D'}
              </div>
              <p className="text-sm text-slate-300">
                {parsed.error ||
                  'Liên kết Sketchfab bị chặn hoặc kết nối mạng đang gián đoạn.'}
              </p>
            </div>
            {parsed.valid && (
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="min-h-[48px] px-6 rounded-[12px] bg-[#B74A36] hover:bg-[#9f3d2b] text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử tải lại</span>
              </button>
            )}
          </div>
        )}

        {/* Capability-aware Controls — ONLY rendered when viewer is ready (UI-SPEC M12.4) */}
        {status === 'ready' && (
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {apiRef.current && (
              <button
                type="button"
                onClick={handleResetCamera}
                aria-label="Đặt lại góc nhìn 3D"
                className="min-h-[44px] px-3.5 rounded-[12px] bg-white/95 hover:bg-white text-[#12384B] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#17657A]" />
                <span>Đặt lại góc</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Xem toàn màn hình"
              className="min-h-[44px] px-3.5 rounded-[12px] bg-white/95 hover:bg-white text-[#12384B] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-[#17657A]" />
              <span>Toàn màn hình</span>
            </button>
          </div>
        )}
      </div>

      {/* Status + Attribution Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#436475]">
        <div className="flex items-center gap-1.5 font-semibold">
          {status === 'ready' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Đã tải mô hình 3D sẵn sàng</span>
            </>
          )}
          {status === 'checking' && <span>Đang kiểm tra trạng thái viewer...</span>}
          {(status === 'blocked' || status === 'timeout') && (
            <span className="text-rose-600">Chưa sẵn sàng hiển thị</span>
          )}
        </div>

        {attribution && (
          <div className="flex items-center gap-2">
            <span>
              Nguồn: <strong>{attribution.creator || 'Chưa ghi tác giả'}</strong> ({attribution.license || 'Chưa có thông tin giấy phép'})
            </span>
            {attribution.sourceUrl && (
              <a
                href={attribution.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#17657A] hover:underline font-bold"
              >
                <span>Sketchfab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

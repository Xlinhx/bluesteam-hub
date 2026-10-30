import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useOverlayMotion } from '../motion/useOverlayMotion';

export function ModalFrame({ title, onClose, children, wide = false, fullScreen = false, header, motionSource, motionProfile }: { title: string; onClose: () => void; children: ReactNode | ((close: () => void) => ReactNode); wide?: boolean; fullScreen?: boolean; header?: ReactNode | ((close: () => void) => ReactNode); motionSource?: HTMLElement | null; motionProfile?: 'creative-sea' }) {
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(motionSource?.closest<HTMLElement>('button,[tabindex]') || (typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null));
  const requestClose = useOverlayMotion(panel, onClose, { fullScreen, profile:motionProfile, source: motionSource, preview: motionSource ? '.artwork-full-view' : undefined });
  const close = useRef(requestClose);
  close.current = requestClose;
  useEffect(() => {
    const previous = returnFocus.current;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('input,button')?.focus({ preventScroll: true });
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
      if (e.key !== 'Tab') return;
      const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []).filter(node => node.getClientRects().length > 0);
      const first = nodes[0], last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = scroll; document.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return <div className={`ocean-modal-backdrop ${fullScreen ? 'ocean-modal-backdrop-full' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) requestClose(); }}>
    <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className={`ocean-modal ${wide ? 'ocean-modal-wide' : ''} ${fullScreen ? 'ocean-modal-full' : ''}`}>
      {typeof header === 'function' ? header(requestClose) : header ?? <header><h2>{title}</h2><button className="ocean-icon-button" onClick={requestClose} aria-label="Đóng"><X /></button></header>}
      {typeof children === 'function' ? children(requestClose) : children}
    </div>
  </div>;
}

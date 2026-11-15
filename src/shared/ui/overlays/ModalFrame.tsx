import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useOverlayMotion } from '../motion/useOverlayMotion';
import './modal-frame.css';

export function ModalFrame({ title, onClose, children, wide = false, fullScreen = false, header, motionSource, motionProfile, className = '', topLayer = false }: { title: string; onClose: () => void; children: ReactNode | ((close: () => void) => ReactNode); wide?: boolean; fullScreen?: boolean; header?: ReactNode | ((close: () => void) => ReactNode); motionSource?: HTMLElement | null; motionProfile?: 'creative-sea'; className?: string; topLayer?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  const nativeDialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(motionSource?.closest<HTMLElement>('button,[tabindex]') || (typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null));
  const requestClose = useOverlayMotion(topLayer ? nativeDialog : panel, onClose, { fullScreen, profile:motionProfile, source: motionSource, preview: motionSource ? '.artwork-full-view' : undefined });
  const close = useRef(requestClose);
  close.current = requestClose;
  useEffect(() => {
    const previous = returnFocus.current;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = nativeDialog.current;
    if (dialog) {
      dialog.showModal();
      return () => {
        dialog.close();
        document.body.style.overflow = scroll;
        if (previous?.isConnected) previous.focus({ preventScroll: true });
      };
    }
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
  const classes = `ocean-modal ${wide ? 'ocean-modal-wide' : ''} ${fullScreen ? 'ocean-modal-full' : ''} ${className}`;
  const content = <>
    {typeof header === 'function' ? header(requestClose) : header ?? <header><h2>{title}</h2><button type="button" className="ocean-icon-button" onClick={requestClose} aria-label="Đóng"><X /></button></header>}
    {typeof children === 'function' ? children(requestClose) : children}
  </>;
  if (topLayer) return <dialog ref={nativeDialog} aria-label={title} className={`${classes} ocean-modal-native`}
    onCancel={event=>{event.preventDefault();requestClose();}}
    onKeyDown={event=>{
      if (event.key==='Escape'&&!event.defaultPrevented) {event.preventDefault();requestClose();}
    }}
    onClick={event=>{
      if (event.target!==event.currentTarget) return;
      const {left,right,top,bottom}=event.currentTarget.getBoundingClientRect();
      if (event.clientX<left || event.clientX>right || event.clientY<top || event.clientY>bottom) requestClose();
    }}>
    {content}
  </dialog>;
  return <div className={`ocean-modal-backdrop ${fullScreen ? 'ocean-modal-backdrop-full' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) requestClose(); }}>
    <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className={classes}>{content}</div>
  </div>;
}

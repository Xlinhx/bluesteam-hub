import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useOverlayMotion } from '../../../shared/ui/motion/useOverlayMotion';

export function ResourceDialog({ title, subtitle, onClose, beforeClose, children, wide = false, drawer = false, className = '', busy = false }: { title: string; subtitle?:string; onClose: () => void; beforeClose?: () => boolean; children: ReactNode | ((close: () => void) => ReactNode); wide?: boolean; drawer?: boolean; className?:string; busy?:boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef(typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null);
  const animateClose = useOverlayMotion(ref, () => { if (!busy) onClose(); }, { drawer });
  const requestClose = () => {
    if (busy || animateClose.isClosing() || beforeClose?.() === false) return;
    animateClose();
  };
  useEffect(() => {
    const previous = returnFocus.current;
    const dialog = ref.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = oldOverflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className={`resource-dialog ${wide ? 'resource-dialog-wide' : ''} ${drawer ? 'resource-dialog-drawer' : ''} ${className}`} aria-label={title}
    onCancel={e => { e.preventDefault(); if(!busy)requestClose(); }} onClick={e => { if (!busy && e.target === ref.current) requestClose(); }}>
    <div className="resource-dialog-inner"><header><div><h2>{title}</h2>{subtitle && <p className="resource-dialog-subtitle">{subtitle}</p>}</div><button aria-label="Đóng" disabled={busy} onClick={requestClose}><X size={24}/></button></header>{typeof children === 'function' ? children(requestClose) : children}</div>
  </dialog>;
}

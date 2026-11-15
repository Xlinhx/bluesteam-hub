import type { ComponentProps, ReactNode } from 'react';
import { X } from 'lucide-react';
import { ModalFrame } from '../overlays/ModalFrame';
import './profile-dialog.css';

export function ProfileDialog({ icon, title, className = '', children, ...props }: Omit<
  ComponentProps<typeof ModalFrame>, 'header' | 'topLayer' | 'motionSource' | 'motionProfile'
> & { icon:ReactNode }) {
  return <ModalFrame {...props} title={title} topLayer className={`profile-dialog ${className}`}
    header={close=><header className="profile-dialog-heading">
      <span className="profile-dialog-emblem" aria-hidden="true">{icon}</span>
      <h2>{title}<i aria-hidden="true"/></h2>
      <button type="button" className="ocean-icon-button" onClick={close} aria-label="Đóng"><X aria-hidden="true"/></button>
    </header>}>
    {close=><div className="profile-dialog-body">{typeof children === 'function' ? children(close) : children}</div>}
  </ModalFrame>;
}

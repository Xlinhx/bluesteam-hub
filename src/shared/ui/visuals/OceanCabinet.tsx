import './ocean-cabinet.css';
import { memo } from 'react';

/** Visual layers have independent silhouettes and never compete with text. */
export const OceanCabinet = memo(function OceanCabinet({ variant }: { variant: 'discovery' | 'collection' | 'workspace' }) {
  return <div className={`ocean-cabinet ocean-cabinet-${variant}`} aria-hidden="true">
    <div className="ocean-cabinet-halo" />
    <svg className="ocean-cabinet-contours" viewBox="0 0 1000 400" preserveAspectRatio="none"><path pathLength="1" d="M-30 360C180 115 300 420 540 170S850 20 1050 80"/><path pathLength="1" d="M-30 388C180 143 300 448 540 198S850 48 1050 108"/><path pathLength="1" d="M-30 330C180 85 300 390 540 140S850-10 1050 50"/></svg>
    <img className="ocean-cabinet-reef" src={variant === 'collection' ? '/assets/generated/profile/collection-atelier-v3.webp' : '/assets/generated/resources/reef-cabinet-v3.webp'} alt="" decoding="async" />
    <svg className="ocean-cabinet-orbit" viewBox="0 0 240 240"><ellipse cx="120" cy="120" rx="100" ry="70"/><circle cx="212" cy="94" r="5"/><circle cx="45" cy="168" r="3"/></svg>
  </div>;
});

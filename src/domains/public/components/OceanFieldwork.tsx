import { useLayoutEffect, useRef } from 'react';
import './ocean-fieldwork.css';

/** Authored vector specimens, independent of the photographs and readable at every size. */
export function OceanFieldwork({ variant }: { variant: 'entry' | 'auth' | 'form' }) {
  return <div className={`ocean-fieldwork ocean-fieldwork--${variant}`} aria-hidden="true">
    <div className="fieldwork-wash" />
    <svg className="fieldwork-chart" viewBox="0 0 600 600" fill="none">
      <g className="fieldwork-orbits" stroke="currentColor" strokeWidth=".7">
        {[240, 200, 155, 105].map((radius, index) => <circle key={radius} cx="300" cy="300" r={radius} strokeDasharray={index % 2 ? '2 9' : undefined} />)}
        {Array.from({ length: 48 }, (_, index) => {
          const angle = index / 48 * Math.PI * 2;
          return <path key={index} d={`M${300 + Math.cos(angle) * 240} ${300 + Math.sin(angle) * 240}l${Math.cos(angle) * (index % 4 ? 7 : 17)} ${Math.sin(angle) * (index % 4 ? 7 : 17)}`} />;
        })}
      </g>
      <g className="fieldwork-current" stroke="currentColor" strokeWidth="1.1">
        {Array.from({ length: 7 }, (_, i) => <path key={i} pathLength="1" strokeDasharray="1" d={`M${45 + i * 12} 490C${410 - i * 12} ${510 - i * 28},${100 + i * 36} ${70 + i * 17},${540 - i * 9} 100`} />)}
      </g>
      <g className="fieldwork-coordinates" stroke="currentColor" strokeWidth=".8"><path d="M300 20V580M20 300H580" strokeDasharray="2 10" /><circle cx="300" cy="300" r="9" /><path d="M285 300h30m-15-15v30" /></g>
    </svg>
    <svg className="fieldwork-coral" viewBox="0 0 320 620" fill="none" stroke="currentColor" strokeLinecap="round">
      <g className="fieldwork-fronds">
        <path pathLength="1" strokeDasharray="1" d="M153 610C93 440 226 282 160 35" strokeWidth="2" />
        {Array.from({ length: 10 }, (_, i) => {
          const y = 90 + i * 44, x = 165 + Math.sin(i * .6) * 24;
          return <g key={i} strokeWidth={1.3 - i * .05}><path pathLength="1" strokeDasharray="1" d={`M${x} ${y + 45}C${x - 70} ${y + 15},${x - 95} ${y - 25},${x - 85} ${y - 65}M${x} ${y + 40}C${x + 85} ${y + 10},${x + 100} ${y - 25},${x + 75} ${y - 60}`} />
            <path pathLength="1" strokeDasharray="1" opacity=".5" d={`M${x - 45} ${y + 17}l-48 -13m27 -12-45 -22M${x + 50} ${y + 8}l50 -19m-25 -10 43 -20`} /></g>;
        })}
      </g>
    </svg>
    <div className="fieldwork-lens"><svg viewBox="0 0 200 200" fill="none" stroke="currentColor"><circle cx="100" cy="100" r="92" strokeWidth=".7" /><circle cx="100" cy="100" r="80" strokeDasharray="1 8" /><path pathLength="1" strokeDasharray="1" className="fieldwork-shell" d="M101 101c-10-17 17-28 28-9 19 35-36 63-63 29-46-58 46-117 97-66 81 81-40 189-125 112" /><path d="M100 0v20m0 160v20M0 100h20m160 0h20" /></svg></div>
  </div>;
}

/** Draw the card's actual relationship graph instead of a fixed desktop illustration. */
export function RoleConnections() {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    const svg = ref.current, card = svg?.parentElement;
    if (!svg || !card) return;
    const measure = () => {
      const badge = card.querySelector<HTMLElement>('.entry-persona');
      const features = [...card.querySelectorAll<HTMLElement>('.entry-feature')];
      const action = card.querySelector<HTMLElement>('.entry-role-action');
      if (!badge || !action) return;
      const position = (element: HTMLElement) => {
        let x = 0, y = 0, current: HTMLElement | null = element;
        while (current && current !== card) { x += current.offsetLeft; y += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
        return { x, y };
      };
      const badgePosition = position(badge);
      const bx = badgePosition.x + badge.offsetWidth / 2, by = badgePosition.y + badge.offsetHeight + 3;
      svg.setAttribute('viewBox', `0 0 ${card.clientWidth} ${card.clientHeight}`);
      features.forEach((feature, index) => {
        const point = position(feature);
        const x = point.x + feature.offsetWidth / 2, y = point.y - 6;
        svg.querySelector(`[data-branch="${index}"]`)?.setAttribute('d', `M${bx} ${by}C${bx} ${by + 12},${x} ${y - 18},${x} ${y}`);
      });
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(card);
    return () => observer.disconnect();
  }, []);
  return <svg ref={ref} className="entry-connections" fill="none" aria-hidden="true">
    {[0, 1, 2].map(index => <path key={index} data-branch={index} pathLength="1" strokeDasharray="1" />)}
  </svg>;
}

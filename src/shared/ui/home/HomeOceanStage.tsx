import type { CSSProperties } from 'react';
import type { HomeRole } from './homeChoreography';
import './home-ocean-stage.css';

/** Separate artwork planes let the water, eddies and specimens carry different rhythms. */
export function HomeOceanStage({ role }: { role: HomeRole }) {
  return <div className={`home-ocean-stage home-ocean-stage--${role}`} aria-hidden="true">
    <div className="home-water home-water--ribbon" />
    <div className="home-water home-water--cove" />
    <svg className="home-current-lines" viewBox="0 0 1600 900" preserveAspectRatio="none" fill="none">
      <path pathLength="1" d="M-120 190C280 55 590 450 1060 250S1510 100 1730 190" />
      <path pathLength="1" d="M-100 235C320 110 570 505 1080 298S1490 160 1710 230" />
      <path pathLength="1" d="M-130 680C240 470 530 930 1040 710S1480 490 1720 620" />
    </svg>
    <svg className="home-tide-contours" viewBox="0 0 400 400" fill="none">
      {[0, 1, 2, 3, 4].map(i => <path key={i} pathLength="1" d={`M${30+i*18} 390C${-90+i*22} 195 ${165+i*9} ${265-i*12} ${210+i*19} 100S${370+i*6} -80 440 -40`} />)}
    </svg>
    <svg className="home-fish-school" viewBox="0 0 230 90" fill="currentColor">
      <g className="home-fish"><path d="M15 25q22-22 47 0-25 22-47 0L0 13v24z"/></g>
      <g className="home-fish"><path d="M100 49q18-18 39 0-21 18-39 0L87 39v21z"/></g>
      <g className="home-fish"><path d="M173 17q15-15 33 0-18 15-33 0L162 9v16z"/></g>
    </svg>
    <div className="home-bubble-trail">{[0, 1, 2, 3, 4].map(i => <i key={i} style={{ '--bubble-index': i } as CSSProperties} />)}</div>
  </div>;
}

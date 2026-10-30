import { anchorVector, type MotionRect } from './homeMotionGeometry';
export type HomeRole = 'learner' | 'teacher';
interface HomeCue {
  selector: string;
  anchor: string;
  duration: number;
  delay?: number;
  sequence?: number;
  frames: (target: MotionRect, anchor: MotionRect, compact: boolean) => Keyframe[];
}
const water: HomeCue[] = [
  { selector: '.home-water--ribbon', anchor: '.home-ocean-stage', duration: 2400,
    frames: (_, __, compact) => [{ translate: compact ? '-24px 14px' : '-60px 25px', rotate: '-3deg', scale: '1.07', opacity: .25 }, { translate: '0px 0px', rotate: '0deg', scale: '1', opacity: .8 }] },
  { selector: '.home-water--cove', anchor: '.home-ocean-stage', duration: 2100, delay: 160,
    frames: () => [{ translate: '45px 30px', rotate: '4deg', opacity: .2 }, { translate: '0px 0px', rotate: '0deg', opacity: .65 }] },
  { selector: '.home-current-lines path', anchor: '.home-ocean-stage', duration: 1900, sequence: 140,
    frames: () => [{ strokeDasharray: '1', strokeDashoffset: '1', opacity: .2 }, { strokeDasharray: '1', strokeDashoffset: '0', opacity: 1 }] },
  { selector: '.home-nautilus-mark', anchor: '.home-ocean-stage', duration: 2000, delay: 300,
    frames: (_, __, compact) => [{ rotate: '-52deg', scale: '.78', opacity: 0 }, { rotate: '-18deg', scale: '1', opacity: compact ? .16 : .2 }] },
  { selector: '.home-tide-contours path', anchor: '.home-ocean-stage', duration: 1800, sequence: 85,
    frames: () => [{ strokeDasharray: '1', strokeDashoffset: '1' }, { strokeDasharray: '1', strokeDashoffset: '0' }] },
  { selector: '.home-fish', anchor: '.home-ocean-stage', duration: 2200, sequence: 190,
    frames: () => [{ translate: '38px 10px', rotate: '-5deg', opacity: 0 }, { translate: '0px 0px', rotate: '0deg', opacity: 1 }] },
  { selector: '.home-bubble-trail i', anchor: '.home-ocean-stage', duration: 2100, sequence: 140,
    frames: () => [{ translate: '0px 65px', scale: '.4', opacity: 0 }, { translate: '8px -6px', scale: '1.08', opacity: .8, offset: .8 }, { translate: '0px 0px', scale: '1', opacity: 1 }] },
];
const learner: HomeCue[] = [
  ...water,
  { selector: '.home-gallery-stage', anchor: '.home-feature-copy', duration: 1800,
    frames: (r, a, compact) => { const v = anchorVector(r, a, compact ? 18 : 42); return [{ translate: `${v.x}px ${v.y}px`, scale: '1.09', rotate: '1.5deg' }, { translate: '0px 0px', scale: '1', rotate: '0deg' }]; } },
  { selector: '.home-feature-copy h2', anchor: '.home-feature', duration: 1050, delay: 140,
    frames: () => [{ clipPath: 'inset(0 0 100% 0)', translate: '0px 16px' }, { clipPath: 'inset(0 0 0% 0)', translate: '0px 0px' }] },
  { selector: '.home-feature-copy p', anchor: '.home-feature', duration: 900, delay: 300,
    frames: () => [{ translate: '0px 10px', opacity: .45 }, { translate: '0px 0px', opacity: 1 }] },
  { selector: '.home-primary > svg', anchor: '.home-primary', duration: 850, delay: 470, sequence: 110,
    frames: () => [{ rotate: '-14deg', scale: '.8' }, { rotate: '3deg', scale: '1.04', offset: .7 }, { rotate: '0deg', scale: '1' }] },
  { selector: '.home-selector > img', anchor: '.home-feature', duration: 1250, delay: 250, sequence: 140,
    frames: (r, a, compact) => { const v = anchorVector(r, a, compact ? 10 : 22); return [{ translate: `${v.x}px ${v.y}px`, scale: '1.14', rotate: '-2deg' }, { translate: '0px 0px', scale: '1', rotate: '0deg' }]; } },
  { selector: '.home-selector-label', anchor: '.home-feature', duration: 840, delay: 620, sequence: 110,
    frames: () => [{ translate: '-15px 5px', opacity: .4 }, { translate: '0px 0px', opacity: 1 }] },
  { selector: '.home-selector-label > svg', anchor: '.home-feature', duration: 960, delay: 700, sequence: 120,
    frames: () => [{ rotate: '-18deg' }, { rotate: '5deg', offset: .65 }, { rotate: '0deg' }] },
  { selector: '.home-shortcut > img', anchor: '.home-selector-strip', duration: 1700, delay: 220,
    frames: () => [{ scale: '1.12', rotate: '-1deg' }, { scale: '1', rotate: '0deg' }] },
  { selector: '.home-shortcut-label', anchor: '.home-selector-strip', duration: 1000, delay: 760,
    frames: () => [{ translate: '28px 0px', opacity: .45 }, { translate: '0px 0px', opacity: 1 }] },
];
const teacher: HomeCue[] = [
  ...water,
  { selector: '.teacher-home-photo > img', anchor: '.teacher-home-copy', duration: 1850,
    frames: (r, a, compact) => { const v = anchorVector(r, a, compact ? 20 : 38); return [{ translate: `${v.x}px ${v.y}px`, scale: '1.11' }, { translate: '0px 0px', scale: '1' }]; } },
  { selector: '.teacher-home-copy h1', anchor: '.teacher-home-feature', duration: 1050, delay: 100,
    frames: () => [{ clipPath: 'inset(0 100% 0 0)', translate: '-12px 0px' }, { clipPath: 'inset(0 0% 0 0)', translate: '0px 0px' }] },
  { selector: '.teacher-home-copy p', anchor: '.teacher-home-feature', duration: 850, delay: 260,
    frames: () => [{ translate: '0px 10px', opacity: .45 }, { translate: '0px 0px', opacity: 1 }] },
  { selector: '.teacher-home-primary > svg', anchor: '.teacher-home-primary', duration: 780, delay: 420, sequence: 100,
    frames: () => [{ rotate: '-12deg', scale: '.8' }, { rotate: '0deg', scale: '1' }] },
  { selector: '.teacher-home-domains img', anchor: '.teacher-home-feature', duration: 1300, delay: 200, sequence: 130,
    frames: (r, a, compact) => { const v = anchorVector(r, a, compact ? 10 : 20); return [{ translate: `${v.x}px ${v.y}px`, scale: '1.15' }, { translate: '0px 0px', scale: '1' }]; } },
  { selector: '.teacher-domain-label', anchor: '.teacher-home-feature', duration: 820, delay: 540, sequence: 130,
    frames: () => [{ translate: '-20px 0px', opacity: .4 }, { translate: '0px 0px', opacity: 1 }] },
  { selector: '.teacher-domain-label > svg', anchor: '.teacher-home-feature', duration: 950, delay: 640, sequence: 130,
    frames: () => [{ rotate: '-20deg', scale: '.85' }, { rotate: '4deg', scale: '1', offset: .72 }, { rotate: '0deg', scale: '1' }] },
  { selector: '.home-shortcut > img', anchor: '.teacher-home-domains', duration: 1800, delay: 220,
    frames: () => [{ scale: '1.1', rotate: '-1deg' }, { scale: '1', rotate: '0deg' }] },
  { selector: '.home-shortcut-label', anchor: '.teacher-home-domains', duration: 950, delay: 750,
    frames: () => [{ translate: '30px 0px', opacity: .5 }, { translate: '0px 0px', opacity: 1 }] },
];
export function homeChoreography(role: HomeRole) { return role === 'learner' ? learner : teacher; }

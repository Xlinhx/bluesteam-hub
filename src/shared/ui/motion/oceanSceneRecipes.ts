export type OceanScene = 'library' | 'profile' | 'teacher' | 'detail';
export type OceanRole = 'surface' | 'portrait' | 'title' | 'image' | 'illustration' | 'tools' | 'row' | 'current';
type Geometry = { dx: number; dy: number; compact: boolean; opacity: string };

/** Context owns the choreography. Shared geometry only sets its anchor and cadence. */
export function oceanSceneCue(scene: OceanScene, role: OceanRole, geometry: Geometry): { frames: Keyframe[]; duration: number; delay: number; easing: string } {
  const { dx, dy, compact, opacity } = geometry;
  const teacher = scene === 'teacher';
  const delay = Math.min(teacher ? 150 : 300, Math.hypot(dx, dy) * (teacher ? .12 : .22));
  const travel = compact ? 12 : 24;
  const final = { opacity, transform: 'none' };
  let frames: Keyframe[], duration: number;
  if (role === 'tools') return { frames: [{ opacity: .65 }, { opacity }], duration: 240, delay: 0, easing: 'cubic-bezier(.2,0,0,1)' };
  if (role === 'current') return { frames: [{ strokeDasharray: '1', strokeDashoffset: '1', opacity: .1 }, { strokeDasharray: '1', strokeDashoffset: '0', opacity }], duration: teacher ? 1000 : 1500, delay, easing: 'ease-in-out' };
  if (role === 'illustration') {
    // Decorative artwork has time to unfurl; content photos remain quicker to read.
    const turn = scene === 'profile' ? 3 : -3;
    return { frames: [
      { opacity: Number(opacity) * .3, transform: `translateY(${compact ? 9 : 18}px) rotate(${turn}deg) scale(.975)`, transformOrigin: '75% 90%' },
      { opacity, transform: `translateY(-2px) rotate(${-turn * .18}deg)`, transformOrigin: '75% 90%', offset: .76 },
      { ...final, transformOrigin: '75% 90%' },
    ], duration: teacher ? (compact ? 600 : 680) : scene === 'profile' ? (compact ? 1250 : 1400) : (compact ? 1150 : 1250), delay: teacher ? 0 : 90, easing: 'cubic-bezier(.22,.7,.18,1)' };
  }
  if (teacher) {
    // A working desk: surfaces unfold behind stationary labels, fields and rows.
    switch (role) {
      case 'surface': frames = [{ opacity: .2, clipPath: 'inset(0 0 85% 0 round 18px)' }, { opacity, clipPath: 'inset(0 round 0)' }]; duration = 780; break;
      case 'portrait': frames = [{ opacity: .35, transform: 'rotate(-4deg) scale(.96)' }, final]; duration = 580; break;
      case 'title': frames = [{ opacity: .25, clipPath: 'inset(0 70% 0 0)' }, { opacity, clipPath: 'inset(0)' }]; duration = 580; break;
      default: frames = [{ opacity: .45, backgroundColor: '#dcece57a' }, { opacity, backgroundColor: 'transparent' }]; duration = 360;
    }
  } else if (scene === 'profile') {
    // A personal album: the cover opens first, sheets settle around the collection.
    switch (role) {
      case 'surface': frames = [{ opacity: .2, clipPath: compact ? 'inset(70% 0 0 0 round 36px)' : 'inset(0 0 0 85% round 48px)' }, { opacity, clipPath: 'inset(0 round 0)' }]; duration = 1100; break;
      case 'portrait': frames = [{ opacity: .3, transform: 'rotate(-9deg) scale(.94)', transformOrigin: '50% 85%' }, { opacity, transform: 'rotate(1deg)', offset: .78 }, final]; duration = 900; break;
      case 'image': frames = [{ opacity: .3, transform: `translateY(${travel}px) rotate(${dx < 0 ? -2 : 2}deg)`, transformOrigin: '50% 100%' }, final]; duration = 860; break;
      default: frames = [{ opacity: .3, transform: `translateY(${travel * .45}px)` }, final]; duration = 700;
    }
  } else if (scene === 'detail') {
    // An observation plate: the photograph comes into focus without moving controls.
    switch (role) {
      case 'image': frames = [{ opacity: .3, clipPath: 'inset(6% 3% 6% 3% round 24px)' }, { opacity, clipPath: 'inset(0 round 0)' }]; duration = 900; break;
      case 'surface': frames = [{ opacity: .15, transform: 'translateY(20px)' }, final]; duration = 1200; break;
      default: frames = [{ opacity: .4, transform: `translateX(${Math.sign(dx) * (compact ? 6 : 12)}px)` }, final]; duration = 620;
    }
  } else {
    // A tide opens each shelf from its group portrait toward the resources it owns.
    switch (role) {
      case 'surface': frames = [{ opacity: .15, clipPath: compact ? 'inset(82% 0 0 0 round 36px)' : 'inset(0 96% 0 0 round 48px)' }, { opacity, clipPath: 'inset(0 round 0)' }]; duration = 1200; break;
      case 'portrait': frames = [{ opacity: .3, transform: `translateY(${travel / 2}px) rotate(-7deg)`, transformOrigin: '50% 80%' }, { opacity, transform: 'rotate(1deg)', offset: .8 }, final]; duration = 900; break;
      case 'image': frames = [{ opacity: .3, transform: `perspective(900px) translate(${Math.max(-18, Math.min(18, -dx * .035))}px,${travel}px) rotateX(4deg)`, transformOrigin: '50% 100%' }, final]; duration = 840; break;
      default: frames = [{ opacity: .35, clipPath: 'inset(0 0 65% 0)', transform: 'translateY(10px)' }, { ...final, clipPath: 'inset(0)' }]; duration = 800;
    }
  }
  const easing = teacher ? 'cubic-bezier(.2,.65,.3,1)' : role === 'surface' ? 'cubic-bezier(.32,.72,0,1)' : scene === 'profile' && role === 'image' ? 'cubic-bezier(.22,.68,0,1.02)' : scene === 'library' && role === 'image' ? 'cubic-bezier(.19,1,.22,1)' : 'cubic-bezier(.22,1,.36,1)';
  const mobilePace = !teacher && role === 'surface' ? .95 : !teacher && role === 'image' ? .9 : .85;
  return { frames, duration: compact ? duration * mobilePace : duration, delay, easing };
}

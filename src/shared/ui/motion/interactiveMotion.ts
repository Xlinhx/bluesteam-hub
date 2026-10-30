/** Interactive motion: functional responses remain short; creature travel follows real geometry. */
export const interactiveMotion = {
  press: 110,
  teacherSelection: 420,
  learnerSelection: 720,
  report: 520,
  preview: 760,
  settle: 'cubic-bezier(.22,1,.36,1)',
  travel: 'cubic-bezier(.25,.65,.3,1)',
};

export function placementFrames(source: Pick<DOMRect, 'left'|'top'|'width'|'height'>, destination: Pick<DOMRect, 'left'|'top'|'width'|'height'>) {
  if (![source.width, source.height, destination.width, destination.height].every(n => Number.isFinite(n) && n > 0)) return null;
  // Individual scale uses the object's center; travel must use the same anchor.
  const x = source.left + source.width/2 - destination.left - destination.width/2;
  const y = source.top + source.height/2 - destination.top - destination.height/2;
  return {
    duration: Math.round(Math.min(520, Math.max(280, Math.hypot(x,y) * .45 + 240))),
    frames: [
      {translate:`${x}px ${y}px`,scale:`${source.width/destination.width} ${source.height/destination.height}`,opacity:.85},
      {translate:'0px 0px',scale:'1 1',opacity:1},
    ] as Keyframe[],
  };
}

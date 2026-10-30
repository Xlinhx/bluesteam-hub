/** One cached rectangle and at most one style write per pointer frame, with no React renders. */
export function installHomePointerDepth(root: HTMLElement) {
  const media = window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const layers = [...root.querySelectorAll<HTMLElement>('.home-water,.home-fish-school,.home-tide-contours')];
  let rect: DOMRect | undefined, frame = 0, x = 0, y = 0;
  const write = () => {
    frame = 0;
    for (const layer of layers) {
      layer.style.setProperty('--home-pointer-x', x.toFixed(3));
      layer.style.setProperty('--home-pointer-y', y.toFixed(3));
    }
  };
  const reset = () => { cancelAnimationFrame(frame); frame = 0; x = 0; y = 0; write(); rect = undefined; };
  const enter = () => { if (media.matches) rect = root.getBoundingClientRect(); };
  const move = (e: PointerEvent) => {
    if (!media.matches || e.pointerType !== 'mouse' || document.hidden || root.dataset.motionInput === 'keyboard') return;
    if (!rect) rect = root.getBoundingClientRect();
    x = Math.max(-1, Math.min(1, (e.clientX - rect.left) / rect.width * 2 - 1));
    y = Math.max(-1, Math.min(1, (e.clientY - rect.top) / rect.height * 2 - 1));
    if (!frame) frame = requestAnimationFrame(write);
  };
  root.addEventListener('pointerenter', enter);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', reset);
  root.addEventListener('keydown', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', reset);
  media.addEventListener('change', reset);
  return () => {
    reset();
    for (const layer of layers) { layer.style.removeProperty('--home-pointer-x'); layer.style.removeProperty('--home-pointer-y'); }
    root.removeEventListener('pointerenter', enter); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', reset); root.removeEventListener('keydown', reset);
    window.removeEventListener('resize', reset); document.removeEventListener('visibilitychange', reset); media.removeEventListener('change', reset);
  };
}

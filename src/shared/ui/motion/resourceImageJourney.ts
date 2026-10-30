export function resourceJourneyId(from: string, to: string) {
  const detail = from === '/resources' ? to : to === '/resources' ? from : '';
  const match = /^\/resources\/([^/]+)$/.exec(detail);
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

/** A resource's uploaded image bridges its catalog and observation plate. */
export function resourceImageJourney(from: string, to: string, doc: Document) {
  const id = resourceJourneyId(from, to);
  if (!id || !doc.querySelectorAll) return null;
  const named = new Map<HTMLElement, string>();
  let disposed = false;
  const pick = (path: string) => {
    if (path === '/resources') {
      const candidates = [...doc.querySelectorAll<HTMLElement>('.resource-library article[data-resource-id]')].filter(node => node.dataset.resourceId === id);
      const focused = doc.activeElement?.closest('article');
      return (candidates.find(node => node === focused) || candidates[0])?.querySelector<HTMLImageElement>('img');
    }
    const detail = doc.querySelector<HTMLElement>('.resource-detail-shell .resource-detail-page');
    return detail?.dataset.resourceId === id ? detail.querySelector<HTMLImageElement>('.observation-photo>img') : null;
  };
  const mark = (image: HTMLImageElement | null | undefined) => {
    if (!image?.complete || !image.naturalWidth || image.getBoundingClientRect().width <= 0) return false;
    image.getAnimations().forEach(animation => animation.cancel());
    const rect = image.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= (doc.defaultView?.innerHeight || 0)) return false;
    if (!named.has(image)) named.set(image, image.style.viewTransitionName);
    image.style.viewTransitionName = 'ocean-resource-image';
    return true;
  };
  if (!mark(pick(from))) return null;
  doc.documentElement.dataset.oceanResource = id;
  return {
    incoming: () => { if (!disposed) mark(pick(to)); },
    dispose: () => {
      disposed = true;
      named.forEach((previous, image) => { image.style.viewTransitionName = previous; });
      named.clear();
      if (doc.documentElement.dataset.oceanResource === id) delete doc.documentElement.dataset.oceanResource;
    },
  };
}

import { waitForHomeDestination } from './waitForHomeDestination';
import { startHomeMobileJourney } from './homeMobileJourney';

type Navigate = (url: string, options?: { preserveQuery?: boolean }) => void;
type NativeTransition = { finished: Promise<void>; ready: Promise<void>; updateCallbackDone: Promise<void>; skipTransition: () => void };
let journeyRevision = 0;
export function journeyRadius(x: number, y: number, width: number, height: number) {
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

/** One interruptible snapshot from the pressed Home control to ready destination content. */
export function installHomeJourney(root: HTMLElement, navigate: Navigate) {
  const doc = root.ownerDocument, win = doc.defaultView!;
  const shell = root.closest('.bluesteam-role-shell') || root;
  const media = win.matchMedia('(prefers-reduced-motion: reduce)');
  const native = doc as Document & { startViewTransition?: (update: () => Promise<void>) => NativeTransition };
  let bypass = false, disposed = false, version = 0;
  let active: NativeTransition | undefined, pressed: DOMRect | undefined;
  let release = () => {};
  const headers = new Map<HTMLElement, string>();
  const clear = () => {
    if (version !== journeyRevision) return;
    delete doc.documentElement.dataset.homeJourney;
    for (const name of ['--home-journey-x', '--home-journey-y', '--home-journey-radius']) doc.documentElement.style.removeProperty(name);
    for (const [header, previous] of headers) {
      if (header.style.viewTransitionName === 'home-header') header.style.viewTransitionName = previous;
    }
    headers.clear();
  };
  const stableHeader = () => {
    const header = doc.querySelector<HTMLElement>('.bluesteam-app-header');
    if (header && !headers.has(header)) { headers.set(header, header.style.viewTransitionName); header.style.viewTransitionName = 'home-header'; }
  };
  const skip = () => { active?.skipTransition(); release(); clear(); };
  const visibility = () => { if (doc.hidden) skip(); };
  const destinationInteraction = () => { if (active && !root.isConnected) skip(); };
  const press = (event: Event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    pressed = button && !button.disabled ? button.getBoundingClientRect() : undefined;
  };
  const keyboard = () => { pressed = undefined; };
  const removeListeners = () => {
    win.removeEventListener('bluesteam:before-navigate', go);
    win.removeEventListener('resize', skip); win.removeEventListener('popstate', skip);
    doc.removeEventListener('visibilitychange', visibility);
    doc.removeEventListener('pointerdown', destinationInteraction, true); doc.removeEventListener('keydown', destinationInteraction, true);
    shell.removeEventListener('pointerdown', press, true); shell.removeEventListener('keydown', keyboard, true);
    media.removeEventListener('change', skip);
  };
  const go = (event: Event) => {
    const e = event as CustomEvent<{ url?: string }>;
    if (bypass || e.defaultPrevented) return;
    if (active) skip();
    const mobile = win.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!root.isConnected || !e.detail?.url || media.matches || (!mobile && !native.startViewTransition)) return;
    if (doc.activeElement?.matches(':focus-visible')) {
      // Also bypass a destination-owned snapshot while the original router commits this key action.
      doc.documentElement.dataset.homeJourney = 'instant';
      queueMicrotask(() => { if (doc.documentElement.dataset.homeJourney === 'instant') delete doc.documentElement.dataset.homeJourney; });
      return;
    }
    const url = e.detail.url;
    if (url === `${win.location.pathname}${win.location.search}`) return;
    e.preventDefault();
    version = ++journeyRevision;
    const selected = doc.activeElement?.closest('button');
    const rect = pressed || (selected && shell.contains(selected) ? selected : root.querySelector('.home-primary'))?.getBoundingClientRect();
    pressed = undefined;
    const x = rect ? rect.left + rect.width / 2 : win.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : win.innerHeight / 2;
    const html = doc.documentElement;
    html.style.setProperty('--home-journey-x', `${x}px`); html.style.setProperty('--home-journey-y', `${y}px`);
    html.style.setProperty('--home-journey-radius', `${journeyRadius(x, y, win.innerWidth, win.innerHeight)}px`);
    html.dataset.homeJourney = 'opening'; if (!mobile) stableHeader();
    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true; bypass = true;
      try { navigate(url, { preserveQuery: false }); } finally { bypass = false; }
    };
    let transition: NativeTransition;
    try {
      const update = async () => {
        commit();
        const destination = waitForHomeDestination(root);
        release = destination.cancel;
        await destination.promise;
        if (!mobile && version === journeyRevision && html.dataset.homeJourney === 'opening') stableHeader();
      };
      transition = mobile ? startHomeMobileJourney(doc, update, x, y) : native.startViewTransition!(update);
    } catch { clear(); commit(); return; }
    active = transition;
    void transition.ready.catch(() => {});
    void transition.updateCallbackDone.catch(() => { commit(); release(); });
    void transition.finished.catch(() => {}).finally(() => {
      if (active !== transition) return;
      active = undefined; release(); clear();
      if (disposed) removeListeners();
    });
  };
  win.addEventListener('bluesteam:before-navigate', go);
  win.addEventListener('resize', skip); win.addEventListener('popstate', skip);
  doc.addEventListener('visibilitychange', visibility);
  doc.addEventListener('pointerdown', destinationInteraction, true); doc.addEventListener('keydown', destinationInteraction, true);
  shell.addEventListener('pointerdown', press, true); shell.addEventListener('keydown', keyboard, true);
  media.addEventListener('change', skip);
  return () => {
    disposed = true;
    // Home unmounts inside its own snapshot update. Keep cancellation alive until that snapshot ends.
    if (!active) removeListeners();
  };
}

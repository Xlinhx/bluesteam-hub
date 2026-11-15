/** A bounded readiness window keeps the incoming snapshot from being a loader. */
export function waitForOceanScene(path: string, doc: Document | undefined, signal: AbortSignal) {
  if (signal.aborted || !doc?.defaultView || !doc.querySelector) return Promise.resolve();
  const profile = path === '/profile' || path === '/teacher/profile';
  const selector = path === '/learning' ? '.learning-world,.learning-page'
    : path === '/profile' ? '.learner-profile .profile-form,.profile-personal-status [role=alert]'
    : path === '/teacher/profile' ? '.teacher-class-overview,.teacher-roster-layout,.class-settings,.teacher-profile [role=alert]'
    : path === '/teacher/resources' ? '.teacher-resource-table-wrap[aria-busy=false],.resource-form-error'
    : path === '/resources' ? '.resource-group-list,.resource-tile-grid[aria-label],.resource-error'
    : path.startsWith('/resources/') ? '.resource-detail-page' : '';
  if (!selector) return Promise.resolve();
  return new Promise<void>(resolve => {
    const win = doc.defaultView!;
    let finished = false, checking = false;
    const finish = () => { if (finished) return; finished = true; observer.disconnect(); win.clearTimeout(timer); signal.removeEventListener('abort', finish); resolve(); };
    const ready = () => {
      if (checking || !doc.querySelector(selector)) return;
      checking = true;
      const images = [...doc.querySelectorAll<HTMLImageElement>(path === '/learning' ? '.learning-world .learning-map-art' : profile
        ? '.profile-lagoon-bay,.profile-lagoon-sprig' : '.ocean-cabinet-reef,.observation-photo>img')].slice(0, 4);
      void Promise.all(images.map(image => image.decode?.().catch(() => {}))).then(finish);
    };
    const observer = new MutationObserver(ready);
    observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy', 'src'] });
    const timer = win.setTimeout(finish, profile || path === '/learning' ? 250 : 800);
    signal.addEventListener('abort', finish, { once: true });
    ready();
  });
}

/** A bounded readiness window keeps the incoming snapshot from being a loader. */
export function waitForOceanScene(path: string, doc: Document | undefined) {
  if (!doc?.defaultView || !doc.querySelector) return Promise.resolve();
  const selector = path === '/profile' ? '.profile-collection-section,.profile-read-error'
    : path === '/teacher/resources' ? '.teacher-resource-table-wrap[aria-busy=false],.resource-form-error'
    : path === '/resources' ? '.resource-group-list,.resource-tile-grid[aria-label],.resource-error'
    : path.startsWith('/resources/') ? '.resource-detail-page' : '';
  if (!selector) return Promise.resolve();
  return new Promise<void>(resolve => {
    const win = doc.defaultView!;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; observer.disconnect(); win.clearTimeout(timer); resolve(); };
    const ready = () => {
      if (!doc.querySelector(selector)) return;
      const images = [...doc.querySelectorAll<HTMLImageElement>('.ocean-cabinet-reef,.observation-photo>img,.profile-art img')].slice(0, 4);
      void Promise.all(images.map(image => image.decode?.().catch(() => {}))).then(finish);
    };
    const observer = new MutationObserver(ready);
    observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy', 'src'] });
    const timer = win.setTimeout(finish, 800);
    ready();
  });
}

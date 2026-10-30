/** One bounded, cancellable readiness window for Home's outgoing snapshot. */
export function waitForHomeDestination(root: HTMLElement) {
  const doc = root.ownerDocument, win = doc.defaultView!;
  let complete = false, decoding = false, resolve = () => {};
  const promise = new Promise<void>(done => { resolve = done; });
  const finish = () => {
    if (complete) return;
    complete = true; observer.disconnect(); win.clearTimeout(timer); resolve();
  };
  const ready = () => {
    if (complete || decoding || root.isConnected) return;
    const incoming = doc.querySelector<HTMLElement>('.bluesteam-role-shell main,.account-page,.bluesteam-activity-shell,[role="alert"]');
    if (!incoming || incoming.closest('[hidden]')) return;
    if (incoming.querySelector('.teacher-resource-table-wrap[aria-busy=true],.ocean-play-catalog__results[aria-busy=true],.curated-interactive [aria-busy=true]')) return;
    decoding = true;
    const images = [...incoming.querySelectorAll<HTMLImageElement>('img')].filter(image => {
      const rect = image.getBoundingClientRect();
      return rect.width && rect.height && rect.top < win.innerHeight && rect.bottom > 0;
    }).slice(0, 6);
    void Promise.all(images.map(image => image.decode?.().catch(() => {}))).then(finish);
  };
  const observer = new MutationObserver(ready);
  observer.observe(doc.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'aria-busy', 'src'] });
  const timer = win.setTimeout(finish, 1400);
  ready();
  return { promise, cancel: finish };
}

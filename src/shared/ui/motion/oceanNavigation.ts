import { waitForOceanScene } from './waitForOceanScene';
import { resourceImageJourney } from './resourceImageJourney';
import { waitForInteractiveScene } from './waitForInteractiveScene';
import {activityIdFromPath,nameInteractiveArtwork} from './interactiveArtworkJourney';
type Snapshot = { finished: Promise<unknown>; ready: Promise<unknown>; updateCallbackDone: Promise<unknown>; skipTransition: () => void };
type TransitionDocument = { documentElement: { dataset: DOMStringMap }; startViewTransition?: (update: () => void) => Snapshot; querySelector?: Document['querySelector']; activeElement?: Element | null; dispatchEvent?: Document['dispatchEvent']; addEventListener?: Document['addEventListener']; removeEventListener?: Document['removeEventListener'] };
let active: Snapshot | undefined;
let revision = 0;
let artworkCleanup: Array<()=>void>=[];

export function isOceanScene(path: string) {
  return path === '/profile' || path === '/teacher/resources' || /^\/resources(?:\/|$)/.test(path);
}
export function isInteractiveScene(path: string) {
  return /^\/(?:teacher\/)?interactive(?:\/|$)/.test(path);
}

/** Only these concepts own this transition; other domains retain their routing. */
export function transitionOceanScene(from: string, to: string, commit: () => void, reduced: boolean, doc: TransitionDocument | undefined, direction: 'forward' | 'back' = 'forward') {
  // Home's source-anchored transition already owns this snapshot, including session readiness.
  if (doc?.documentElement?.dataset.homeJourney === 'opening' || doc?.documentElement?.dataset.homeJourney === 'instant') { commit(); return; }
  const version = ++revision;
  active?.skipTransition(); active = undefined;
  artworkCleanup.forEach(clean=>clean());artworkCleanup=[];
  if (doc?.documentElement) { delete doc.documentElement.dataset.oceanTransition; delete doc.documentElement.dataset.interactiveJourney; delete doc.documentElement.dataset.publicJourney; delete doc.documentElement.dataset.publicRole; delete doc.documentElement.dataset.publicFields; }
  const publicPath = (path: string) => ['/', '/entry', '/login', '/register'].includes(path);
  const publicJourney = publicPath(from) && publicPath(to);
  const interactiveJourney = isInteractiveScene(from) && isInteractiveScene(to);
  if (from === to || (!interactiveJourney && !publicJourney && !isOceanScene(from) && !isOceanScene(to)) || reduced || !doc?.startViewTransition) { commit(); return; }
  let committed = false;
  const resourceBridge = resourceImageJourney(from, to, doc as Document);
  if (resourceBridge) artworkCleanup.push(resourceBridge.dispose);
  const artworkId=interactiveJourney?(activityIdFromPath(to)||activityIdFromPath(from)):null;
  if(artworkId)artworkCleanup.push(nameInteractiveArtwork(doc as Document,artworkId));
  const update = () => {
    if (version !== revision || committed) return;
    committed = true; commit();
    if (interactiveJourney) return waitForInteractiveScene(to,doc as Document).then(()=>{
      if(version===revision&&artworkId&&doc?.documentElement.dataset.interactiveJourney)artworkCleanup.push(nameInteractiveArtwork(doc as Document,artworkId));
    });
    if (isOceanScene(to)) return waitForOceanScene(to, doc as Document).then(() => { if (version === revision) resourceBridge?.incoming(); });
  };
  const dataset = doc.documentElement.dataset;
  const marker = interactiveJourney ? 'interactiveJourney' : publicJourney ? 'publicJourney' : 'oceanTransition';
  dataset[marker] = direction;
  if (publicJourney) {
    if (['/login', '/register'].includes(from) && ['/login', '/register'].includes(to)) dataset.publicFields = 'true';
    const selected = doc.activeElement?.closest<HTMLElement>('.entry-role-card');
    const account = doc.querySelector?.('.account-page') as HTMLElement | null | undefined;
    dataset.publicRole = selected?.dataset.role || account?.dataset.role || 'teacher';
    doc.querySelector?.('.entry-page,.account-page')?.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  }
  try {
    const snapshot = doc.startViewTransition(update); active = snapshot;
    if (publicJourney) {
      // A touch or field focus takes priority over the scenic snapshot immediately.
      const interrupt = () => snapshot.skipTransition();
      doc.addEventListener?.('pointerdown', interrupt, true);
      doc.addEventListener?.('focusin', interrupt);
      artworkCleanup.push(() => {
        doc.removeEventListener?.('pointerdown', interrupt, true);
        doc.removeEventListener?.('focusin', interrupt);
      });
    }
    void snapshot.ready.catch(() => {});
    void snapshot.updateCallbackDone.catch(() => update());
    void snapshot.finished.catch(() => {}).then(() => {
      if (version === revision) {
        artworkCleanup.forEach(clean=>clean());artworkCleanup=[];
        delete dataset[marker]; delete dataset.publicRole; delete dataset.publicFields; active = undefined;
        if (publicJourney) doc.dispatchEvent?.(new Event('bluesteam:public-arrived'));
      }
    });
  } catch { update();artworkCleanup.forEach(clean=>clean());artworkCleanup=[]; delete dataset[marker]; delete dataset.publicRole; delete dataset.publicFields; }
}

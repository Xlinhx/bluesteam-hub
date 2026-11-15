import { useEffect, useRef, type RefObject } from 'react';
import { createMotionScope } from './motionScope';
import { oceanSceneCue, type OceanScene as Scene, type OceanRole as Role } from './oceanSceneRecipes';

const casts: Record<Scene, [string, Role][]> = {
  library: [['.resources-banner-art,.resource-group-heading>.resource-surface','surface'],['.resource-group-portrait,.resource-group-heading-portrait','portrait'],['.resource-banner-content>h2,.resource-banner-content>p,.resource-group-name,.resource-section-heading>h2,.resource-group-heading>h2,.resource-tile-grid article h3','title'],['.resource-tile-grid>article img,.coloring-resource-tile img','image']],
  profile: [['.profile-identity>.profile-portrait','portrait'],['.profile-art-grid li:nth-child(n+4) .artwork-preview>img','image']],
  teacher: [['.teacher-resource-sidebar>.resource-surface','surface'],['.teacher-group-cover,.teacher-resource-groups>button>svg','portrait'],['.teacher-resource-sidebar>header>h1,.teacher-resource-title-copy>div','title'],['.teacher-resource-table tbody>tr','row']],
  detail: [['.resource-observation>.resource-seascape','surface'],['.observation-title>h1,.observation-fact-copy,.resource-media-title,.resource-media-fact-copy','title'],['.observation-photo>img,.resource-media-cover','image'],['.observation-fact-icon,.resource-media-fact-icon','portrait'],['.resource-detail-toolbar','tools']],
};

/** A scene has a cast: surfaces open, portraits turn, then content follows its anchor. */
export function useOceanChoreography(root: RefObject<HTMLElement | null>, scene: Scene, restore = false) {
  const seen = useRef(new WeakSet<Element>());
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const scope = createMotionScope();
    const registered = new WeakSet<Element>();
    const roles = new WeakMap<Element, Role>();
    const reveal = (element: Element) => {
      if (seen.current.has(element)) return;
      seen.current.add(element);
      // The incoming profile already moves as one scene during route navigation.
      if (scene === 'profile' && document.documentElement.dataset.oceanTransition) return;
      if (document.querySelector('dialog[open],.ocean-modal-backdrop')) return;
      if (restore || (scene === 'detail' && element.matches('.observation-photo>img') && document.documentElement.dataset.oceanResource)) return;
      const role = roles.get(element)!;
      const rect = element.getBoundingClientRect();
      const section = element.closest('.resource-discovery-banner,.resource-group-section,.profile-collection-section,.profile-personal-sheet,.teacher-resource-title') || host;
      const anchor = section.querySelector('.resource-banner-content,.resource-group-portrait,.profile-section-icon,.profile-portrait,.teacher-resource-title-copy')?.getBoundingClientRect() || section.getBoundingClientRect();
      const compact = innerWidth < 600 || (innerHeight < 600 && matchMedia('(pointer: coarse)').matches);
      const cue = oceanSceneCue(scene, role, { dx: rect.left + rect.width / 2 - anchor.left - anchor.width / 2, dy: rect.top - anchor.top, compact, opacity: getComputedStyle(element).opacity });
      scope.play(element, cue.frames, { duration: cue.duration, delay: cue.delay, fill: 'backwards', easing: cue.easing });
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { observer.unobserve(entry.target); reveal(entry.target); }
    }, { threshold: .12 });
    const discover = (subtree: Element) => {
      const layers: [string, Role][] = [['.ocean-cabinet-halo','surface'],['.ocean-cabinet-reef','illustration'],['.ocean-cabinet-contours path,.resource-surface-current','current']];
      const register = (element: Element, role: Role) => {
        if (registered.has(element) || seen.current.has(element)) return;
        registered.add(element); roles.set(element, role); observer.observe(element);
      };
      for (const [selector, role] of [...casts[scene], ...layers]) {
        if (subtree.matches(selector)) register(subtree, role);
        subtree.querySelectorAll(selector).forEach(element => register(element, role));
      }
    };
    // Typing or opening an overlay must not rescan every existing card and row.
    const mutation = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) if (node instanceof Element && !node.matches('dialog,[role=dialog]')) discover(node);
    });
    mutation.observe(host, { childList: true, subtree: true }); discover(host);
    const settle = () => scope.cancel();
    const interact = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      if (event.type === 'click' && event.target.closest('button[aria-haspopup="dialog"]')) {
        scope.cancel();
        return;
      }
      // Do not move a pointer's hit target between pointerdown and pointerup.
      if (event.type === 'focusin' && !event.target.matches(':focus-visible')) return;
      scope.cancel(event.target);
      const photo = event.target.closest('.observation-photo')?.querySelector('img');
      if (photo) scope.cancel(photo);
    };
    window.addEventListener('resize', settle);
    host.addEventListener('click', interact, true); host.addEventListener('focusin', interact, true);
    return () => { mutation.disconnect(); observer.disconnect(); scope.dispose(); window.removeEventListener('resize', settle); host.removeEventListener('click', interact, true); host.removeEventListener('focusin', interact, true); };
  }, [root, scene, restore]);
}

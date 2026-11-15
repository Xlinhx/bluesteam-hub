import { useEffect, type RefObject } from 'react';
import './profile-card-motion.css';

const cardSelector = '[data-profile-card]';
const revealAttribute = 'data-profile-card-reveal';
const revealWindow = 850;

/** Reveal each card's shape and artwork once when it reaches the reader. */
export function useProfileCardMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host || typeof IntersectionObserver === 'undefined') return;
    const scene = document.documentElement;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const waiting = new Set<Element>();
    const registered = new WeakSet<Element>();
    const seen = new WeakSet<Element>();
    const active = new Map<Element, number>();

    const settle = (card: Element) => {
      window.clearTimeout(active.get(card));
      active.delete(card);
      card.removeAttribute(revealAttribute);
    };
    const reveal = (card: Element) => {
      waiting.delete(card);
      observer.unobserve(card);
      if (seen.has(card)) return;
      seen.add(card);
      if (!host.contains(card) || preference.matches || document.querySelector('dialog[open]')) return;
      card.setAttribute(revealAttribute, '');
      active.set(card, window.setTimeout(() => settle(card), revealWindow));
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.intersectionRatio < .12) waiting.delete(entry.target);
        else if (scene.hasAttribute('data-ocean-profile-flow')) waiting.add(entry.target);
        else reveal(entry.target);
      }
    }, { threshold: .12 });
    const route = new MutationObserver(() => {
      if (!scene.hasAttribute('data-ocean-profile-flow')) waiting.forEach(reveal);
    });
    route.observe(scene, { attributes: true, attributeFilter: ['data-ocean-profile-flow'] });

    const observe = (card: Element) => {
      if (registered.has(card)) return;
      registered.add(card);
      observer.observe(card);
    };
    const discover = (element: Element) => {
      if (element.matches(cardSelector)) observe(element);
      element.querySelectorAll(cardSelector).forEach(observe);
    };
    const content = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) if (node instanceof Element) discover(node);
      }
    });
    content.observe(host, { childList: true, subtree: true });
    discover(host);

    const settleAll = () => active.forEach((_, card) => settle(card));
    const interact = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      if (event.type === 'focusin' && !event.target.matches(':focus-visible')) return;
      const card = event.target.closest(cardSelector);
      if (!card) return;
      seen.add(card);
      waiting.delete(card);
      observer.unobserve(card);
      settle(card);
    };
    host.addEventListener('pointerdown', interact, true);
    host.addEventListener('focusin', interact);
    window.addEventListener('resize', settleAll);
    preference.addEventListener('change', settleAll);
    return () => {
      content.disconnect();
      route.disconnect();
      observer.disconnect();
      settleAll();
      host.removeEventListener('pointerdown', interact, true);
      host.removeEventListener('focusin', interact);
      window.removeEventListener('resize', settleAll);
      preference.removeEventListener('change', settleAll);
    };
  }, [root]);
}

import { createMotionScope } from '../../../shared/ui/motion/motionScope';

type Scope = ReturnType<typeof createMotionScope>;

function animate(scope: Scope, target: Element | null, frames: Keyframe[], duration: number, delay = 0) {
  scope.play(target, frames, { duration, delay, easing: 'cubic-bezier(.42,0,.2,1)', fill: 'backwards' });
}

/** Labels and features approach their own photograph, using the rendered layout. */
function fromAnchor(scope: Scope, target: HTMLElement | null, anchor: Element | null, duration: number, delay: number) {
  if (!target || !anchor) return;
  const source = anchor.getBoundingClientRect(), destination = target.getBoundingClientRect();
  const dx = source.left + source.width / 2 - destination.left - destination.width / 2;
  const dy = source.top + source.height / 2 - destination.top - destination.height / 2;
  const length = Math.hypot(dx, dy) || 1;
  const distance = Math.min(28, length * .08);
  animate(scope, target, [
    { transform: `translate(${dx / length * distance}px,${dy / length * distance}px)`, opacity: .55 },
    { transform: 'none', opacity: 1 },
  ], duration, delay);
}

export function choreographEntry(root: HTMLElement, scope: Scope) {
  const compact = matchMedia('(max-width: 767px)').matches;
  choreographFieldwork(root, scope);
  animate(scope, root.querySelector('.entry-backdrop'), compact
    ? [{ transform: 'scale(1.06) translateY(10px)' }, { transform: 'none' }]
    : [{ transform: 'scale(1.09) translateY(16px)', filter: 'saturate(.6)' }, { transform: 'none', filter: 'saturate(1)' }], 4200);
  animate(scope, root.querySelector('.entry-wave'), [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 2200, 200);
  return choreographEntryCards(root, scope);
}

function choreographEntryCards(root: HTMLElement, scope: Scope, arrived = false) {
  const compact = matchMedia('(max-width: 767px)').matches;
  let stopped = false;
  const introduceCard = (card: HTMLElement) => {
    if (stopped) return;
    // Each role is a complete composition; both choices stay available immediately.
    const art = card.querySelector('.entry-role-art');
    const persona = card.querySelector<HTMLElement>('.entry-persona');
    animate(scope, art, [{ clipPath: 'inset(0 0 28% 0 round 48px)', opacity: .65 }, { clipPath: 'inset(0 round 16px)', opacity: 1 }], 2400, 200);
    animate(scope, art?.querySelector('img') || null, [{ transform: 'scale(1.13) rotate(-1.5deg)' }, { transform: 'none' }], 3200, 100);
    fromAnchor(scope, persona, art, 2100, 650);
    card.querySelectorAll<HTMLElement>('.entry-connections path').forEach((path, index) => animate(scope, path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 2000, 900 + index * 100));
    card.querySelectorAll<HTMLElement>('.entry-feature').forEach((feature, index) => fromAnchor(scope, feature, persona, 1850, 1100 + index * 130));
    animate(scope, card.querySelector('.entry-role-action span'), [{ transform: 'translateX(-10px)', opacity: .7 }, { transform: 'none', opacity: 1 }], 1600, 1600);
  };
  let observer: IntersectionObserver | undefined;
  const cards = root.querySelectorAll<HTMLElement>('.entry-role-card');
  if (compact && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < .4) return;
      observer?.unobserve(entry.target);
      introduceCard(entry.target as HTMLElement);
    }), { threshold: .4 });
    cards.forEach(card => {
      const bounds = card.getBoundingClientRect();
      const visible = Math.max(0, Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, 0));
      // Already delivered visible cards keep their final state; later cards still get an entrance.
      if (!arrived || visible / bounds.height < .4) observer!.observe(card);
    });
  } else if (!arrived) cards.forEach(introduceCard);
  return () => { stopped = true; observer?.disconnect(); };
}

export function choreographAuth(root: HTMLElement, scope: Scope, first: boolean) {
  if (!first) {
    // Role and mode changes reuse the scene rather than redrawing its specimens.
    animate(scope, root.querySelector('.account-eyebrow'), [{ opacity: .65 }, { opacity: 1 }], 600);
    animate(scope, root.querySelector('#account-title'), [{ opacity: .7 }, { opacity: 1 }], 750);
    animate(scope, root.querySelector('.account-description'), [{ opacity: .7 }, { opacity: 1 }], 800, 100);
    root.querySelectorAll('.account-field--extra').forEach(field => animate(scope, field, [{ opacity: .65 }, { opacity: 1 }], 750, 100));
    return;
  }
  choreographFieldwork(root, scope);
  const coast = root.querySelector<HTMLElement>('.account-coast');
  const coastVisible = !!coast?.getBoundingClientRect().width;
  if (coastVisible) {
    animate(scope, root.querySelector('.account-coast-image'), [{ transform: 'scale(1.1) translateY(16px)', opacity: .7 }, { transform: 'none', opacity: 1 }], 4200);
    if (first) {
      fromAnchor(scope, root.querySelector('.account-logo'), root.querySelector('.account-roles'), 2400, 200);
      fromAnchor(scope, root.querySelector('.account-coast-copy'), root.querySelector('.account-logo'), 2800, 650);
    }
  }
  animate(scope, root.querySelector('.account-roles'), [{ opacity: .65 }, { opacity: 1 }], first ? 1800 : 900);
  animate(scope, root.querySelector('.account-eyebrow'), [{ opacity: .45 }, { opacity: 1 }], 1600, first ? 400 : 0);
  animate(scope, root.querySelector('#account-title'), [{ opacity: .6, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 2100, first ? 650 : 100);
  animate(scope, root.querySelector('.account-description'), [{ opacity: .6 }, { opacity: 1 }], 1900, first ? 900 : 200);
  root.querySelectorAll<HTMLElement>('.account-field').forEach((field, index) => {
    const delay = first ? 1100 + index * 220 : 200;
    // Inputs stay at their layout position. The label introduces its own input surface.
    fromAnchor(scope, field.querySelector('label'), field.querySelector('.account-input-wrap'), 1700, delay);
    animate(scope, field.querySelector('.account-input-wrap'), [{ opacity: .65 }, { opacity: 1 }], 1800, delay + 160);
  });
  animate(scope, root.querySelector('.account-submit span'), [{ opacity: .6 }, { opacity: 1 }], 1600, first ? 1750 : 250);
  // Keep functional controls responsive; only their descriptive copy enters slowly.
  animate(scope, root.querySelector('.account-switch'), [{ opacity: .65 }, { opacity: 1 }], 1500, first ? 1900 : 250);
}

export function choreographPublicArrival(root: HTMLElement, scope: Scope) {
  // Snapshot decorations are already visible: continue from rest instead of redrawing them.
  root.querySelectorAll('.fieldwork-coral').forEach(coral => animate(scope, coral, [
    { transform: 'none' }, { transform: 'rotate(2deg)', offset: .55 }, { transform: 'none' },
  ], 12000));
  root.querySelectorAll('.fieldwork-wash').forEach(wash => animate(scope, wash, [
    { transform: 'none', opacity: .5 }, { transform: 'translateX(8%)', opacity: .65, offset: .5 }, { transform: 'none', opacity: .5 },
  ], 14000));
  return root.classList.contains('entry-page') ? choreographEntryCards(root, scope, true) : undefined;
}

function choreographFieldwork(root: HTMLElement, scope: Scope) {
  root.querySelectorAll<HTMLElement>('.fieldwork-current path').forEach((path, index) => animate(scope, path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 3400, 250 + index % 7 * 130));
  root.querySelectorAll<HTMLElement>('.fieldwork-fronds path').forEach((path, index) => animate(scope, path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 2800, 500 + index % 7 * 100));
  root.querySelectorAll<HTMLElement>('.fieldwork-shell').forEach(path => animate(scope, path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 3600, 400));
  root.querySelectorAll<HTMLElement>('.fieldwork-chart').forEach(chart => animate(scope, chart, [{ transform: 'rotate(-14deg) scale(.9)' }, { transform: 'none' }], 4400));
  root.querySelectorAll<HTMLElement>('.fieldwork-coral').forEach(coral => animate(scope, coral, [{ transform: 'rotate(-6deg)' }, { transform: 'rotate(2deg)', offset: .55 }, { transform: 'none' }], 12000));
  root.querySelectorAll<HTMLElement>('.fieldwork-wash').forEach(wash => animate(scope, wash, [{ transform: 'translateX(-18%)', opacity: .2 }, { transform: 'translateX(8%)', opacity: 1, offset: .5 }, { transform: 'none', opacity: .5 }], 14000));
}

import { useLayoutEffect, useRef } from 'react';
import { createMotionScope } from '../../../shared/ui/motion/motionScope';

const cues = {
  overview: [
    { selector: '.overview-heading h2', distance: 9, duration: 370, delay: 0 },
  ],
  students: [
    { selector: '.roster-heading h2, .roster-heading h3', distance: 8, duration: 380, delay: 0 },
    { selector: '.roster-table tbody > tr', distance: 12, duration: 460, delay: 48, cascade: 34 },
  ],
  settings: [
    { selector: '.class-settings-heading h2', distance: 7, duration: 380, delay: 0 },
  ],
};

export type TeacherProfileTab = keyof typeof cues;

export function useTeacherProfileTabMotion(tab: TeacherProfileTab) {
  const panel = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createMotionScope> | null>(null);
  const travel = useRef(0);

  useLayoutEffect(() => {
    const host = panel.current;
    if (!host) return;
    const motion = createMotionScope();
    scope.current = motion;
    const settle = () => motion.cancel();
    host.addEventListener('pointerdown', settle, true);
    host.addEventListener('focusin', settle);
    window.addEventListener('resize', settle);
    return () => {
      host.removeEventListener('pointerdown', settle, true);
      host.removeEventListener('focusin', settle);
      window.removeEventListener('resize', settle);
      motion.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    const direction = travel.current;
    travel.current = 0;
    const host = panel.current;
    if (!host || !direction) return;
    const viewport = window.innerHeight;
    const compact = window.innerWidth <= 600;
    for (const cue of cues[tab]) {
      host.querySelectorAll(cue.selector).forEach((object, index) => {
        const box = object.getBoundingClientRect();
        if (box.top >= viewport || box.bottom < 0) return;
        const x = direction * cue.distance * (compact ? .46 : 1);
        const y = compact ? 4 : 7;
        scope.current?.play(object, [
          { transform: `translate(${x}px, ${y}px)`, opacity: .76 },
          { transform: 'none', opacity: 1 },
        ], {
          duration: cue.duration,
          delay: cue.delay + Math.min(index, 3) * ('cascade' in cue ? cue.cascade ?? 0 : 0),
          easing: 'cubic-bezier(.28,.7,.24,1)',
          fill: 'backwards',
        });
      });
    }
  }, [tab]);

  return {
    panel,
    prepare(next: TeacherProfileTab, pointer: boolean) {
      scope.current?.cancel();
      const tabs = Object.keys(cues);
      travel.current = pointer ? Math.sign(tabs.indexOf(next) - tabs.indexOf(tab)) : 0;
    },
  };
}

import { Compass, Fish, Heart, House, Shell, Shield, Sparkles, Sprout, Star, Sun, Waves } from 'lucide-react';

/** Authored fact symbols shared by learner observation and teacher preview. */
export function ResourceFactIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const custom = iconKey === 'crab' || iconKey === 'claw';
  if (custom) return <svg data-fact-icon={iconKey} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {iconKey === 'claw' ? <>
      <path d="M10 21v-5l-5-5a5 5 0 0 1 0-7l3 5 4-1-1-6a6 6 0 0 1 6 8l-3 6v5" />
      <path d="m8 9 3 3 4-2M10 17h4" />
    </> : <>
      <ellipse cx="12" cy="14" rx="6" ry="4" />
      <path d="m9 10-1-2m7 2 1-2M6 12 3 9V6m15 6 3-3V6M3 6 1 4m2 2 2-2m16 2-2-2m2 2 2-2M6 14H2m4 2-4 2m5 0-3 3m14-7h4m-4 2 4 2m-5 0 3 3" />
    </>}
  </svg>;
  const icons: Record<string, typeof Waves> = { waves: Waves, wave: Waves, home: House, shield: Shield, sun: Sun, heart: Heart, smile: Heart, fish: Fish, shell: Shell, sprout: Sprout, star: Star, compass: Compass, footprints: Compass };
  const Icon = icons[iconKey] || Sparkles;
  return <Icon data-fact-icon={iconKey} className={className} strokeWidth={1.8} aria-hidden="true" />;
}

import { useEffect, useRef, type CSSProperties } from 'react';
import { ANIMAL_AVATAR_FRAMES } from '../../data/animalAvatarFraming';
import { getAnimalAvatar } from '../../data/categoryArtworkMap';
import { createMotionScope, motionTiming } from '../motion/motionScope';

type Artwork = Pick<ReturnType<typeof getAnimalAvatar>, 'key' | 'imageSrc' | 'shortName'>;

export function AnimalAvatar({
  avatarKey, artwork = getAnimalAvatar(avatarKey), alt = artwork.shortName, className = '',
}: { avatarKey?: string | null; artwork?: Artwork; alt?: string; className?: string }) {
  const frame = useRef<HTMLSpanElement>(null);
  const previous = useRef(artwork.imageSrc);
  useEffect(() => {
    if (previous.current === artwork.imageSrc) return;
    previous.current = artwork.imageSrc;
    const scope = createMotionScope();
    scope.play(frame.current, [{ opacity: .55, transform: 'rotate(-4deg)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: motionTiming.settle });
    return () => scope.dispose();
  }, [artwork.imageSrc]);

  const variant = artwork.imageSrc.includes('/teacher-3d/') ? 'teacher' : 'learner';
  const [x, y, width, height] = ANIMAL_AVATAR_FRAMES[variant][artwork.key] ?? [50, 50, 145, 145];
  const scale = 98 / Math.max(width, height);
  const style = {
    '--animal-frame-width': `${width * scale}%`,
    '--animal-frame-height': `${height * scale}%`,
    '--animal-image-size': `${100 * scale}%`,
    '--animal-image-x': `${50 + (50 - x) * scale}%`,
    '--animal-image-y': `${50 + (50 - y) * scale}%`,
  } as CSSProperties;

  return <span ref={frame} className={`animal-portrait ${className}`} style={style}>
    <img data-avatar={artwork.key} src={artwork.imageSrc} alt={alt} />
  </span>;
}

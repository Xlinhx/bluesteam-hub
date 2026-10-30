import { Check } from 'lucide-react';
import { ANIMAL_AVATARS, getAnimalAvatar } from '../../data/categoryArtworkMap';
import { useEffect, useRef } from 'react';
import { createMotionScope, motionTiming } from '../motion/motionScope';

export function AnimalAvatar({ avatarKey, className = '' }: { avatarKey?: string | null; className?: string }) {
  const avatar = getAnimalAvatar(avatarKey);
  const image = useRef<HTMLImageElement>(null);
  const previous = useRef(avatar.key);
  useEffect(() => {
    if (previous.current === avatar.key) return;
    previous.current = avatar.key;
    const scope = createMotionScope();
    scope.play(image.current, [{ opacity: .55, transform: 'rotate(-4deg)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: motionTiming.settle });
    return () => scope.dispose();
  }, [avatar.key]);
  return <img ref={image} data-avatar={avatar.key} src={avatar.imageSrc} alt={avatar.shortName} className={`animal-portrait ${className}`} />;
}

export function AnimalAvatarPicker({ value, onChange, avatars = ANIMAL_AVATARS, label = 'Chọn một bạn biển' }: { value: string; onChange: (key: string) => void; avatars?: typeof ANIMAL_AVATARS; label?: string }) {
  const root = useRef<HTMLDivElement>(null), previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    const scope = createMotionScope();
    scope.play(root.current?.querySelector('[aria-pressed=true] .animal-selected'), [{ transform: 'scale(.5)', opacity: .5 }, { transform: 'scale(1)', opacity: 1 }], { duration: 200, easing: motionTiming.settle });
    return () => scope.dispose();
  }, [value]);
  return <div ref={root} className="animal-picker" role="group" aria-label={label}>{avatars.map(a => <button type="button" key={a.key} className="animal-option" aria-label={a.shortName} aria-pressed={value === a.key} onClick={() => onChange(a.key)}>
    <span className="animal-option-portrait"><img data-avatar={a.key} src={a.imageSrc} alt={a.shortName} className="animal-portrait" />{value === a.key && <span className="animal-selected"><Check size={17} /></span>}</span><span>{a.shortName}</span>
  </button>)}</div>;
}

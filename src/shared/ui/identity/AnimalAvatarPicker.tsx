import { Check, ChevronLeft, ChevronRight, Fish, Waves, Droplets, Grid2X2 } from 'lucide-react';
import { ANIMAL_AVATARS, getAnimalAvatar, type AvatarGroup } from '../../data/categoryArtworkMap';
import { useEffect, useRef, useState } from 'react';
import { createMotionScope, motionTiming } from '../motion/motionScope';
import { AnimalAvatar } from './AnimalAvatar';

const PAGE_SIZE = 8;
const groups = [
  { key: 'all', label: 'Tất cả', icon: Grid2X2 },
  { key: 'sea', label: 'Dưới biển', icon: Fish },
  { key: 'shore', label: 'Ven biển', icon: Waves },
  { key: 'freshwater', label: 'Ao hồ', icon: Droplets },
] as const;

export function AnimalAvatarPicker({ value, onChange, avatars = ANIMAL_AVATARS, label = 'Chọn bạn đồng hành' }: { value: string; onChange: (key: string) => void; avatars?: typeof ANIMAL_AVATARS; label?: string }) {
  const selectedKey = value ? getAnimalAvatar(value).key : '';
  const root = useRef<HTMLDivElement>(null), previous = useRef(selectedKey);
  const [group, setGroup] = useState<AvatarGroup | 'all'>('all');
  const [page, setPage] = useState(() => Math.floor(Math.max(0, avatars.findIndex(a => a.key === selectedKey)) / PAGE_SIZE));
  const filtered = avatars.filter(a => group === 'all' || a.group === group);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  useEffect(() => {
    if (previous.current === selectedKey) return;
    previous.current = selectedKey;
    const scope = createMotionScope();
    scope.play(root.current?.querySelector('[aria-pressed=true] .animal-selected'), [{ transform: 'scale(.5)', opacity: .5 }, { transform: 'scale(1)', opacity: 1 }], { duration: 200, easing: motionTiming.settle });
    return () => scope.dispose();
  }, [selectedKey]);
  return <div ref={root} className="animal-picker-browser">
    <div className="animal-filters" role="group" aria-label="Nhóm con vật">
      {groups.map(({ key, label: groupLabel, icon: Icon }) => <button className="ui-filter-control" type="button" key={key} aria-pressed={group === key} onClick={() => { setGroup(key); setPage(0); }}><Icon size={19} aria-hidden="true" /><span>{groupLabel}</span></button>)}
    </div>
    <div className="animal-picker" role="group" aria-label={label}>{visible.map(a => <button type="button" key={a.key} className="animal-option" aria-label={a.shortName} aria-pressed={selectedKey === a.key} onClick={() => onChange(a.key)}>
      <AnimalAvatar artwork={a} alt="" className="animal-option-portrait" />
      <span className="animal-option-label">
        {a.shortName}
        {selectedKey === a.key && <span className="animal-selected" aria-hidden="true"><Check size={12} /></span>}
      </span>
    </button>)}</div>
    <div className="animal-pagination">
      <span role="status">{filtered.length} bạn · Trang {currentPage + 1}/{pageCount}</span>
      {pageCount > 1 && <div><button type="button" aria-label="Trang con vật trước" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft aria-hidden="true" /></button><button type="button" aria-label="Trang con vật tiếp theo" disabled={currentPage + 1 === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight aria-hidden="true" /></button></div>}
    </div>
  </div>;
}

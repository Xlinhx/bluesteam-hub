import { useState, type FormEvent, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import type { StudyContext } from '../../../shared/api/learnerOcean';
import { ProfileSelect, ProfileTextField } from '../../../shared/ui/profile/ProfileFields';

const fields = [
  { key: 'school', label: 'Trường', art: 'school', placeholder: 'Chưa có trường' },
  { key: 'schoolYear', label: 'Năm học', art: 'calendar', placeholder: 'Chưa có năm học' },
  { key: 'className', label: 'Lớp', art: 'classmates', placeholder: 'Chưa có lớp' },
] as const;

export const profileArt = '/assets/generated/profile/dive-log';

export function PersonalInformation({ name, current, contexts, pending, onSave, onSelect, avatar }: {
  name: string;
  current?: StudyContext;
  contexts: StudyContext[];
  onSelect: (context: StudyContext) => void;
  pending: boolean;
  onSave: (name: string) => Promise<void>;
  avatar: ReactNode;
}) {
  const [value, setValue] = useState(name);
  const school = contexts.filter(item => item.school === current?.school);
  const year = school.filter(item => item.schoolYear === current?.schoolYear);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSave(value);
  }

  return <div className="profile-personal-sheet">
    {avatar}
    <form className="profile-form" onSubmit={submit}>
      <div className="profile-field-grid">
        <ProfileTextField label="Họ tên" art="diver" name="name" autoComplete="name" required maxLength={100}
          value={value} placeholder="Tên của bé" disabled={pending} onChange={event => setValue(event.target.value)} />
        {fields.map(({ key, label, art, placeholder }) => {
          const source = key === 'school' ? contexts : key === 'schoolYear' ? school : year;
          const valueOf = (item: StudyContext) => key === 'className' ? item.id : item[key];
          const options = [...new Map(source.map(item => [valueOf(item), item])).values()].map(item => ({
            value: valueOf(item),
            label: item[key] + (key === 'className' && (item.archived || item.enrollmentStatus === 'ended') ? ' · Lịch sử' : ''),
          }));
          return <ProfileSelect key={key} className={`profile-field-${key}`} label={label} caption={label} art={art} placeholder={placeholder}
            disabled={pending} value={current ? valueOf(current) : ''} options={options} onChange={nextValue => {
              const next = source.find(item => valueOf(item) === nextValue);
              if (next) onSelect(next);
            }} />;
        })}
      </div>
      <div className="profile-form-actions">
        <button className="profile-primary" disabled={pending} type="submit">
          <Pencil size={17} aria-hidden="true" />{pending ? 'Đang lưu…' : 'Lưu họ tên'}
        </button>
      </div>
    </form>
  </div>;
}

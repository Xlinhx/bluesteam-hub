import { useState, type ComponentProps } from 'react';
import { OptionPopover } from '../catalog/OptionPopover';
import './profile-fields.css';

const artPath = '/assets/generated/profile/dive-log/';

function FieldArt({ art }: { art: string }) {
  return <span className="profile-control-art" aria-hidden="true"><img src={`${artPath}${art}.webp`} alt="" /></span>;
}

export function ProfileTextField({ label, art, ...input }: ComponentProps<'input'> & { label: string; art: string }) {
  return <label className="profile-art-field">
    <FieldArt art={art} />
    <span className="profile-text-field-copy"><span>{label}</span><input {...input} /></span>
  </label>;
}

type SelectProps = Omit<ComponentProps<typeof OptionPopover>, 'fitTrigger' | 'triggerLabel'> & {
  art?: string;
  caption?: string;
};

export function ProfileSelect({ art, caption, icon, className = '', ...select }: SelectProps) {
  return <OptionPopover {...select} fitTrigger triggerLabel={caption}
    className={`profile-select ${art ? 'profile-select-art' : 'profile-select-compact'} ${className}`}
    icon={art ? <FieldArt art={art} /> : icon} />;
}

export function ProfileFormSelect({ label, name, defaultValue, options, disabled }: {
  label: string; name: string; defaultValue?: string; options: SelectProps['options']; disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const selected = options.find(option => option.value === value)?.value ?? options[0]?.value ?? '';
  return <div className="profile-form-select">
    <span>{label}</span>
    <ProfileSelect label={label} value={selected} options={options} onChange={setValue} disabled={disabled} />
    <input type="hidden" name={name} value={selected} />
  </div>;
}

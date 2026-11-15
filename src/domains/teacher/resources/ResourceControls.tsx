import type { ReactNode } from 'react';
import { OptionPopover } from '../../../shared/ui/catalog/OptionPopover';
import { SearchField } from '../../../shared/ui/controls/SearchField';
import { ResourceKind, RESOURCE_KIND_LABELS } from './ResourceKind';
import { getResourceFormat, SOURCE_RESOURCE_FORMATS } from '../../../shared/ui/catalog/sourceResourceFormats';
import './resource-ocean-controls.css';

export const FORMAT_OPTIONS = SOURCE_RESOURCE_FORMATS.filter(([kind]) => kind !== 'download')
  .map(([kind]) => ({value:kind,label:RESOURCE_KIND_LABELS[kind]}));
export const VISIBILITY_OPTIONS = [{value:'published',label:'Đang hiện'},{value:'hidden',label:'Đã ẩn'}];

export function ResourceSearch({value,onChange,label,placeholder,autoFocus=false}:{value:string;onChange:(value:string)=>void;label:string;placeholder?:string;autoFocus?:boolean}) {
  return <SearchField className="resource-search ocean-search" label={label} placeholder={placeholder} value={value} onChange={onChange} autoFocus={autoFocus}/>;
}

export function ResourceSelect({value,onChange,label,options,format=false,disabled=false}:{value:string;onChange:(value:string)=>void;label:string;options:Array<{value:string;label:string;icon?:ReactNode}>;format?:boolean;disabled?:boolean}) {
  const hasKindIcon = (kind: string) => format && (kind === 'visual' || Boolean(getResourceFormat(kind)));
  return <OptionPopover label={label} value={value} onChange={onChange} disabled={disabled}
    icon={hasKindIcon(value) && options.some(option => option.value === value) ? <ResourceKind kind={value} iconOnly/> : undefined}
    options={options.map(option => ({...option, icon: option.icon || (hasKindIcon(option.value) ? <ResourceKind kind={option.value} iconOnly/> : undefined)}))}/>;
}

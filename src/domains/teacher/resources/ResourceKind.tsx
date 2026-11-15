import { Layers } from 'lucide-react';
import { getResourceFormat, SOURCE_RESOURCE_FORMATS } from '../../../shared/ui/catalog/sourceResourceFormats';

export const RESOURCE_KIND_LABELS: Record<string,string> = Object.fromEntries(
  SOURCE_RESOURCE_FORMATS.map(([kind,label]) => [kind, kind === 'flashcard' ? 'Thẻ hình' : kind === 'audio' ? 'Âm thanh' : label]),
);
export function ResourceKind({kind,iconOnly=false}: {kind:string;iconOnly?:boolean}) {
  const Icon=getResourceFormat(kind)?.[2] ?? Layers;
  return <span className="resource-kind"><Icon size={24} aria-hidden="true"/>{!iconOnly && (RESOURCE_KIND_LABELS[kind] || kind)}</span>;
}

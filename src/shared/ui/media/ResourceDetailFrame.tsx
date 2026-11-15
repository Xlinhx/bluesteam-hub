import { useState, type ReactNode, type Ref } from 'react';
import { BookOpen, ChevronDown, CirclePlay, Download, FileText, Image, Layers, Pencil, Volume2 } from 'lucide-react';
import type { ResourceVariantLink } from '../../api/catalog';
import './resource-detail.css';

export function ResourceDetailFrame({ sceneRef, title, titleAction, stage, notes, backdrop, listening, className }: {
  sceneRef?: Ref<HTMLDivElement>;
  title: string;
  titleAction?: ReactNode;
  stage: ReactNode;
  notes: ReactNode;
  backdrop?: ReactNode;
  listening?: boolean;
  className?: string;
}) {
  return <div ref={sceneRef} className={['resource-observation', className].filter(Boolean).join(' ')} data-listening={listening}>
    {backdrop}
    <div className="observation-title"><h1>{title}</h1>{titleAction}</div>
    {stage}
    <div className="observation-notes">{notes}</div>
  </div>;
}

const DETAIL_FORMATS = [
  ['flashcard','Flashcard',Layers], ['image','Ảnh',Image], ['video','Video',CirclePlay],
  ['audio','Audio',Volume2], ['coloring','Tô màu',Pencil], ['worksheet','Phiếu học tập',FileText],
  ['poster','Poster',BookOpen], ['species','Thẻ sinh vật',BookOpen], ['download','Tài liệu',Download],
] as const;

export function ResourceDetailFormats({ kind, id, variants, drawingTemplate, onOpen, onOpenDrawing }: {
  kind: string;
  id: string;
  variants?: ResourceVariantLink[];
  drawingTemplate?: string | null;
  onOpen?: (id: string, kind: string, drawingTemplate?: string | null) => void;
  onOpenDrawing?: (template: string) => void;
}) {
  const [choiceKind, setChoiceKind] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const linkedByKind = new Map<string, Map<string, ResourceVariantLink>>();
  for (const item of variants || []) {
    if (item.id === id) continue;
    const links = linkedByKind.get(item.kind) ?? new Map<string, ResourceVariantLink>();
    if (!links.has(item.id)) links.set(item.id, item);
    linkedByKind.set(item.kind, links);
  }
  const formats = DETAIL_FORMATS.flatMap(([key,label,Icon]) => {
    const links = [...linkedByKind.get(key)?.values() ?? []];
    const drawing = key === 'coloring' && key !== kind && drawingTemplate && onOpenDrawing ? drawingTemplate : null;
    return key === kind || links.length || drawing ? [{key,label,Icon,links,drawing}] : [];
  }).sort((a, b) => Number(b.key === kind) - Number(a.key === kind));
  if (!formats.length) return null;
  const hasOverflow = formats.length > 3;
  const additional = hasOverflow ? formats.slice(2) : [];
  const choices = formats.find(format => format.key === choiceKind)?.links || [];
  function open(item: ResourceVariantLink) {
    if (item.kind === 'coloring' && item.drawingTemplateKey && onOpenDrawing) onOpenDrawing(item.drawingTemplateKey);
    else onOpen?.(item.id,item.kind,item.drawingTemplateKey);
  }
  const renderFormat = ({key,label,Icon,links,drawing}: typeof formats[number]) => <button type="button" key={key} className="observation-format"
        aria-current={key === kind ? 'true' : undefined} aria-expanded={links.length > 1 ? choiceKind === key : undefined}
        aria-disabled={!links.length && !drawing ? true : undefined}
        onClick={() => {
          if (links.length > 1) { setChoiceKind(current => current === key ? null : key); return; }
          setChoiceKind(null);
          if (links[0]) open(links[0]);
          else if (drawing) onOpenDrawing?.(drawing);
        }}><Icon aria-hidden="true"/><span>{label}{links.length > 1 && <small className="observation-format-count">{links.length}</small>}</span></button>;
  return <div className="observation-format-section">
    <div className="observation-formats" role="group" aria-label="Định dạng học liệu">
      {(hasOverflow ? formats.slice(0, 2) : formats).map(renderFormat)}
      {hasOverflow && <button type="button" className="observation-format observation-format-more" aria-expanded={expanded}
        onClick={() => {
          if (expanded && additional.some(format => format.key === choiceKind)) setChoiceKind(null);
          setExpanded(current => !current);
        }}><ChevronDown aria-hidden="true"/><span>{expanded ? 'Thu gọn' : `Xem thêm (${additional.length})`}</span></button>}
      {expanded && additional.map(renderFormat)}
    </div>
    {choices.length > 1 && <section className="observation-media-choices" aria-label="Chọn học liệu liên kết" tabIndex={0}>
      {choices.map(item => <button type="button" key={item.id} onClick={() => open(item)}>
        {item.coverUrl && <img src={item.coverUrl} alt="" loading="lazy"/>}<span>{item.title}</span>
      </button>)}
    </section>}
  </div>;
}

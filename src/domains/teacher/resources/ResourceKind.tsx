import { BookOpen, FileImage, Image, Pencil, PlayCircle, Volume2 } from 'lucide-react';

export const RESOURCE_KIND_LABELS: Record<string,string> = {flashcard:'Thẻ hình',image:'Thẻ hình',video:'Video',audio:'Âm thanh',coloring:'Tranh tô màu',poster:'Poster',worksheet:'Bản in'};
export function ResourceKind({kind,iconOnly=false}: {kind:string;iconOnly?:boolean}) {
  const Icon=({flashcard:BookOpen,image:BookOpen,video:PlayCircle,audio:Volume2,coloring:Pencil,poster:Image,worksheet:FileImage})[kind] || BookOpen;
  return <span className="resource-kind"><Icon size={24} aria-hidden="true"/>{!iconOnly && (RESOURCE_KIND_LABELS[kind] || kind)}</span>;
}

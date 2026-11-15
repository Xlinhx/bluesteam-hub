import { BookOpen, Download, FileText, Image, Layers, Palette, Play, Volume2 } from 'lucide-react';

export const SOURCE_RESOURCE_FORMATS = [
  ['flashcard', 'Flashcards', Layers], ['image', 'Hình ảnh', Image], ['audio', 'Audio', Volume2], ['video', 'Video', Play],
  ['coloring', 'Tranh tô màu', Palette], ['worksheet', 'Phiếu học tập', FileText],
  ['poster', 'Poster', BookOpen], ['download', 'Kho học liệu tải về', Download],
] as const;

export const SOURCE_COLLECTION_TITLE = 'Tảo, cỏ biển và chuỗi thức ăn';
export const getResourceFormat = (kind: string | undefined) =>
  SOURCE_RESOURCE_FORMATS.find(([key]) => key === kind);

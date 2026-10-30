import type { CreativeArtwork } from './creativeStorage';
export function artworkDownloadName(title: string, source: string): string {
  const format = /^data:image\/([a-z+]+)/i.exec(source)?.[1] || /\.(png|jpe?g|webp)(?:[?#]|$)/i.exec(source)?.[1] || 'png';
  return `${title.replace(/[<>:"/\\|?*]/g, '-')}\.${format.toLowerCase() === 'jpeg' ? 'jpg' : format.toLowerCase()}`;
}
export function canResumeArtwork(art: CreativeArtwork): boolean {
  return art.type === 'scan'?Boolean(art.scanData?.originalDataUrl):art.type === 'drawing' ? Boolean(art.drawingData?.canvasDataUrl) : Array.isArray(art.habitatData?.items);
}
export function artworkEditorPath(art: CreativeArtwork): string {
  return art.type === 'scan'?'/creative/scan':art.type === 'drawing' ? '/creative/drawing' : '/creative/habitat';
}

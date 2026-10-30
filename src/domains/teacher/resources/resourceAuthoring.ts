import type {ResourceDto} from '../../../shared/api/catalog';

export interface AuthoringMedia {id?:string;url:string;name?:string;byteSize?:number;mimeType?:string}
const imageTypes=['image/png','image/jpeg','image/webp'];
export const MAX_ALBUM_IMAGES=8;
export const isVisual=(kind:string)=>kind==='flashcard'||kind==='image';
export function coverFromResource(item?:ResourceDto):AuthoringMedia|null{
 if(!item?.coverMediaId || !item.coverUrl)return null;
 if(isVisual(item.kind) && item.coverMediaId===item.mediaId && !item.content.coverOverride)return null;
 return {id:item.coverMediaId,url:item.coverUrl,mimeType:'image/jpeg'};
}
export function mediaRule(kind:string){
 if(kind==='video')return {label:'Video',types:['video/mp4'],accept:'video/mp4',maxMB:200,hint:'MP4 · tối đa 200 MB'};
 if(kind==='audio')return {label:'Âm thanh',types:['audio/mpeg'],accept:'audio/mpeg',maxMB:20,hint:'MP3 · tối đa 20 MB'};
 if(isVisual(kind)||kind==='cover')return {label:kind==='cover'?'Ảnh bìa riêng':'Ảnh thẻ',types:imageTypes,accept:imageTypes.join(','),maxMB:10,hint:'JPG, PNG, WebP · tối đa 10 MB mỗi ảnh'};
 return {label:kind==='coloring'?'Bản in tô màu':'File poster',types:[...imageTypes,'application/pdf'],accept:[...imageTypes,'application/pdf'].join(','),maxMB:30,hint:'PDF tối đa 30 MB · JPG, PNG, WebP tối đa 10 MB'};
}
export function validateUpload(file:{type:string;size:number},kind:string){
 const rule=mediaRule(kind);
 if(!rule.types.includes(file.type))return `Chọn đúng định dạng: ${rule.hint}.`;
 const max=imageTypes.includes(file.type)?10:rule.maxMB;
 if(!file.size)return 'File đang trống. Hãy chọn file có nội dung.';
 if(file.size>max*1024*1024)return `File vượt quá ${max} MB. Hãy chọn file nhỏ hơn.`;
 return '';
}
export function compatibleMedia(media:Pick<AuthoringMedia,'mimeType'>,kind:string){return Boolean(media.mimeType && mediaRule(kind).types.includes(media.mimeType));}
export function mediaFromResource(item?:ResourceDto):AuthoringMedia|null{
 if(!item?.mediaId||!item.mediaUrl)return null;
 const stored=item.content.mediaDetails;
 return {id:item.mediaId,url:item.mediaUrl,...stored,mimeType:item.mediaMimeType||stored?.mimeType||undefined};
}
export function readAlbum(item?:ResourceDto):AuthoringMedia[]{
 if(!item)return [];
 const legacy=(item.content as ResourceDto['content']&{albumImages?:string[]}).albumImages;
 const urls=item.content.albumUrls?.length?item.content.albumUrls:legacy?.length?legacy:[];
 if(urls.length)return urls.map(url=>item.content.albumAssets?.find(asset=>asset.url===url)||{url,...(url===item.mediaUrl?mediaFromResource(item):{})});
 const media=mediaFromResource(item);return media?[media]:item.coverUrl?[{id:item.coverMediaId||undefined,url:item.coverUrl,mimeType:'image/jpeg'}]:[];
}
export function validateResourceDraft(value:{title:string;kind:string;visibility:string;hasMedia:boolean;hasImage:boolean;hasTemplate:boolean}):{field:'title'|'media';message:string}|null{
 if(!value.title.trim())return {field:'title',message:'Nhập tên để cô dễ tìm lại học liệu.'};
 if(value.visibility!=='published')return null;
 const hasContent=isVisual(value.kind)?value.hasImage:value.kind==='coloring'?value.hasMedia||value.hasTemplate:value.hasMedia;
 if(!hasContent)return {field:'media',message:isVisual(value.kind)?'Thêm ít nhất một ảnh trước khi hiển thị cho bé.':value.kind==='coloring'?'Thêm bản in hoặc chọn mẫu tô tương tác trước khi hiển thị cho bé.':`Thêm ${value.kind==='video'?'video':value.kind==='audio'?'âm thanh':'file poster'} trước khi hiển thị cho bé.`};
 return null;
}
export function fileDescription(media:AuthoringMedia){
 const size=media.byteSize?(media.byteSize<1024*1024?`${Math.max(1,Math.round(media.byteSize/1024))} KB`:`${(media.byteSize/1024/1024).toLocaleString('vi',{maximumFractionDigits:1})} MB`):null;
 return [media.name||'File đã lưu',size].filter(Boolean).join(' · ');
}

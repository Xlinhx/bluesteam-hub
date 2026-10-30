import {ArrowLeft,ArrowRight,Upload,X} from 'lucide-react';
import {fileDescription,mediaRule,type AuthoringMedia} from './resourceAuthoring';

export function ResourceAssetField({kind,assets,album=false,busy,uploading=false,onFiles,onRemove,onMove,error}:{kind:string;assets:AuthoringMedia[];album?:boolean;busy:boolean;uploading?:boolean;onFiles:(files:File[])=>void;onRemove:(index:number)=>void;onMove?:(index:number,direction:number)=>void;error?:string}){
 const rule=mediaRule(kind);
 return <section className="resource-asset-field" data-editor-field={kind==='cover'?'cover':'media'} tabIndex={-1} aria-label={rule.label}>
  <div className="resource-asset-heading"><h3>{rule.label}</h3>{album&&<span>{assets.length} / 8 ảnh</span>}</div>
  <p className="resource-field-hint">{rule.hint}{album?' · Ảnh đầu tiên được mở trước.':''}</p>
  <div className={album?'resource-album-editor':'resource-file-editor'}>{assets.map((asset,index)=>{
   const image=kind==='cover'||album||asset.mimeType?.startsWith('image/');
   return <div className="resource-file-item" key={`${asset.id||asset.url}-${index}`}>
    {image?<img src={asset.url} alt={`${rule.label} ${index+1}`} loading="lazy"/>:kind==='video'?<video controls preload="metadata" src={asset.url} aria-label="Xem thử video"/>:kind==='audio'?<audio controls preload="metadata" src={asset.url} aria-label="Nghe thử âm thanh"/>:<a href={asset.url} target="_blank" rel="noreferrer">Mở bản in PDF</a>}
    <p title={asset.name}>{fileDescription(asset)}</p>
    <div className="resource-file-actions">{album&&<><button type="button" aria-label={`Đưa ảnh ${index+1} lên trước`} disabled={busy||index===0} onClick={()=>onMove?.(index,-1)}><ArrowLeft size={18}/></button><button type="button" aria-label={`Đưa ảnh ${index+1} ra sau`} disabled={busy||index===assets.length-1} onClick={()=>onMove?.(index,1)}><ArrowRight size={18}/></button></>}<button type="button" disabled={busy} aria-label={`Bỏ ${rule.label.toLocaleLowerCase('vi')} ${index+1}`} onClick={()=>onRemove(index)}><X size={18}/>Bỏ</button></div>
   </div>;
  })}</div>
  <label className="resource-upload"><Upload size={20}/>{uploading?'Đang tải…':album?(assets.length?'Thêm ảnh':'Tải ảnh thẻ'):assets.length?'Thay file':kind==='cover'?'Chọn ảnh bìa':`Tải ${rule.label.toLocaleLowerCase('vi')}`}<input type="file" aria-label={kind==='cover'?'Chọn ảnh bìa':`Tải ${rule.label.toLocaleLowerCase('vi')}`} accept={rule.accept} multiple={album} disabled={busy||(album&&assets.length>=8)} onChange={event=>{const files=Array.from(event.target.files||[]);event.target.value='';onFiles(files);}}/></label>
  {error&&<p role="alert" className="resource-form-error">{error}</p>}
 </section>;
}

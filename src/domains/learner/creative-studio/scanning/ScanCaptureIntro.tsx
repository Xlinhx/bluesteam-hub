import {Camera,Upload,Sun,Smartphone,FileImage} from 'lucide-react';

/** Capture guidance stays visible while the learner chooses or retakes a photo. */
export function ScanCaptureIntro({disabled,onLoad,compact=false}:{disabled:boolean;onLoad:(file?:File)=>void;compact?:boolean}){
 const actions=<div className="scan-file-actions">
  <label className="creative-btn primary" aria-disabled={disabled}><Camera size={21}/>Chụp tranh<input aria-label="Chụp tranh" disabled={disabled} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e=>{onLoad(e.target.files?.[0]);e.target.value='';}}/></label>
  <label className="creative-btn" aria-disabled={disabled}><Upload size={21}/>Chọn ảnh<input aria-label="Chọn ảnh" disabled={disabled} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{onLoad(e.target.files?.[0]);e.target.value='';}}/></label>
 </div>;
 if(compact)return <div className="scan-retake-actions"><strong>Chọn vùng tranh bên dưới để tiếp tục</strong>{actions}</div>;
 return <div className="scan-capture-intro">
  <figure className="scan-capture-example">
   <img src="/assets/generated/creative/learner-v3/scan-capture-fish-v1.webp" alt="Ví dụ: tranh cá cam đặt phẳng trên bàn, chụp từ phía trên"/>
   <span className="scan-viewfinder" aria-hidden="true"><i/><i/><i/><i/></span>
   <figcaption>Chỉ một bạn nhỏ trong mỗi lần quét nhé!</figcaption>
  </figure>
  <div className="scan-capture-guidance">
   <span className="scan-camera-badge"><Camera size={32}/></span>
   <h2>Chụp tranh của bé</h2>
   <p>Một con vật trên giấy, cả đại dương chờ đón!</p>
   <ol className="scan-photo-tips">
    <li><b>1</b><FileImage size={22}/><span>Đặt tranh trên mặt phẳng</span></li>
    <li><b>2</b><Sun size={23}/><span>Chọn nơi đủ ánh sáng</span></li>
    <li><b>3</b><Smartphone size={22}/><span>Giữ máy ngay phía trên tranh</span></li>
   </ol>
   {actions}
   <small>JPG, PNG, WebP · tối đa 10 MB / 16 megapixel</small>
  </div>
 </div>;
}

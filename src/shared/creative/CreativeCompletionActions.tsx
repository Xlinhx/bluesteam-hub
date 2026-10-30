import {Save,CircleCheck,LoaderCircle,ArrowRight,Plus} from 'lucide-react';
export function CreativeCompletionActions({saving,completed,disabled=false,hideSave=false,onSave,onComplete}:{saving:boolean;completed:boolean;disabled?:boolean;hideSave?:boolean;onSave:()=>Promise<unknown>;onComplete:()=>Promise<unknown>}){
 if(completed)return <span className="creative-finished"><CircleCheck size={18}/>Đã lưu vào Hồ sơ <a href="/profile">Xem tác phẩm <ArrowRight size={16}/></a><a href="/creative"><Plus size={16}/>Tạo tác phẩm mới</a></span>;
 return <>{!hideSave&&<button className="creative-btn" aria-label="Lưu tiến trình" disabled={disabled||saving} onClick={()=>void onSave()}>{saving?<LoaderCircle size={18}/>:<Save size={18}/>}<span>Lưu tiến trình</span></button>}<button className="creative-btn creative-complete-button" disabled={disabled||saving} onClick={()=>void onComplete()}><CircleCheck size={18}/><span>Hoàn thành</span></button></>;
}

import {CREATIVE_SEA_ENVIRONMENTS} from '@bluesteam/contracts';
export type ScanMotion='swim'|'float'|'floor';
export interface ScanDocument{schemaVersion:1|2;origin?:'paper'|{kind:'coloring';artworkId:string;editVersion:number;contentRef?:import('@bluesteam/contracts').CreativeSourceReference};reviewConfirmed?:boolean;stage?:'capture'|'review'|'environment';originalDataUrl:string;cutoutDataUrl:string;motion:ScanMotion;environmentId:string;crop:{x:number;y:number;width:number;height:number}}
export const SCAN_ENVIRONMENTS=CREATIVE_SEA_ENVIRONMENTS;

export function scanCompletionIssue(document:ScanDocument):string|null{
 if(!document.cutoutDataUrl)return 'Tách nền trước khi hoàn thành nhé.';
 if(!document.reviewConfirmed)return 'Xác nhận đã xem lại nét vẽ và phần trắng trong con vật.';
 if(!SCAN_ENVIRONMENTS.some(e=>e.id===document.environmentId))return 'Chọn một môi trường đang có trong danh sách.';
 if(!['swim','float','floor'].includes(document.motion))return 'Chọn chuyển động cho bạn nhỏ.';
 return null;
}

/** Old environment drafts open in the combined review/release step. */
export function scanWorkspaceStep(document:ScanDocument):1|2{
 return document.stage==='capture'||!document.cutoutDataUrl?1:2;
}

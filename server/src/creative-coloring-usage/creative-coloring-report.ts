import {z} from 'zod';
import {AppError} from '../common/errors.js';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v);
export function coloringFilters(q:any){
 const today=new Date(Date.now()+7*3600000).toISOString().slice(0,10),start=new Date(Date.parse(today)-6*86400000).toISOString().slice(0,10);
 const parsed=z.object({from:date.default(start),to:date.default(today),input:z.enum(['all','touch','pen','mouse','mixed','unknown']).default('all'),q:z.string().max(120).default(''),contentId:z.string().max(160).optional(),version:z.coerce.number().int().min(0).optional(),cursor:z.coerce.number().int().min(0).max(1000000).default(0),timezone:z.literal('Asia/Ho_Chi_Minh').default('Asia/Ho_Chi_Minh')}).safeParse(q);
 if(!parsed.success||parsed.data.from>parsed.data.to)throw new AppError('FILTER','Bộ lọc thời gian không hợp lệ.');return parsed.data;
}
export function csvCell(v:unknown){const s=String(v??'');return '"'+(/^[=+\-@\t\r]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}

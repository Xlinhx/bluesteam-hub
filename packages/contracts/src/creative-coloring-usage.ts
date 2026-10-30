import {z} from 'zod';
import {CreativeSourceReferenceSchema} from './creative-challenge.js';
export const ColoringOpenSchema=z.object({openKey:z.string().uuid(),contentRef:CreativeSourceReferenceSchema});
export const ColoringEventSchema=z.object({clientEventId:z.string().uuid(),type:z.enum(['tool_used','manual_save','complete','undo']),tool:z.enum(['brush','bucket','eraser','stamp']).optional(),input:z.enum(['touch','pen','mouse','unknown']).optional()}).strict().refine(v=>v.type!=='tool_used'||!!v.tool&&!!v.input,'Công cụ và cách nhập bắt buộc');
export type ColoringEvent=z.infer<typeof ColoringEventSchema>;
export interface ColoringMetrics{contentId:string;contentVersion:number|null;title:string;opened:number;interacted:number;manualSaved:number;completed:number;undo:number;tools:Record<'brush'|'bucket'|'eraser'|'stamp',number>}
export interface ColoringReport{items:ColoringMetrics[];total:number;totals:{opened:number|null;interacted:number|null;manualSaved:number|null;completed:number|null};meta:{measured:boolean;timezone:string;availableFrom:string|null;measurementVersion:number;coverage:string;scope:string;from:string;to:string}}

import {z} from 'zod';
import {CreativeSceneItemSchema} from './creative.js';
export const HabitatProjectSchema=z.object({version:z.literal(1),activeSceneId:z.string().min(1),scenes:z.array(z.object({id:z.string().min(1),title:z.string().max(120),items:z.array(CreativeSceneItemSchema).max(100).refine(items=>new Set(items.map(i=>i.id)).size===items.length,'ID vật thể không trùng')})).min(1).max(8)}).refine(p=>new Set(p.scenes.map(s=>s.id)).size===p.scenes.length&&p.scenes.some(s=>s.id===p.activeSceneId),'Cảnh đang mở phải thuộc dự án và ID cảnh không trùng');
export const CreativeSourceReferenceSchema=z.object({contentId:z.string().min(1).max(160),contentVersion:z.number().int().positive().nullable(),title:z.string().max(200)});
export type CreativeSourceReference=z.infer<typeof CreativeSourceReferenceSchema>;
export const HabitatStarterRef=z.discriminatedUnion('kind',[z.object({kind:z.literal('empty')}),z.object({kind:z.literal('template'),contentId:z.string().uuid(),publishedVersion:z.number().int().positive()})]);
export const HabitatChallengeInput=z.object({presetKey:z.string().max(80).optional(),title:z.string().trim().min(1).max(120),prompt:z.string().trim().min(1).max(1000),starterRef:HabitatStarterRef});
export type HabitatChallengeInputDto=z.infer<typeof HabitatChallengeInput>;
export interface HabitatChallengeSnapshot {schemaVersion:1;title:string;prompt:string;presetKey?:string;starter:{ref:z.infer<typeof HabitatStarterRef>;title:string;project:z.infer<typeof HabitatProjectSchema>;capturedAt:string}}
export interface HabitatChallengeContext {sessionId:string;title:string;code:string;kind:'scan'|'habitat';expiresAt:string;effectiveState:'open'|'paused'|'expired'|'ended';teacherDisplayName:string;challenge:HabitatChallengeSnapshot|null}
export function creativeEffectiveState(s:{state:string;expires_at:string|Date},now=Date.now()){return s.state==='ended'?'ended':new Date(s.expires_at).getTime()<=now?'expired':s.state==='paused'?'paused':'open';}

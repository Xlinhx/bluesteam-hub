import type pg from 'pg';
import {HabitatProjectSchema,type HabitatChallengeInputDto,type HabitatChallengeSnapshot} from '@bluesteam/contracts';
import {AppError} from '../common/errors.js';
export async function resolveHabitatChallenge(db:pg.PoolClient,input:HabitatChallengeInputDto):Promise<HabitatChallengeSnapshot>{
 let title='Nền trống',project:HabitatChallengeSnapshot['starter']['project']={version:1 as const,activeSceneId:'scene-1',scenes:[{id:'scene-1',title:'Cảnh 1',items:[] as any[]}]};
 if(input.starterRef.kind==='template'){
  const row=(await db.query("SELECT title,payload,version FROM creative_templates WHERE id=$1 AND kind='habitat' AND visibility='published' FOR SHARE",[input.starterRef.contentId])).rows[0];
  if(!row||row.version!==input.starterRef.publishedVersion)throw new AppError('STARTER_CHANGED','Cảnh khởi đầu đã đổi hoặc không còn công khai. Chọn lại cảnh.',409);
  title=row.title;project=HabitatProjectSchema.parse({version:1,activeSceneId:'scene-1',scenes:[{id:'scene-1',title:'Cảnh 1',items:row.payload.items||[]}]});
 }
 return {schemaVersion:1,title:input.title,prompt:input.prompt,presetKey:input.presetKey,starter:{ref:input.starterRef,title,project,capturedAt:new Date().toISOString()}};
}
export function projectKey(session:string,participant:string,client:string){return Buffer.from(JSON.stringify([session,participant,client])).toString('base64url');}
export function parseProjectKey(value:string,session:string){try{const a=JSON.parse(Buffer.from(value,'base64url').toString());if(Array.isArray(a)&&a.length===3&&a[0]===session&&a.every(v=>typeof v==='string'))return a as string[];}catch{}throw new AppError('PROJECT','Dự án không hợp lệ.',400);}

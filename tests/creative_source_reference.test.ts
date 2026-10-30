import {it,expect} from 'vitest';
import {creativeStorage} from '../src/shared/creative/creativeStorage';
import {migrateLegacyArtworkRecord} from '../src/shared/creative/localDraftMigration';
it('retains source version and immutable challenge through local persistence and migration',async()=>{
 const snapshot={contentType:'creative_template' as const,contentId:crypto.randomUUID(),title:'Bãi cát',kind:'habitat',thumbnailUrl:'',narrationUrl:null,config:{items:[]},contentVersion:2,capturedAt:'2026-10-30T01:00:00Z'};
 const art={id:'source-v2',type:'habitat' as const,title:'Hai cảnh',createdAt:1,isDraft:true,previewDataUrl:'',sourceSnapshot:snapshot,habitatChallenge:{sessionId:crypto.randomUUID(),code:'123456',alias:'Hà',challenge:{schemaVersion:1 as const,title:'Thử',prompt:'Tạo chỗ trú',starter:{ref:{kind:'empty' as const},title:'Nền trống',project:{version:1 as const,activeSceneId:'s',scenes:[{id:'s',title:'Cảnh 1',items:[]}]},capturedAt:'2026-10-30T01:00:00Z'}}}};
 await creativeStorage.saveArtwork(art);const loaded=await creativeStorage.getArtworkById(art.id);expect(loaded?.sourceSnapshot?.contentVersion).toBe(2);expect(loaded?.habitatChallenge).toEqual(art.habitatChallenge);
 const legacy=migrateLegacyArtworkRecord({id:'old-source',type:'drawing',title:'Tranh cũ',createdAt:1,previewDataUrl:''});expect(legacy.sourceSnapshot).toBeUndefined();
});

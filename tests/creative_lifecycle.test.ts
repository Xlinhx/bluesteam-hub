import {beforeEach,describe,expect,it} from 'vitest';
import {creativeStorage,type CreativeArtwork} from '../src/shared/creative/creativeStorage';
import {getArtworkWorkState,selectResumeArtworks,createRevisionDraft} from '../src/shared/creative/artworkLifecycle';
const art:CreativeArtwork={id:'finished',type:'drawing',title:'Cá voi',createdAt:1,previewDataUrl:'preview',drawingData:{canvasDataUrl:'composite',document:{schemaVersion:2,templateId:'whale',paintDataUrl:'paint'}}};
beforeEach(()=>creativeStorage.clearAll());
describe('creative work lifecycle',()=>{
 it('keeps legacy finished work and lists only drafts, ordered by most recent edit',()=>{
  expect(getArtworkWorkState(art)).toBe('completed');
  expect(selectResumeArtworks([art,{...art,id:'old',isDraft:true,updatedAt:8},{...art,id:'new',isDraft:true,updatedAt:10}]).map(a=>a.id)).toEqual(['new','old']);
 });
 it('creates a separate editable revision without copying delivery identity or changing the original',async()=>{
  await creativeStorage.saveArtwork({...art,isDraft:false,completedAt:4,submissionState:'submitted',submittedArtworkId:'server-id'});
  const source=(await creativeStorage.getArtworkById('finished'))!;
  const draft=await createRevisionDraft(source);
  expect(draft.id).not.toBe(source.id);expect(draft.sourceArtworkId).toBe(source.id);expect(draft.isDraft).toBe(true);expect(draft.completedAt).toBeUndefined();expect(draft.submittedArtworkId).toBeNull();
  expect(draft.drawingData).toEqual(source.drawingData);
  expect(await creativeStorage.getArtworkById(source.id)).toEqual(source);
  expect((await creativeStorage.getArtworkById(draft.id))?.sourceArtworkId).toBe(source.id);
 });
});

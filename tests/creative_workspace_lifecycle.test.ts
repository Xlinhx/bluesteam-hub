import { beforeEach, expect, it } from 'vitest';
import { creativeStorage } from '../src/shared/creative/creativeStorage';

beforeEach(() => creativeStorage.clearAll());
const art = { id:'project-1',type:'habitat' as const,title:'Hai cảnh',createdAt:1,previewDataUrl:'data:image/png;base64,preview' };

it('round-trips independent scenes, active scene and frozen template configuration', async () => {
  const project = { version:1,activeSceneId:'b',scenes:[{id:'a',title:'Vùng cỏ',items:[]},{id:'b',title:'Vùng đá',items:[]}] };
  await creativeStorage.saveArtwork({ ...art, templateConfig:{materials:[],instructionText:'Không thêm vật thể'},habitatData:{items:[],project} } as any);
  const saved = await creativeStorage.getArtworkById(art.id);
  expect(saved?.habitatData).toEqual({items:[],project});
  expect((saved as any)?.templateConfig).toEqual({materials:[],instructionText:'Không thêm vật thể'});
});

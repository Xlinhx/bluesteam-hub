import {it,expect} from 'vitest';
import {createDrawingSeaSource} from '../src/shared/creative/scanning/drawingSeaSource';
import {creativeStorage} from '../src/shared/creative/creativeStorage';
it('creates an independent paper-processing draft from the saved composite without changing the original drawing',async()=>{
 const art={id:'drawing-source',type:'drawing' as const,title:'Tranh',createdAt:1,previewDataUrl:'data:image/png;base64,abc',editVersion:4,drawingData:{canvasDataUrl:'data:image/png;base64,abc'}};
 await creativeStorage.saveArtwork(art);const scan=await createDrawingSeaSource(art);
 expect(scan.type).toBe('scan');expect(scan.scanData?.schemaVersion).toBe(2);expect(scan.scanData?.originalDataUrl).toBe(art.previewDataUrl);expect(scan.scanData?.cutoutDataUrl).toBe('');expect(scan.scanData?.origin).toEqual({kind:'coloring',artworkId:'drawing-source',editVersion:4});expect((await creativeStorage.getArtworkById(art.id))?.type).toBe('drawing');
});

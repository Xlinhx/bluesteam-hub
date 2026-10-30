import {creativeStorage} from '../src/shared/creative/creativeStorage';
import {expect,it} from 'vitest';
import {scanCompletionIssue,scanWorkspaceStep,type ScanDocument} from '../src/shared/creative/scanning/scanDocument';
const document:ScanDocument={schemaVersion:1,originalDataUrl:'original',cutoutDataUrl:'cutout',motion:'swim',environmentId:'reef',crop:{x:0,y:0,width:100,height:100}};
it('requires a reviewed cutout and allowed motion/environment before completion',()=>{
 expect(scanCompletionIssue(document)).toMatch(/xem lại/i);
 expect(scanCompletionIssue({...document,reviewConfirmed:true,cutoutDataUrl:''})).toMatch(/tách nền/i);
 expect(scanCompletionIssue({...document,reviewConfirmed:true,environmentId:'missing'})).toMatch(/môi trường/i);
 expect(scanCompletionIssue({...document,reviewConfirmed:true})).toBeNull();
});

it('exports and recovers capture-stage drafts and completion metadata without altering the source',async()=>{
 await creativeStorage.clearAll();
 const art={id:'scan-capture',type:'scan' as const,title:'Chưa tách nền',createdAt:1,isDraft:true,sourceArtworkId:'old-art',previewDataUrl:'original',scanData:{...document,cutoutDataUrl:'',reviewConfirmed:false,stage:'capture' as const}};
 await creativeStorage.saveArtwork(art);const before=await creativeStorage.getArtworkById(art.id);const bundle=await creativeStorage.exportBundle();await creativeStorage.clearAll();await creativeStorage.recoverFromBundle(bundle);expect(await creativeStorage.getArtworkById(art.id)).toEqual(before);
});

it('maps both legacy final stages to the combined second step without losing capture drafts',()=>{
 expect(scanWorkspaceStep({...document,stage:'environment'})).toBe(2);
 expect(scanWorkspaceStep({...document,stage:'review'})).toBe(2);
 expect(scanWorkspaceStep({...document,stage:'capture'})).toBe(1);
 expect(scanWorkspaceStep({...document,stage:'environment',cutoutDataUrl:''})).toBe(1);
 expect(scanWorkspaceStep(document)).toBe(2);
});

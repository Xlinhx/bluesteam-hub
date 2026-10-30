import {creativeStorage,type CreativeArtwork} from './creativeStorage';
export function getArtworkWorkState(art:CreativeArtwork):'draft'|'completed'{return art.isDraft===true?'draft':'completed';}
export function selectResumeArtworks(arts:CreativeArtwork[]){return arts.filter(a=>a.isDraft===true&&(a.scanData?.originalDataUrl||a.drawingData?.canvasDataUrl||a.habitatData)).sort((a,b)=>(b.updatedAt??b.createdAt)-(a.updatedAt??a.createdAt)||a.id.localeCompare(b.id));}
export async function createRevisionDraft(source:CreativeArtwork):Promise<CreativeArtwork>{
 const next:CreativeArtwork={...structuredClone(source),id:`${source.type}-${crypto.randomUUID()}`,sourceArtworkId:source.id,createdAt:Date.now(),updatedAt:Date.now(),isDraft:true,completedAt:undefined,editVersion:0,clientSubmissionId:undefined,submissionState:'local_only',submittedArtworkId:null,submittedEditVersion:undefined,submittedRoomId:null,submittedRoundId:null,lastSubmissionError:null};
 await creativeStorage.saveArtwork(next);return next;
}

import {creativeStorage,type CreativeArtwork} from '../creativeStorage';
export async function createDrawingSeaSource(art:CreativeArtwork){
 if(art.type!=='drawing'||!art.previewDataUrl.startsWith('data:image/'))throw Error('Chưa có ảnh tranh đã tô để đưa vào biển.');
 const snapshot=art.sourceSnapshot;const scan:CreativeArtwork={id:'scan-'+crypto.randomUUID(),type:'scan',title:art.title,createdAt:Date.now(),isDraft:true,editVersion:0,previewDataUrl:art.previewDataUrl,scanData:{schemaVersion:2,origin:{kind:'coloring',artworkId:art.id,editVersion:art.editVersion||0,...(snapshot?{contentRef:{contentId:snapshot.contentId,contentVersion:snapshot.contentVersion||null,title:snapshot.title}}:{})},originalDataUrl:art.previewDataUrl,cutoutDataUrl:'',environmentId:'reef',motion:'swim',crop:{x:0,y:0,width:100,height:100},stage:'capture',reviewConfirmed:false}};await creativeStorage.saveArtwork(scan);return scan;
}

/** Current Creative content; the historical mock archive remains immutable. */
export function withCreativeDesignSeed(source: any, uuid: (key: string) => string, mode: 'content'|'demo'='content'): any {
  const data=structuredClone(source);
  const palette=['#174C56','#219B73','#F1C84C','#EF7759','#4A9FCA','#B185C8'];
  const stamps=[
    ['crab','Cua nhỏ','/assets/generated/r2-cutouts/crab_friendly_cutout.png'],
    ['starfish','Sao biển','/assets/generated/r2-cutouts/starfish_cutout.png'],
    ['clownfish','Cá hề','/assets/generated/creatures/clownfish_isolated.png'],
    ['seashell','Vỏ sò','/assets/generated/r2-cutouts/seashell_cutout.png'],
    ['dolphin','Cá heo','/assets/generated/r2-cutouts/dolphin_cutout.png'],
    ['jellyfish','Sứa biển','/assets/generated/r2-cutouts/jellyfish_cutout.png'],
  ];
  const objects=[
    ['seagrass-tall','Cỏ biển cao','seagrass',1.2],['seagrass-short','Cỏ biển lùn','seagrass',.8],
    ['rock-large','Tảng đá lớn','rock',1.3],['rock-small','Tảng đá nhỏ','rock',.8],
    ['turtle-green','Rùa biển xanh','turtle',1],['clownfish','Cá hề','fish',.8],
  ] as const;
  const materials=[...stamps.map(([id,title,mediaUrl])=>({sourceKey:`material:stamp-${id}`,title,kind:'stamp',mediaUrl,payload:{stampId:id,defaultScale:1},visibility:'published'})),
    ...objects.map(([id,title,type,defaultScale])=>({sourceKey:`material:habitat-${id}`,title,kind:'habitat_item',mediaUrl:`/assets/habitat/${id}.png`,payload:{assetId:id,itemType:type,defaultScale},visibility:'published'}))];
  const stampIds=materials.filter(m=>m.kind==='stamp').map(m=>uuid(m.sourceKey));
  const habitatIds=materials.filter(m=>m.kind==='habitat_item').map(m=>uuid(m.sourceKey));
  const items=objects.map(([assetId,nameVi,type,scale],i)=>({id:`starter-${assetId}`,assetId,nameVi,nameEn:nameVi,type,scale:Number(scale),rotation:0,x:[-3,2,-1,3,0,-2][i],z:[1,-1,0,2,-2,-1][i],y:type==='fish'||type==='turtle'?1:0}));
  items[2].x=-4;items[2].z=-2;items[4].x=1;items[4].z=-1;items[5].x=3;
  for(let i=0;i<6;i++)items.push({...items[i%2],id:`starter-grass-${i}`,x:[-5,-3,4,5,1,-1][i],z:[-3,3,-3,1,3,-3][i],rotation:i*.8,scale:.7+i*.07});
  const drawings=[
    ['drawing-ocean-friend','Rùa biển xanh','turtle_coloring_lineart_v2.png'],
    ['drawing-octopus','Bạch tuộc vui vẻ','octopus_coloring_lineart_v2.png'],
    ['drawing-coral','Rạn san hô nhỏ','coral_coloring_lineart_v2.png'],
    ['drawing-blank','Trang giấy trắng',null],
    ['drawing-crab','Vẽ bạn cua',null],
    ['drawing-clownfish','Cá hề bên hải quỳ','clownfish_coloring_lineart.png'],
    ['drawing-starfish','Sao biển trên cát','starfish_coloring_lineart.png'],
  ] as const;
  const templates=drawings.map(([key,title,file])=>({sourceKey:`template:${key}`,title,kind:'drawing',visibility:'published',schemaVersion:1,topicSlugs:['species'],previewUrl:file?`/assets/generated/craft/${file}`:null,
    payload:{...(file?{outlineUrl:`/assets/generated/craft/${file}`}:{blankPaper:true}),suggestedPalette:palette,materialIds:stampIds,materials:materials.filter(m=>m.kind==='stamp').map(m=>({id:uuid(m.sourceKey),title:m.title,kind:m.kind,payload:m.payload,mediaUrl:m.mediaUrl,version:1})),instructionText:key==='drawing-crab'?'Bé dùng nhãn dán cua rồi vẽ thêm ngôi nhà cho bạn nhé.':'Bé chọn màu yêu thích, vẽ thêm rong biển và những người bạn nhỏ nhé.'}}));
  const habitats=[['habitat-seagrass','Thảm cỏ biển','seagrass',items],['habitat-reef','Rạn san hô nhỏ','reef',items.filter(i=>i.type!=='seagrass')],['habitat-sand','Bãi cát bình yên','sand',items.filter(i=>i.type==='rock')]] as const;
  data.reusableContent.creativeTemplates=[...templates,...habitats.map(([key,title,scene,sceneItems])=>({sourceKey:`template:${key}`,title,kind:'habitat',visibility:'published',schemaVersion:1,topicSlugs:['species'],previewUrl:`/assets/habitat/scene-${scene}.png`,payload:{items:sceneItems,materialIds:habitatIds,materials:materials.filter(m=>m.kind==='habitat_item').map(m=>({id:uuid(m.sourceKey),title:m.title,kind:m.kind,payload:m.payload,mediaUrl:m.mediaUrl,version:1})),instructionText:'Bé sắp xếp đá và cỏ biển, rồi cho các bạn sinh vật ghé thăm.'}}))];
  data.reusableContent.creativeMaterials=materials;
  if(mode==='demo'){
    const ownedMaterials=materials.map(m=>({...m,sourceKey:`demo:${m.sourceKey}`,demoOwned:true}));
    const idMap=new Map(materials.map(m=>[uuid(m.sourceKey),uuid(`demo:${m.sourceKey}`)]));
    const ownedTemplates=data.reusableContent.creativeTemplates.map((t:any)=>({...t,sourceKey:`demo:${t.sourceKey}`,demoOwned:true,payload:{...t.payload,materialIds:t.payload.materialIds.map((id:string)=>idMap.get(id)),...(t.payload.materials?{materials:t.payload.materials.map((m:any)=>({...m,id:idMap.get(m.id)}))}:{})}}));
    data.reusableContent.creativeMaterials.push(...ownedMaterials);
    data.reusableContent.creativeTemplates.push(...ownedTemplates);
  }
  for(const room of data.demoFixtures?.rooms || []) for(const art of room.artworks || []) if(art.kind==='habitat') {art.scenePayload={schemaVersion:1,items:structuredClone(items)};art.previewUrl='/assets/generated/craft/artwork_habitat_seed.png';}
  return data;
}

/** Import reusable content and artwork history without recreating teaching rooms. */
export function withStandaloneDesignSeed(input:any,mode:'content'|'demo') {
  if(mode!=='demo'||!input.demoFixtures)return input;
  const data=structuredClone(input);
  const home=data.reusableContent.activities.find((item:any)=>item.sourceKey==='activity:home-sorting');
  if (home) {
    const coastal = structuredClone(home);
    coastal.sourceKey = 'activity:coastal-room-home';
    coastal.slug = 'coastal-room-home'; coastal.title = 'Về đúng nhà';
    coastal.coverUrl = '/assets/generated/profile/coastal-room-scene.png';
    coastal.config = { templateKey: 'sorting', instructionText: 'Đưa bạn nhỏ về đúng nhà nhé!', allowRetry: true, scoringEnabled: true, backgroundUrl: coastal.coverUrl,
      targets: [{id:'zone-sand',label:'Bãi cát',bounds:{x:.04,y:.67,width:.25,height:.15}}, {id:'zone-seagrass',label:'Cỏ biển',bounds:{x:.37,y:.65,width:.25,height:.15}}, {id:'zone-coral',label:'San hô',bounds:{x:.70,y:.65,width:.25,height:.15}}],
      objects: [{id:'obj-turtle',label:'Rùa biển',imageUrl:'/assets/generated/profile/room-turtle-cutout.png',acceptedTargetIds:['zone-seagrass'],points:1},{id:'obj-crab',label:'Cua',imageUrl:'/assets/generated/r2-cutouts/crab_friendly_cutout.png',acceptedTargetIds:['zone-sand'],points:1},{id:'obj-clownfish',label:'Cá hề',imageUrl:'/assets/generated/creatures/clownfish_isolated.png',acceptedTargetIds:['zone-coral'],points:1}] };
    data.reusableContent.activities.push(coastal);
  }

  data.demoFixtures.artworks=(data.demoFixtures.rooms||[]).flatMap((legacy:any)=>(legacy.artworks||[]).map((art:any)=>{
    const author=(legacy.participants||[]).find((person:any)=>person.sourceKey===art.participantSourceKey);
    return {...art,authorName:author?.alias||'Bé',authorAvatarKey:author?.avatarKey||'turtle'};
  }));
  delete data.demoFixtures.rooms;
  return data;
}

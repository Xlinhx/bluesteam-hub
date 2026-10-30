/** A catalog image and its activity stage share one snapshot identity. */
export function activityIdFromPath(path:string){
  const match=/^\/interactive\/(?:activities|models)\/([^/?]+)$/.exec(path);
  if(!match)return null;
  try{return decodeURIComponent(match[1]);}catch{return null;}
}

export function nameInteractiveArtwork(doc:Document,id:string|null){
  if(!id||!doc.querySelectorAll)return ()=>{};
  const experience=[...doc.querySelectorAll<HTMLElement>('[data-motion-content-id]')].find(element=>element.dataset.motionContentId===id&&element.matches('.interactive-activity-motion'));
  const target=experience?.querySelector<HTMLElement>('.sorting-journey__backdrop,.sorting-ocean__background,.scenario-scene-image,.sketchfab-viewer') || experience || [...doc.querySelectorAll<HTMLElement>('.activity-thumbnail[data-motion-content-id]')].find(element=>element.dataset.motionContentId===id);
  if(!target)return ()=>{};
  const previous=target.style.viewTransitionName;
  target.style.viewTransitionName='interactive-artwork';
  return ()=>{target.style.viewTransitionName=previous;};
}

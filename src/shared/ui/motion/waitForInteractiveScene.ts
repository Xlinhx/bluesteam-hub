/** Preserve the outgoing scene briefly while the real incoming content replaces its loader. */
export function waitForInteractiveScene(path:string,doc:Document,signal:AbortSignal,maximumWait=650){
  if(signal.aborted||!doc.defaultView||!doc.body)return Promise.resolve();
  const catalog=/^\/(?:teacher\/)?interactive$/.test(path);
  const selector=catalog?'.curated-card,.ocean-activity-card,.usage-summary,.usage-state,.ocean-catalog-message,.curated-message':'.interactive-activity-motion,[role=alert]';
  return new Promise<void>(resolve=>{
    let complete=false,checking=false;
    const finish=()=>{if(complete)return;complete=true;observer.disconnect();clearTimeout(timer);signal.removeEventListener('abort',finish);resolve();};
    const ready=()=>{
      if(checking||!doc.querySelector(selector))return;
      checking=true;
      const images=[...doc.querySelectorAll<HTMLImageElement>('.interactive-world__creature,.interactive-world-scene__preload,.activity-thumbnail')].filter(image=>image.getBoundingClientRect().top<innerHeight).slice(0,10);
      void Promise.all(images.map(image=>image.decode().catch(()=>{}))).then(finish);
    };
    const observer=new MutationObserver(ready);observer.observe(doc.body,{childList:true,subtree:true});
    const timer=setTimeout(finish,maximumWait);signal.addEventListener('abort',finish,{once:true});ready();
  });
}

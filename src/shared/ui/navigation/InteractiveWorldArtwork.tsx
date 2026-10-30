import type {CSSProperties} from 'react';
import {useEffect,useRef,useState} from 'react';
import type {InteractiveCategoryKind} from '../../data/categoryArtworkMap';
import './interactive-world-artwork.css';

// Each generated atlas contains an environment and an independently movable actor.
// The cells use measured bounds, so we do not assume a generated sprite has equal halves.
const bounds:Record<InteractiveCategoryKind,{base:number[];actor:number[]}>= {
  model3d:{base:[0,50,1024,740],actor:[150,850,800,500]},
  game:{base:[0,390,1024,640],actor:[240,1070,550,390]},
  simulation:{base:[0,90,1024,930],actor:[485,1145,430,310]},
  scenario:{base:[0,30,1024,760],actor:[140,850,730,590]},
};
function spriteStyle(kind:InteractiveCategoryKind,rect:number[]):CSSProperties{
  const [x,y,w,h]=rect;
  return {backgroundImage:`url(/assets/generated/interactive/v5/world-${kind}-layers-v1.webp)`,backgroundSize:`${1024/w*100}% ${1536/h*100}%`,backgroundPosition:`${w===1024?0:x/(1024-w)*100}% ${y/(1536-h)*100}%`};
}
export function InteractiveWorldArtwork({kind}:{kind:InteractiveCategoryKind}){
  const [ready,setReady]=useState(false);
  const root=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    const element=root.current;if(!element)return;
    const observer=new IntersectionObserver(entries=>{element.dataset.inView=String(entries[0].isIntersecting);});
    observer.observe(element);return ()=>observer.disconnect();
  },[]);
  return <span ref={root} data-ready={ready} className={`interactive-world-scene interactive-world-scene--${kind}`} aria-hidden="true">
    <img className="interactive-world-scene__preload" src={`/assets/generated/interactive/v5/world-${kind}-layers-v1.webp`} alt="" onLoad={()=>setReady(true)}/>
    <span className="interactive-world-scene__base" style={spriteStyle(kind,bounds[kind].base)}/>
    <span className="interactive-world-scene__actor" style={spriteStyle(kind,bounds[kind].actor)}/>
    <svg className="interactive-world-scene__kelp" viewBox="0 0 60 100"><defs><linearGradient id={`world-kelp-${kind}`} x2="1" y2=".3"><stop stopColor="#287e53"/><stop offset=".55" stopColor="#9ac847"/><stop offset="1" stopColor="#d2e585"/></linearGradient></defs>{[0,1,2].map(n=><path key={n} style={{'--frond':n,fill:`url(#world-kelp-${kind})`} as CSSProperties} d={['M29 98C14 73 6 62 17 39C27 20 10 11 19 0C40 18 28 36 27 47C24 66 36 80 34 98Z','M30 100C41 78 39 61 47 45C56 29 42 25 48 14C67 34 51 46 52 58C53 76 43 88 38 100Z','M28 100C21 83 20 76 8 62C1 54 7 45 4 37C23 46 16 56 23 64C35 80 36 92 34 100Z'][n]}/>)}</svg>
    <svg className="interactive-world-scene__current" viewBox="0 0 300 200"><ellipse cx="150" cy="154" rx="110" ry="24"/><ellipse cx="150" cy="154" rx="87" ry="17"/></svg>
    <span className="interactive-world-scene__particles"><i/><i/><i/></span>
  </span>;
}

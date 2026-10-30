import { useEffect, useRef, type ReactNode } from 'react';
import { useInteractiveAudioMotion } from '../motion/useInteractiveMotion';
import '../motion/interactive-motion.css';
import { INTERACTIVE_BACKDROP } from '../../data/interactiveArtwork';
import '../../theme/interactive-tokens.css';
import './interactive-seascape.css';
import { InteractiveOceanLife } from './InteractiveOceanLife';
import { useInteractiveChoreography } from '../motion/useInteractiveChoreography';
export function InteractiveSeascape({ audience, children, className = '', scene = '' }: { audience: 'learner' | 'teacher'; children: ReactNode; className?: string; scene?:string }) {
  const root = useRef<HTMLDivElement>(null);
  useInteractiveAudioMotion(root);
  useInteractiveChoreography(root,scene);
  useEffect(()=>{
    const update=()=>{if(root.current)root.current.dataset.motionSleep=String(document.hidden);};
    update();document.addEventListener('visibilitychange',update);
    return ()=>document.removeEventListener('visibilitychange',update);
  },[]);
  return <div ref={root} className={`interactive-seascape interactive-seascape--${audience} ${className}`} data-audience={audience}>
    <div className="interactive-seascape__artwork" aria-hidden="true">
      <svg className="interactive-seascape__wash" viewBox="0 0 1440 500" preserveAspectRatio="none"><path d="M0 0H1440V280Q1120 130 740 220T0 250Z" fill="#dff5f8"/><path d="M0 0H1440V95Q1100 250 690 130T0 190Z" fill="#bceaf1" opacity=".45"/></svg>
      {INTERACTIVE_BACKDROP.map(layer => <picture className={`interactive-seascape__layer interactive-seascape__layer--${layer.id}`} key={layer.id}><source media="(max-width:767px)" srcSet={layer.mobile}/><img src={layer.src} alt="" decoding="async"/></picture>)}
      <InteractiveOceanLife/>
    </div>{children}
  </div>;
}

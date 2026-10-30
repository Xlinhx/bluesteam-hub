import {Waves,Check} from 'lucide-react';
import type {ScanMotion} from '../../../../shared/creative/scanning/scanDocument';

function MotionFish({motion}:{motion:ScanMotion}){
 return <svg viewBox="0 0 80 50" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
  <path d="M19 24C25 12 43 10 56 22L68 14V34L56 27C43 39 27 37 19 24ZM34 15C32 8 41 6 45 14M34 34C36 42 44 41 47 33M40 22L47 28 39 30"/>
  <circle cx="28" cy="22" r="1.8" fill="currentColor" stroke="none"/>
  <path d="M22 28Q26 30 29 27"/>
  {motion==='swim'&&<path d="M6 38q5-8 10 0t10 0t10 0M3 18h9M7 26h6"/>}
  {motion==='float'&&<path d="M7 38q7 7 14 0t14 0t14 0M42 4v5M39 7l3-3 3 3"/>}
  {motion==='floor'&&<path d="M7 44q5-4 10 0t10 0t10 0t10 0t10 0M11 42l-3-9m5 8 1-7m46 7 1-9m3 10 4-6M20 42l-1-4"/>}
 </svg>;
}
export function ScanMotionPicker({value,onChange,disabled}:{value:ScanMotion;onChange:(v:ScanMotion)=>void;disabled:boolean}){
 return <section className="scan-choice-surface"><h2><Waves size={21}/>Bạn nhỏ sẽ đi như thế nào?</h2><div className="scan-motion-options">{([['swim','Bơi'],['float','Nổi nhẹ'],['floor','Đi dưới đáy']] as const).map(([id,label])=><button key={id} disabled={disabled} aria-pressed={value===id} onClick={()=>onChange(id)}><MotionFish motion={id}/><strong>{label}</strong><span className="scan-radio">{value===id&&<Check size={13}/>}</span></button>)}</div></section>;
}

import type { CSSProperties } from 'react';

/** Independent silhouettes live in the water margins, behind all reading surfaces. */
export function InteractiveOceanLife(){
  return <div className="interactive-ocean-life" aria-hidden="true">
    <svg width="0" height="0" className="interactive-ocean-life__definitions"><defs>
      <linearGradient id="interactive-fish-wash" x2=".3" y2="1"><stop stopColor="#6ecedb"/><stop offset=".5" stopColor="#178fae"/><stop offset="1" stopColor="#096c91"/></linearGradient>
      <symbol id="interactive-reef-fish" viewBox="0 0 100 52"><path d="M23 26C39 5 65 5 84 25C66 45 40 47 23 26L5 42L10 26L5 9Z" fill="url(#interactive-fish-wash)"/><path d="M42 11L54 3L64 12M43 39L55 49L64 39" fill="#168ba8"/><path d="M57 16Q48 26 58 35" fill="none" stroke="#a6e5e6" strokeWidth="2" opacity=".5"/><circle cx="73" cy="23" r="2" fill="#064860"/></symbol>
    </defs></svg>
    {[0,1,2].map(school=><div className={`interactive-fish-school interactive-fish-school--${school}`} key={school}>
      {[0,1,2,3].map(fish=><svg key={fish} className="interactive-reef-fish" viewBox="0 0 100 52" style={{'--fish-index':fish} as CSSProperties}><use href="#interactive-reef-fish"/></svg>)}
    </div>)}
    <div className="interactive-ocean-life__rays"/>
    {[0,1,2,3,4,5,6,7].map(i=><i key={i} className="interactive-ocean-bubble" style={{'--bubble-index':i} as CSSProperties}/>)}
    <img className="interactive-ocean-life__seahorse" src="/assets/generated/interactive/v5/creature-seahorse-cutout-v1.webp" alt=""/>
    <img className="interactive-ocean-life__ray" src="/assets/generated/interactive/v5/creature-stingray-cutout-v1.webp" alt=""/>
  </div>;
}

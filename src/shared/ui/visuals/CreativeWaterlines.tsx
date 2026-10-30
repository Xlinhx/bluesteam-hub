import './creative-waterlines.css';
/** A quiet tidal contour belongs to the coast, never to the editable artwork. */
export function CreativeWaterlines({kind='desk'}:{kind?:'desk'|'sea'|'hub'}){
 const current=kind==='hub'?'M-40 150C190 45 250 260 520 185S940 38 1190 132S1360 170 1500 110':kind==='sea'?'M-40 82C240 222 378 52 690 126S1190 214 1500 64':'M-40 65C180 160 300 30 470 86S790 190 1000 70S1330 95 1500 40';
 return <div className="creative-waterlines" data-kind={kind} aria-hidden="true">
  <svg className="creative-current-sheet" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
   <path className="creative-current-wash" d="M-80 20Q240 200 620 68T1500 75L1500-30H-80Z" fill="#8ac8cd" fillOpacity=".13"/>
   <path className="creative-current-contour" d={current} stroke="#5eabb5" strokeWidth="1.5"/>
   <path className="creative-current-thread" pathLength="1" d={current} transform="translate(0 24)" stroke="#76bec5" strokeWidth="2"/>
   <path className="creative-current-return" d="M-40 786Q230 650 530 788T1060 800T1490 700" stroke="#70afac" strokeWidth="1.2"/>
   <g className="creative-current-foam" stroke="#83c7cc" strokeWidth="1.4"><circle cx="38" cy="260" r="9"/><circle cx="58" cy="218" r="4"/><circle cx="1394" cy="350" r="12"/><circle cx="1413" cy="310" r="5"/></g>
  </svg>
  <svg className="creative-side-frond creative-side-frond-left" viewBox="0 0 100 340" fill="none"><g strokeLinecap="round"><path d="M27 330C70 250 6 170 38 20" stroke="#488f85" strokeWidth="3"/><path d="M34 250Q85 220 69 170Q42 187 34 250ZM33 204Q2 177 10 128Q35 146 33 204ZM30 141Q69 116 58 77Q35 91 30 141Z" fill="#71aca0" fillOpacity=".35" stroke="#63a294" strokeWidth="1.3"/><path d="M66 337Q44 290 77 244M63 306L89 282M64 318L44 298" stroke="#da987b" strokeWidth="3"/></g></svg>
  <svg className="creative-side-frond creative-side-frond-right" viewBox="0 0 100 340" fill="none"><g strokeLinecap="round"><path d="M27 330C70 250 6 170 38 20" stroke="#488f85" strokeWidth="3"/><path d="M34 250Q85 220 69 170Q42 187 34 250ZM33 204Q2 177 10 128Q35 146 33 204ZM30 141Q69 116 58 77Q35 91 30 141Z" fill="#71aca0" fillOpacity=".35" stroke="#63a294" strokeWidth="1.3"/></g></svg>
 </div>;
}

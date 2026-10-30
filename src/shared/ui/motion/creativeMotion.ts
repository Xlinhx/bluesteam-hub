import {rectTransform} from './motionScope';
type Rect=Pick<DOMRect,'left'|'top'|'width'|'height'>;
export const creativeMotion={respond:130,selection:170,disclose:380,teacher:680,learner:980,settle:'cubic-bezier(.22,1,.36,1)',water:'cubic-bezier(.4,0,.2,1)'};
export function creativeTravel(source:Rect,target:Rect,audience:'teacher'|'learner'){
 const transform=rectTransform(source,target);if(!transform)return null;
 const distance=Math.hypot(target.left-source.left,target.top-source.top);
 return {frames:[{transform,transformOrigin:'top left',opacity:.72},{transform:'none',transformOrigin:'top left',opacity:1}] as Keyframe[],duration:audience==='teacher'?Math.min(780,480+distance*.3):Math.min(1150,700+distance*.4)};
}
/** Reserve space for the entire body, caption, and the complete swimming excursion. */
export function seaCreatureLayout(width:number,height:number,index:number,total:number,motion:string){
 const columns=Math.max(1,Math.ceil(Math.sqrt(Math.max(1,total)*width/Math.max(1,height))));
 const rows=Math.max(1,Math.ceil(total/columns)),cellWidth=width/columns,cellHeight=height/rows;
 const body=Math.max(16,Math.min(total<=3?126:96,cellWidth*.7,cellHeight*.65));
 const travelX=Math.max(0,Math.min(body*.3,(cellWidth-body)*.4)),travelY=Math.max(0,Math.min(12,(cellHeight-body)*.15));
 const x=Math.max(0,Math.min(width-body-travelX,(index%columns+.5)*cellWidth-body/2-travelX/2));
 const y=Math.max(0,Math.min(height-body-travelY-18,motion==='floor'?height-body-travelY-20:(Math.floor(index/columns)+.5)*cellHeight-body/2-travelY));
 return {x,y,width:body,height:body+18,travelX,travelY};
}

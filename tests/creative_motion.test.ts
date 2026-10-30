import {expect,it} from 'vitest';
import {creativeTravel,seaCreatureLayout} from '../src/shared/ui/motion/creativeMotion';
it('anchors artwork travel to actual source and target geometry and bounds its duration',()=>{
 const motion=creativeTravel({left:20,top:70,width:80,height:40},{left:240,top:180,width:320,height:160},'teacher');
 expect(motion?.frames[0].transform).toBe('translate(-220px, -110px) scale(0.25, 0.25)');
 expect(motion?.frames.at(-1)?.transform).toBe('none');expect(motion!.duration).toBeGreaterThanOrEqual(480);expect(motion!.duration).toBeLessThanOrEqual(780);
 expect(creativeTravel({left:0,top:0,width:0,height:1},{left:0,top:0,width:1,height:1},'learner')).toBeNull();
});
it('keeps the full creature within measured water bounds at every population and viewport',()=>{
 for(const width of [180,320,800])for(const height of [180,350])for(const total of [1,5,40])for(let i=0;i<total;i++){
  const p=seaCreatureLayout(width,height,i,total,i%3===0?'floor':i%3===1?'float':'swim');
  expect(p.x).toBeGreaterThanOrEqual(0);expect(p.y-p.travelY).toBeGreaterThanOrEqual(0);
  expect(p.x+p.width+p.travelX).toBeLessThanOrEqual(width);expect(p.y+p.height+Math.abs(p.travelY)).toBeLessThanOrEqual(height);
 }
});

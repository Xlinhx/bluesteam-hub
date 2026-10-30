import { expect, it } from 'vitest';
import { placementFrames } from '../src/shared/ui/motion/interactiveMotion';

it('moves a placed animal from its actual tray geometry to its habitat without assuming screen coordinates',()=>{
  const motion=placementFrames({left:50,top:600,width:80,height:60},{left:250,top:300,width:40,height:30});
  expect(motion?.frames[0]).toMatchObject({translate:'-180px 315px',scale:'2 2'});
  expect(motion?.frames[1]).toMatchObject({translate:'0px 0px',scale:'1 1'});
  expect(motion!.duration).toBeGreaterThan(280);
});
it('bounds travel time and rejects hidden or invalid destinations',()=>{
  expect(placementFrames({left:0,top:0,width:50,height:50},{left:2000,top:2000,width:50,height:50})?.duration).toBe(520);
  expect(placementFrames({left:0,top:0,width:0,height:50},{left:0,top:0,width:50,height:50})).toBeNull();
  expect(placementFrames({left:0,top:0,width:50,height:50},{left:0,top:0,width:NaN,height:50})).toBeNull();
});

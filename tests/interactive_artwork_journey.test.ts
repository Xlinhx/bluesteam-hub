import {expect,it} from 'vitest';
import {activityIdFromPath} from '../src/shared/ui/motion/interactiveArtworkJourney';
it('binds artwork only to real learner activity and model routes',()=>{
  expect(activityIdFromPath('/interactive/activities/fish%20one')).toBe('fish one');
  expect(activityIdFromPath('/interactive/models/turtle')).toBe('turtle');
  for(const path of ['/interactive','/teacher/interactive','/interactive/activities/fish/edit','/interactive/activities/%zz'])expect(activityIdFromPath(path)).toBeNull();
});

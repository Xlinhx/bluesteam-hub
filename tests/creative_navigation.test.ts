import {expect,it,vi} from 'vitest';
import {creativeSceneKey,transitionCreativeScene} from '../src/shared/ui/motion/creativeNavigation';
it('distinguishes actual creative scenes without animating draft IDs, search, polling or editor modes',()=>{
 expect(creativeSceneKey('/creative/drawing?draft=a')).toBe(creativeSceneKey('/creative/drawing?draft=b'));
 expect(creativeSceneKey('/teacher/creative?tab=sea&seaSearch=ha')).toBe(creativeSceneKey('/teacher/creative?tab=sea'));
 expect(creativeSceneKey('/teacher/creative?session=a&submission=b')).not.toBe(creativeSceneKey('/teacher/creative?session=a'));
 expect(creativeSceneKey('/creative/habitat?mode=run')).toBe(creativeSceneKey('/creative/habitat'));
 expect(creativeSceneKey('/teacher/resources')).toBeNull();
});
it('commits directly without motion support, cancels obsolete journeys, and preserves back direction',()=>{
 const commit=vi.fn();expect(transitionCreativeScene('/creative','/creative/scan',commit,true,undefined)).toBe(true);expect(commit).toHaveBeenCalledOnce();
 const updates:Array<()=>unknown>=[],skip=vi.fn(),pending=new Promise(()=>{}),dataset:Record<string,string>={};
 const doc={documentElement:{dataset},querySelector:()=>null,addEventListener:vi.fn(),removeEventListener:vi.fn(),startViewTransition:(update:()=>void)=>{updates.push(update);return {finished:pending,ready:pending,updateCallbackDone:pending,skipTransition:skip};}};
 const a=vi.fn(),b=vi.fn();transitionCreativeScene('/creative','/creative/scan',a,false,doc as any);transitionCreativeScene('/creative/scan','/creative',b,false,doc as any,'back');updates[0]();updates[1]();expect(a).not.toHaveBeenCalled();expect(b).toHaveBeenCalledOnce();expect(skip).toHaveBeenCalled();expect(dataset.creativeJourney).toBe('back');
});

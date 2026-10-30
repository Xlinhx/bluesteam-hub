import {describe,it,expect} from 'vitest';
import {HabitatChallengeInput,HabitatProjectSchema} from '../packages/contracts/src/creative-challenge';
describe('open habitat challenge contracts',()=>{
 it('keeps all scenes and rejects an absent active scene',()=>{
  const p={version:1,activeSceneId:'b',scenes:[{id:'a',title:'Một',items:[]},{id:'b',title:'Hai',items:[]}]};
  expect(HabitatProjectSchema.parse(p).scenes).toHaveLength(2);
  expect(HabitatProjectSchema.safeParse({...p,activeSceneId:'missing'}).success).toBe(false);
  expect(HabitatProjectSchema.safeParse({...p,scenes:Array.from({length:9},(_,i)=>({id:String(i),title:'Cảnh',items:[]}))}).success).toBe(false);
 });
 it('requires a real prompt and versioned starter without restricting materials',()=>{
  expect(HabitatChallengeInput.parse({title:'Thử',prompt:'  Tạo nơi trú  ',starterRef:{kind:'empty'}}).prompt).toBe('Tạo nơi trú');
  expect(HabitatChallengeInput.safeParse({title:'Thử',prompt:' ',starterRef:{kind:'empty'}}).success).toBe(false);
  expect(HabitatChallengeInput.safeParse({title:'Thử',prompt:'Tạo',starterRef:{kind:'template',contentId:crypto.randomUUID()}}).success).toBe(false);
 });
});

import { describe,it,expect,vi } from 'vitest';
import { UsageQueue } from '../src/shared/activities/usage/UsageQueue';
const run={runId:'r',token:'t',openedAt:'',expiresAt:'',definitionVersion:1};
describe('Usage queue does not change gameplay',()=>{
  it('retries with the same event ID and serializes actions',async()=>{
    const ids:string[]=[];
    const send=vi.fn(async(_r,event)=>{ids.push(event.clientEventId);if(ids.length===1)throw new Error('offline');});
    const open=vi.fn(async()=>run),queue=new UsageQueue(open,send,0);
    queue.record({type:'game_answer',itemId:'a',answerId:'b'});queue.record({type:'game_answer',itemId:'c',answerId:'d'});
    await vi.waitFor(()=>expect(send).toHaveBeenCalledTimes(3));expect(ids[0]).toBe(ids[1]);expect(ids[1]).not.toBe(ids[2]);expect(open).toHaveBeenCalledOnce();queue.stop();
  });
  it('stops queued work after navigation',async()=>{
    let resolve!:(value:typeof run)=>void;
    const send=vi.fn(),queue=new UsageQueue(()=>new Promise(r=>{resolve=r;}),send,0);
    queue.record({type:'simulation_step',stepId:'shore'});queue.stop();resolve(run);
    await new Promise(r=>setTimeout(r,10));expect(send).not.toHaveBeenCalled();
  });
});

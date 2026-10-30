import {it,expect} from 'vitest';
import {CreativeColoringQueue} from '../src/shared/creative/usage/CreativeColoringQueue';
it('deduplicates meaningful tools and retains event IDs through failed delivery without blocking the drawing caller',async()=>{
 const batches:any[]=[];let attempts=0;
 const q=new CreativeColoringQueue(async events=>{batches.push(structuredClone(events));if(++attempts===1)throw Error('offline');});
 q.record('tool_used','brush','touch');q.record('tool_used','brush','touch');q.record('tool_used','brush','pen');q.record('complete');
 await q.flush();expect(q.pending).toBe(3);await q.flush();expect(q.pending).toBe(0);expect(batches[1].map((e:any)=>e.clientEventId)).toEqual(batches[0].map((e:any)=>e.clientEventId));
});

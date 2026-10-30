import type {ColoringEvent} from '@bluesteam/contracts';
export class CreativeColoringQueue{
 private events:ColoringEvent[]=[];private seen=new Set<string>();private busy=false;
 constructor(private send:(events:ColoringEvent[])=>Promise<unknown>){}
 get pending(){return this.events.length;}
 record(type:ColoringEvent['type'],tool?:ColoringEvent['tool'],input?:ColoringEvent['input']){const key=type==='tool_used'?`${type}:${tool}:${input}`:type;if(this.seen.has(key)||this.seen.size>=32)return;this.seen.add(key);this.events.push({clientEventId:crypto.randomUUID(),type,...(tool?{tool}:{}),...(input?{input}:{})});}
 async flush(){if(this.busy||!this.events.length)return;this.busy=true;const batch=[...this.events];let success=false;try{await this.send(batch);const ids=new Set(batch.map(e=>e.clientEventId));this.events=this.events.filter(e=>!ids.has(e.clientEventId));success=true;}catch{}finally{this.busy=false;if(success&&this.events.length)void this.flush();}}
}

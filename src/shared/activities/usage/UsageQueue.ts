import type { UsagePayload, UsageOpenResult, UsageInteractionInput } from '@bluesteam/contracts';
export class UsageQueue {
  private pending:UsageInteractionInput[]=[];
  private stopped=false;
  private running=false;
  constructor(private readonly open:()=>Promise<UsageOpenResult>,private readonly send:(run:UsageOpenResult,event:UsageInteractionInput)=>Promise<unknown>,private readonly retryDelay=250){}
  record(payload:UsagePayload){if(this.stopped || this.pending.length>=50)return;this.pending.push({clientEventId:crypto.randomUUID(),payload});void this.flush();}
  start(){void this.flush();}
  stop(){this.stopped=true;this.pending=[];}
  private async retry<T>(fn:()=>Promise<T>):Promise<T>{let last:unknown;for(let i=0;i<3&&!this.stopped;i++){try{return await fn();}catch(e){last=e;if((e as {status?:number})?.status && (e as {status:number}).status<500)break;await new Promise(resolve=>setTimeout(resolve,this.retryDelay*(i+1)));}}throw last;}
  private async flush(){
    if(this.running||this.stopped)return;this.running=true;
    try{const run=await this.retry(this.open);while(this.pending.length&&!this.stopped){const event=this.pending[0];try{await this.retry(()=>this.send(run,event));}catch{/* Missing telemetry never blocks play or invents an ACK. */}this.pending.shift();}}
    catch{this.pending=[];}finally{this.running=false;}
  }
}

export type CreativeSessionState='open'|'paused'|'ended';
export type CreativeSubmissionStatus='ready'|'released'|'needs_retry';
export type ScannedMotionPreset='swim'|'float'|'floor';
export interface CreativeSubmissionReceipt{id:string;status:CreativeSubmissionStatus}
export interface CreativeEventCursor{seq:number;event_type:'state'|'submission'|'updated'}

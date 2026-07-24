import { randomUUID } from 'node:crypto';
export type Outcome='success'|'tool_error'|'rejected'|'protocol_error'|'cancelled';
export type TelemetryEvent={request_id:string;tool_name?:string;outcome:Outcome;elapsed_ms:number;error_code?:string};
export function requestId(){return randomUUID()}
export function emitTelemetry(e:TelemetryEvent){const safe:TelemetryEvent={request_id:e.request_id,outcome:e.outcome,elapsed_ms:Math.max(0,Math.round(e.elapsed_ms))}; if(e.tool_name)safe.tool_name=e.tool_name; if(e.error_code)safe.error_code=e.error_code; console.log(JSON.stringify(safe));}
export async function telemetryToolName(req:Request){try{const j=await req.clone().json(); return typeof j?.params?.name==='string'?j.params.name:undefined}catch{return undefined}}

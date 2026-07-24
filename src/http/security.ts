import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { getAuthToken } from '../config';
export function noStore(init:ResponseInit={}){const h=new Headers(init.headers); h.set('Cache-Control','no-store'); return {...init,headers:h}}
export function genericResponse(status:number, requestId=randomUUID()){const h=new Headers({'Cache-Control':'no-store','X-Request-ID':requestId}); return new Response(status===401?'Unauthorized':status===403?'Forbidden':status===503?'Service unavailable':'Method not allowed',{status,headers:h})}
export function validateOrigin(req:Request){const origin=req.headers.get('origin'); return origin===null||origin===new URL(req.url).origin}
export function parseBearer(v:string|null){if(!v)return undefined; const parts=v.split(' '); return parts.length===2&&parts[0]==='Bearer'&&parts[1].length>0?parts[1]:undefined}
function digest(v:string){return createHash('sha256').update(v,'utf8').digest()}
export function timingSafeTokenEqual(a:string,b:string){const da=digest(a),db=digest(b); return da.length===db.length&&timingSafeEqual(da,db)}
export function authorize(req:Request, env:NodeJS.ProcessEnv=process.env){if(!validateOrigin(req))return {ok:false as const,status:403}; const expected=getAuthToken(env); if(!expected)return {ok:false as const,status:503}; const got=parseBearer(req.headers.get('authorization')); if(!got||!timingSafeTokenEqual(got,expected))return {ok:false as const,status:401}; return {ok:true as const}}

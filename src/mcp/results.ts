import { deterministicJson } from '../search/normalize';
import { toolError } from '../search/errors';
import type { ErrorCode } from '../search/types';
export function successResult<T extends object>(obj:T){return {structuredContent:obj,content:[{type:'text' as const,text:deterministicJson(obj)}]};}
export function errorResult(code:ErrorCode, providerCode?:unknown, retryAfterSeconds?:number){const obj=toolError(code,providerCode,retryAfterSeconds); return {...successResult(obj),isError:true};}

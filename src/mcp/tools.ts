/* v8 ignore file */
import { z } from 'zod';
import { searchInputSchema } from '../search/schemas';
import { SearchToolError } from '../search/errors';
import { tinyFishSearch } from '../search/tinyfish-client';
import { errorResult, successResult } from './results';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
const shape=(searchInputSchema as z.ZodObject<z.ZodRawShape>).shape;
export function registerSearchTools(server:McpServer){
 const make=(kind:'web'|'news')=>async(args:unknown, extra:{signal?:AbortSignal})=>{const parsed=searchInputSchema.safeParse(args); if(!parsed.success)return errorResult('INVALID_INPUT'); try{return successResult(await tinyFishSearch(kind,parsed.data,extra.signal));}catch(e){if(e instanceof SearchToolError)return errorResult(e.code,e.providerCode,e.retryAfterSeconds); return errorResult('UPSTREAM_UNAVAILABLE');}};
 server.registerTool('web_search',{title:'Web Search',description:'Search ordinary websites and discover relevant URLs.',inputSchema:shape},make('web'));
 server.registerTool('news_search',{title:'News Search',description:'Search time-sensitive news reporting; publisher and date may be present.',inputSchema:shape},make('news'));
}

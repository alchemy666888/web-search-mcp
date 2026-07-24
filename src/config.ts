export type RuntimeConfig={authToken:string;tinyfishApiKey:string};
const ok=(v:string|undefined)=>typeof v==='string'&&v.length>0;
export function getAuthToken(env:NodeJS.ProcessEnv=process.env){return ok(env.MCP_AUTH_TOKEN)?env.MCP_AUTH_TOKEN:undefined}
export function getTinyFishApiKey(env:NodeJS.ProcessEnv=process.env){return ok(env.TINYFISH_API_KEY)?env.TINYFISH_API_KEY:undefined}
export function getRuntimeConfig(env:NodeJS.ProcessEnv=process.env){const authToken=getAuthToken(env), tinyfishApiKey=getTinyFishApiKey(env); return authToken&&tinyfishApiKey?{authToken,tinyfishApiKey}:undefined}

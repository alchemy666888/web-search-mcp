#!/usr/bin/env node
const args=process.argv.slice(2);
if(args.includes('--help')||args.length===0){console.log('Usage: node scripts/smoke.mjs --url https://deployment.example --token REDACTED [--dry-run]'); process.exit(0)}
const url=args[args.indexOf('--url')+1], token=args[args.indexOf('--token')+1];
if(args.includes('--dry-run')){if(!url||!token) throw new Error('url and token are required'); console.log('dry-run ok (redacted)'); process.exit(0)}
if(!url||!token) throw new Error('url and token are required');
async function post(body,auth=true){return fetch(new URL('/mcp',url),{method:'POST',headers:{'content-type':'application/json',...(auth?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)})}
const unauth=await post({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'smoke',version:'0'}}},false); console.log(`unauth ${unauth.status}`);
const init=await post({jsonrpc:'2.0',id:2,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'smoke',version:'0'}}}); console.log(`initialize ${init.status}`);
const tools=await post({jsonrpc:'2.0',id:3,method:'tools/list'}); console.log(`tools ${tools.status}`);
for(const name of ['web_search','news_search']){const r=await post({jsonrpc:'2.0',id:name,method:'tools/call',params:{name,arguments:{query:'benign fixed smoke test'}}}); console.log(`${name} ${r.status}`)}

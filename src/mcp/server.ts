/* v8 ignore file */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import pkg from '../../package.json' with { type: 'json' };
import { registerSearchTools } from './tools';
export function createMcpServer(){const server=new McpServer({name:'web-search-mcp',version:pkg.version}); registerSearchTools(server); return server;}

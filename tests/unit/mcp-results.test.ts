import { it,expect } from 'vitest';
import { successResult,errorResult } from '../../src/mcp/results';
it('returns equivalent structured and text',()=>{const r=successResult({a:1}); expect(JSON.parse(r.content[0].text)).toEqual(r.structuredContent); const e=errorResult('INVALID_INPUT'); expect(e.isError).toBe(true); expect(JSON.parse(e.content[0].text)).toEqual(e.structuredContent);});

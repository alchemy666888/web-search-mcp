import { it,expect } from 'vitest';
import { execFileSync } from 'node:child_process';
it('smoke help and dry-run are redacted',()=>{expect(execFileSync('node',['scripts/smoke.mjs','--help'],{encoding:'utf8'})).toContain('Usage'); expect(execFileSync('node',['scripts/smoke.mjs','--url','https://example.test','--token','secret','--dry-run'],{encoding:'utf8'})).not.toContain('secret');});

import { defineConfig } from 'vitest/config';
export default defineConfig({test:{environment:'node',include:['tests/**/*.test.ts'],coverage:{provider:'v8',reporter:['text'],include:['src/search/schemas.ts','src/search/errors.ts','src/search/normalize.ts','src/http/security.ts'],thresholds:{statements:90,branches:90,functions:90,lines:90}}}});

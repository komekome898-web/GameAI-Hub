import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom', include: ['tests/**/*.test.ts?(x)'] }, resolve: { alias: { '@': new URL('./', import.meta.url).pathname, 'server-only':new URL('./tests/mocks/server-only.ts',import.meta.url).pathname } } });

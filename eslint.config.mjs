import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals, ...nextTs,
  // Reproducible research runners are deliberately Node CommonJS; keep their other lint rules.
  { files: ['docs/research/html-game-debug/**/*.cjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
  globalIgnores(['.next/**','out/**','next-env.d.ts'])]);

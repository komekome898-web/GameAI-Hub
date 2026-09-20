import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const skillRoot = join(repoRoot, '.agents/skills/playwright-interactive');
const upstreamCommit = '49f948faa9258a0c61caceaf225e179651397431';

describe('playwright-interactive repository integration', () => {
  it('vendors only the complete official skill bundle', () => {
    expect(readdirSync(skillRoot).sort()).toEqual([
      'LICENSE.txt',
      'NOTICE.txt',
      'SKILL.md',
      'agents',
      'assets',
    ]);
    expect(readdirSync(join(skillRoot, 'agents')).sort()).toEqual(['openai.yaml']);
    expect(readdirSync(join(skillRoot, 'assets')).sort()).toEqual([
      'playwright-small.svg',
      'playwright.png',
    ]);

    const skill = readFileSync(join(skillRoot, 'SKILL.md'), 'utf8');
    expect(skill).toContain('name: "playwright-interactive"');
    expect(skill).toContain('`js_repl` must be enabled for this skill.');
    expect(skill).toContain('--sandbox danger-full-access');
    expect(skill).toContain('npm install playwright');
  });

  it('keeps mobile acceptance deterministic and honest about evidence', () => {
    const guide = readFileSync(
      join(repoRoot, 'docs/agent-guides/UI_ACCEPTANCE.md'),
      'utf8',
    );

    for (const requiredText of [
      upstreamCommit,
      '.agents/skills/playwright-interactive/',
      '--enable js_repl',
      '--sandbox danger-full-access',
      'npx playwright install --with-deps chromium',
      'BLOCKED BEFORE PLAYWRIGHT CAPTURE',
      '{ width: 375, height: 812 }',
      '{ width: 320, height: 700 }',
      'scrollWidth > clientWidth',
      'score `0`, then `1`, then `2`, resets to `0`',
      'screenshots as the primary fit evidence',
      'OS-specific Safari/Chrome behavior',
    ]) {
      expect(guide).toContain(requiredText);
    }
  });
});

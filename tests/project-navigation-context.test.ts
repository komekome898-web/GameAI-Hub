import { afterEach, describe, expect, it, vi } from 'vitest';
import { beginnerBrowserToolDecision, clearProjectNavigationContext, readProjectNavigationContext, saveProjectNavigationContext } from '@/lib/project/navigation-context';
import type { ProjectBrief } from '@/lib/project/types';
import { getServices } from '@/lib/services';

const brief: ProjectBrief = { idea: 'PRIVATE GAME IDEA', genre: 'action', dimension: '2d', platform: 'web', engine: 'unknown', budget: 'free', experience: 'beginner', team: 'solo', commercialIntent: 'personal', capabilities: ['coding'], locale: 'ja', details: [{ id: 'detail-private', kind: 'constraint', text: 'PRIVATE GAME DETAIL', provenance: 'confirmed' }] };
const route = `/project?draft=${'a'.repeat(32)}`;

afterEach(() => { vi.restoreAllMocks(); window.sessionStorage.clear(); });

describe('local project navigation context', () => {
  it('retains the draft return route and structured conditions without free text', () => {
    expect(saveProjectNavigationContext(brief, route)).toBe(true);
    const context = readProjectNavigationContext();
    expect(context?.returnUrl).toBe(route);
    expect(context?.brief.platform).toBe('web');
    expect(context?.brief.experience).toBe('beginner');
    expect(JSON.stringify(context)).not.toContain('PRIVATE');
    expect(window.sessionStorage.getItem('gameai:project-navigation:v1')).not.toContain('PRIVATE');
    clearProjectNavigationContext();
    expect(readProjectNavigationContext()).toBeNull();
  });

  it.each(['https://evil.example/project', '//evil.example/project', '/project/../tools', '/project?idea=PRIVATE', '/project?draft=invalid', '/project?draft=aaa#ignored', '/project?redirect=https://evil.example'])('rejects unsafe or malformed return routes: %s', url => {
    expect(saveProjectNavigationContext(brief, url)).toBe(false);
    expect(readProjectNavigationContext()).toBeNull();
  });

  it('sanitizes shared state before retaining it in the return URL', () => {
    const maliciousShared = `/project?${new URLSearchParams({ v: '1', p: JSON.stringify(brief) })}`;
    expect(saveProjectNavigationContext(brief, maliciousShared)).toBe(true);
    const context = readProjectNavigationContext();
    expect(decodeURIComponent(context!.returnUrl)).not.toContain('PRIVATE');
    expect(JSON.parse(new URL(context!.returnUrl, 'https://local.example').searchParams.get('p')!)).not.toHaveProperty('idea');
  });

  it('fails closed on corrupt session state and unavailable storage', () => {
    window.sessionStorage.setItem('gameai:project-navigation:v1', '{bad');
    expect(readProjectNavigationContext()).toBeNull();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    expect(saveProjectNavigationContext(brief, route)).toBe(false);
  });

  it('uses confirmed coding and platform data, keeping unsupported cases unknown', () => {
    const services = getServices();
    const copilot = services.find(service => service.slug === 'github-copilot')!;
    const cursor = services.find(service => service.slug === 'cursor')!;
    expect(beginnerBrowserToolDecision(copilot).status).toBe('browser');
    expect(beginnerBrowserToolDecision(cursor).status).toBe('desktop');
    expect(beginnerBrowserToolDecision({ ...copilot, verificationStatus: 'unknown' }).status).toBe('unknown');
    expect(beginnerBrowserToolDecision({ ...copilot, platforms: [] }).status).toBe('unknown');
    expect(beginnerBrowserToolDecision(services.find(service => service.slug === 'meshy')!).status).toBe('other');
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolsExplorer } from '@/components/ToolsExplorer';
import { getServices } from '@/lib/services';
import { saveProjectNavigationContext } from '@/lib/project/navigation-context';
import { ProjectBriefSchema } from '@/lib/project/types';

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => '/tools',
  useRouter: () => ({ push: navigation.push }),
}));

afterEach(() => {
  cleanup();
  navigation.params = new URLSearchParams();
  navigation.push.mockReset();
  vi.useRealTimers();
  window.sessionStorage.clear();
});

describe('Tools Explorer', () => {
  it('keeps the local project return target and carries code goal into comparison', () => {
    const route = `/project?draft=${'b'.repeat(32)}`;
    saveProjectNavigationContext(ProjectBriefSchema.parse({ idea: 'Private pitch', genre: 'action', dimension: '2d', platform: 'web', engine: 'unknown', budget: 'unknown', experience: 'beginner', team: 'unknown', commercialIntent: 'unknown', capabilities: ['coding'], locale: 'unknown' }), route);
    navigation.params = new URLSearchParams('goal=code&q=Copilot');
    render(<ToolsExplorer services={getServices()} />);
    expect(screen.getByRole('link', { name: '制作中のゲームに戻る →' }).getAttribute('href')).toBe(`${route}#beginner-action-title`);
    expect(screen.getByRole('link', { name: '比較する' }).getAttribute('href')).toBe('/compare?ids=github-copilot&goal=code&stage=code');
    expect(screen.getByText(/公式確認済みの掲載情報にブラウザ利用とコード支援/)).toBeTruthy();
  });

  it('writes the search URL immediately so no delayed update can overwrite a detail click', () => {
    vi.useFakeTimers();
    const replaceState = vi.spyOn(window.history, 'replaceState');
    render(<ToolsExplorer services={getServices()} />);

    fireEvent.change(screen.getByLabelText('ツールを検索'), { target: { value: 'ElevenLabs' } });

    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenLastCalledWith(null, '', '/tools?q=ElevenLabs');
    vi.advanceTimersByTime(500);
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'ElevenLabs' }).getAttribute('href')).toBe('/tools/elevenlabs');
  });
});

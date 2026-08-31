import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolsExplorer } from '@/components/ToolsExplorer';
import { getServices } from '@/lib/services';

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
});

describe('Tools Explorer', () => {
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

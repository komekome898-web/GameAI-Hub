import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CompareClient } from '@/components/CompareClient';
import { getServices } from '@/lib/services';
import { saveProjectNavigationContext } from '@/lib/project/navigation-context';
import { ProjectBriefSchema } from '@/lib/project/types';

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => navigation.params,
  usePathname: () => '/compare',
  useRouter: () => ({ push: navigation.push }),
}));

afterEach(() => {
  cleanup();
  navigation.params = new URLSearchParams();
  navigation.push.mockReset();
  window.sessionStorage.clear();
});

describe('compare', () => {
  it('explains beginner browser versus desktop setup and returns to the same draft', () => {
    const route = `/project?draft=${'c'.repeat(32)}`;
    saveProjectNavigationContext(ProjectBriefSchema.parse({ idea: 'Private pitch', genre: 'action', dimension: '2d', platform: 'web', engine: 'unknown', budget: 'unknown', experience: 'beginner', team: 'unknown', commercialIntent: 'unknown', capabilities: ['coding'], locale: 'unknown' }), route);
    navigation.params = new URLSearchParams('ids=github-copilot,cursor&goal=code&stage=code');
    render(<CompareClient services={getServices()} />);
    expect(screen.getByRole('heading', { name: '今回の選び方：ブラウザでAIへ依頼する' })).toBeTruthy();
    expect(screen.getByText(/掲載情報はパソコンに入れる開発ツールです/)).toBeTruthy();
    expect(screen.getByRole('link', { name: '制作中のゲームに戻る →' }).getAttribute('href')).toBe(`${route}#beginner-action-title`);
    expect(screen.getByLabelText('主要な差分').textContent).not.toContain('契約前に公式料金ページ');
    fireEvent.click(screen.getByLabelText('差分のみ表示'));
    expect(navigation.push).toHaveBeenCalledWith('/compare?ids=github-copilot%2Ccursor&goal=code&stage=code&diff=1', { scroll: false });
  });

  it('starts direct /compare without silently preselecting products', () => {
    render(<CompareClient services={getServices()} />);
    expect(screen.getByText('0 / 4')).toBeTruthy();
    expect(screen.getByText(/あと2件選ぶと違いを比較できます/)).toBeTruthy();
    expect(screen.queryByText('先に見る主要差分')).toBeNull();
  });

  it('renders selected candidates, leading differences, and decision fields', () => {
    render(
      <CompareClient
        services={getServices()}
        initial={['github-copilot', 'cursor']}
      />,
    );
    expect(screen.getByText('先に見る主要差分')).toBeTruthy();
    expect(
      screen.getByLabelText('主要な差分').querySelectorAll('li'),
    ).toHaveLength(3);
    expect(
      screen
        .getAllByRole('link', { name: 'GitHub Copilot' })[0]
        .getAttribute('href'),
    ).toBe('/tools/github-copilot');
    for (const field of [
      '料金',
      '無料枠',
      '商用利用',
      'API',
      'ゲームエンジン',
      'サービス利用環境',
      '主用途',
      '長所',
      '制約・弱点',
      '最終確認日',
    ]) {
      expect(screen.getAllByText(field).length).toBeGreaterThan(0);
    }
  });

  it('enforces four selections and persistently explains the limit', () => {
    render(
      <CompareClient
        services={getServices()}
        initial={getServices()
          .slice(0, 4)
          .map((s) => s.slug)}
      />,
    );
    expect(screen.getByText(/上限に達しました/)).toBeTruthy();
    const disabled = screen
      .getAllByRole('checkbox')
      .filter((node) => (node as HTMLInputElement).disabled);
    expect(disabled.length).toBeGreaterThan(0);
    expect(disabled[0].closest('label')?.title).toBe('最大4件まで比較できます');
  });

  it('can remove and clear selections', () => {
    navigation.params = new URLSearchParams('ids=github-copilot,cursor');
    render(<CompareClient services={getServices()} />);
    fireEvent.click(screen.getByRole('button', { name: 'すべて解除' }));
    expect(screen.getByText('0 / 4')).toBeTruthy();
    expect(screen.getByText(/あと2件/)).toBeTruthy();
    expect(navigation.push).toHaveBeenCalledWith('/compare', {
      scroll: false,
    });
  });

  it('keeps picker search and focus while selection updates the URL', () => {
    navigation.params = new URLSearchParams('ids=github-copilot,cursor');
    const { rerender } = render(<CompareClient services={getServices()} />);
    const search = screen.getByRole('searchbox', { name: '候補を検索' });
    fireEvent.change(search, { target: { value: 'Meshy' } });
    const checkbox = screen.getByRole('checkbox', { name: 'Meshy' });
    checkbox.focus();
    fireEvent.click(checkbox);
    expect(navigation.push).toHaveBeenCalledWith(
      '/compare?ids=github-copilot%2Ccursor%2Cmeshy',
      { scroll: false },
    );
    navigation.params = new URLSearchParams('ids=github-copilot,cursor,meshy');
    rerender(<CompareClient services={getServices()} />);
    expect(
      (
        screen.getByRole('searchbox', {
          name: '候補を検索',
        }) as HTMLInputElement
      ).value,
    ).toBe('Meshy');
    expect(document.activeElement).toBe(checkbox);
  });

  it('syncs selections and difference mode on browser back and forward', async () => {
    navigation.params = new URLSearchParams('ids=github-copilot,cursor&diff=1');
    const { rerender } = render(<CompareClient services={getServices()} />);
    expect(
      (screen.getByLabelText('差分のみ表示') as HTMLInputElement).checked,
    ).toBe(true);
    navigation.params = new URLSearchParams('ids=meshy,scenario');
    rerender(<CompareClient services={getServices()} />);
    await waitFor(() => {
      expect(
        screen.getAllByRole('link', { name: 'Meshy' }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.queryAllByRole('link', { name: 'GitHub Copilot' }),
      ).toHaveLength(0);
      expect(
        (screen.getByLabelText('差分のみ表示') as HTMLInputElement).checked,
      ).toBe(false);
    });
  });

  it('offers a differences-only mobile-friendly view', () => {
    render(
      <CompareClient
        services={getServices()}
        initial={['github-copilot', 'cursor']}
      />,
    );
    expect(screen.getByText(/項目に差分/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('差分のみ表示'));
    expect(screen.queryAllByText('最終確認日')).toHaveLength(0);
    expect(screen.getAllByText('差分').length).toBeGreaterThan(0);
  });

  it('places detail and official evidence links beside strengths', () => {
    render(
      <CompareClient
        services={getServices()}
        initial={['github-copilot', 'cursor']}
      />,
    );
    const strengths = screen
      .getAllByRole('rowheader', { name: /長所/ })[0]
      .closest('tr');
    expect(strengths?.querySelectorAll('a[href^="/tools/"]')).toHaveLength(2);
    expect(strengths?.querySelectorAll('a[target="_blank"]')).toHaveLength(2);
  });

  it('links unknown and conditional facts to direct official verification sources', () => {
    render(
      <CompareClient services={getServices()} initial={['github-copilot']} />,
    );
    expect(
      screen.getAllByText('生成時プランの商用利用条件・権利範囲').length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText('API提供有無・対象プラン・利用上限').length,
    ).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole('link', { name: '公式料金 ↗' })
        .every((link) => (link as HTMLAnchorElement).href.startsWith('http')),
    ).toBe(true);
    expect(
      screen.getAllByRole('link', { name: '公式規約 ↗' }).length,
    ).toBeGreaterThan(0);
  });

  it('exposes semantic desktop and paired mobile comparison structures', () => {
    render(
      <CompareClient
        services={getServices()}
        initial={['github-copilot', 'cursor']}
      />,
    );
    expect(
      screen.getByRole('table', { name: /差分のある項目を先/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole('region', { name: '選択したツールの比較結果' }),
    ).toBeTruthy();
    expect(screen.getAllByRole('columnheader').length).toBe(3);
    expect(screen.getAllByRole('rowheader').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', {
        name: 'GitHub Copilotの公式確認と次の行動',
      }),
    ).toBeTruthy();
  });
});

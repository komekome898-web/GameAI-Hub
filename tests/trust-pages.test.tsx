import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MethodologyPage from '@/app/methodology/page';
import AffiliateDisclosurePage from '@/app/affiliate-disclosure/page';

afterEach(cleanup);
describe('trust pages', () => {
  it('distinguishes document verification, hands-on testing, unknowns and legal limits', () => {
    render(<MethodologyPage />);
    const text = document.body.textContent ?? '';
    expect(text).toContain('実制作での操作・性能評価を意味しません');
    expect(text).toContain('不明');
    expect(text).toContain('法的助言や保証ではありません');
    expect(text).toContain('報酬率は、掲載順、推薦結果、比較の結論、視覚的な優先度へ入力しません');
    expect(screen.getByRole('navigation', { name: '調査・評価方法の目次' })).toBeTruthy();
  });
  it('documents the exact protected affiliate link and neutrality contracts', () => {
    render(<AffiliateDisclosurePage />);
    const text = document.body.textContent ?? '';
    expect(text).toContain('rel="sponsored nofollow noopener"');
    expect(text).toContain('登録済みの場合はアフィリエイトURL、未登録の場合は公式URL');
    expect(text).toContain('視覚的な目立ち方を変更しません');
  });
});

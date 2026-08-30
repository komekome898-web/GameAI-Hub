import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PrivacyPage from '@/app/privacy/page';

describe('privacy disclosure', () => {
  it('states the browser storage scope, opaque id, deletion, and retention behavior', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { name: 'Project Generatorのブラウザ保存' })).toBeTruthy();
    const text=document.body.textContent ?? '';
    expect(text).toContain('同一端末');
    expect(text).toContain('不透明なdraft id');
    expect(text).toContain('最終保存から30日');
    expect(text).toContain('最大10件');
    expect(text).toContain('Questの完了状態には自動削除期限を設けていません');
    expect(text).toContain('この端末の非公開データをすべて削除');
    expect(text).toContain('最終更新: 2026-08-30');
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryState } from '@/components/DirectoryState';

describe('DirectoryState', () => {
  it('announces a loading state without exposing an unavailable action', () => {
    render(<DirectoryState kind="loading" title="ツールを読み込んでいます" message="候補を準備中です。" />);
    expect(screen.getByRole('status').textContent).toContain('ツールを読み込んでいます');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('announces an error and provides retry and Project recovery', () => {
    const retry = vi.fn();
    render(<DirectoryState kind="error" title="読み込めませんでした" message="URLの条件は残っています。" retry={retry} />);
    expect(screen.getByRole('alert').textContent).toContain('URLの条件は残っています。');
    fireEvent.click(screen.getByRole('button', { name: 'もう一度読み込む' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: '自分のProjectに戻る' }).getAttribute('href')).toBe('/project');
  });
});

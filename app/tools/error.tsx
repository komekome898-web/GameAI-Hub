'use client';

import { DirectoryState } from '@/components/DirectoryState';

export default function ToolsError({ reset }: { reset: () => void }) {
  return <DirectoryState kind="error" title="ツール情報を読み込めませんでした" message="入力した条件はURLに残っています。再読み込しても解決しない場合はProjectに戻れます。" retry={reset} />;
}

'use client';

import { DirectoryState } from '@/components/DirectoryState';

export default function GuidesError({ reset }: { reset: () => void }) {
  return <DirectoryState kind="error" title="ガイドを読み込めませんでした" message="選んだ制作段階はURLに残っています。再読み込しても解決しない場合はProjectに戻れます。" retry={reset} />;
}

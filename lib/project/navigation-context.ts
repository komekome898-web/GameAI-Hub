import { useMemo, useSyncExternalStore } from 'react';
import type { Service } from '@/lib/schema';
import { ProjectBriefSchema, type ProjectBrief } from './types';
import { decodeProjectState, encodeProjectState } from './share';

const storageKey = 'gameai:project-navigation:v1';
const changeEvent = 'gameai:project-navigation-change';
const briefSchema = ProjectBriefSchema.omit({ idea: true, details: true });
export type ProjectNavigationContext = {
  brief: Omit<ProjectBrief, 'idea' | 'details'>;
  returnUrl: string;
};

export const stageForToolGoal: Record<string, string> = {
  code: 'code', ui: 'code', character: 'visuals', '2d': 'visuals', '3d': '3d',
  animation: 'animation', voice: 'voice', music: 'music-sfx', sfx: 'music-sfx',
  npc: 'npc-dialogue', localization: 'localization', test: 'testing',
  trailer: 'publishing', store: 'publishing',
};

function safeReturnUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 22000 || !/^\/project\/?(?:\?|$)/.test(value)) return null;
  try {
    const url = new URL(value, 'https://project.invalid');
    if (url.origin !== 'https://project.invalid' || !['/project', '/project/'].includes(url.pathname) || url.hash) return null;
    if ([...url.searchParams.keys()].some(key => !['draft', 'v', 'p'].includes(key))) return null;
    const params = new URLSearchParams();
    const draft = url.searchParams.get('draft');
    if (draft !== null) {
      if (!/^[a-f0-9]{32}$/.test(draft)) return null;
      params.set('draft', draft);
    }
    if (url.searchParams.has('v') || url.searchParams.has('p')) {
      const shared = decodeProjectState(url.searchParams);
      if (!shared) return null;
      // Re-encode so manually supplied private text cannot survive in a URL.
      new URLSearchParams(encodeProjectState(shared)).forEach((item, key) => params.set(key, item));
    }
    return `/project${params.size ? `?${params}` : ''}`;
  } catch { return null; }
}

function parseContext(raw: string | null): ProjectNavigationContext | null {
  if (!raw || raw.length > 24000) return null;
  try {
    const value = JSON.parse(raw);
    const brief = briefSchema.safeParse(value?.brief);
    const returnUrl = safeReturnUrl(value?.returnUrl);
    return value?.version === 1 && brief.success && returnUrl ? { brief: brief.data, returnUrl } : null;
  } catch { return null; }
}

function snapshot(): string | null {
  try { return typeof window === 'undefined' ? null : window.sessionStorage.getItem(storageKey); }
  catch { return null; }
}

export function readProjectNavigationContext(): ProjectNavigationContext | null {
  return parseContext(snapshot());
}

export function saveProjectNavigationContext(brief: ProjectBrief, returnUrl: string): boolean {
  const safe = briefSchema.safeParse(brief);
  const route = safeReturnUrl(returnUrl);
  if (!safe.success || !route || typeof window === 'undefined') return false;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, brief: safe.data, returnUrl: route }));
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch { return false; }
}

export function clearProjectNavigationContext(): void {
  try {
    window.sessionStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(changeEvent));
  } catch { /* Navigation still works when browser storage is unavailable. */ }
}

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useProjectNavigationContext(): ProjectNavigationContext | null {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => parseContext(raw), [raw]);
}

export function beginnerBrowserToolDecision(service: Service): { status: 'browser' | 'desktop' | 'unknown' | 'other'; reason: string } {
  if (!service.capabilities.some(item => item.id === 'coding')) return { status: 'other', reason: 'コード制作の候補ではありません。必要な素材を作る工程で確認してください。' };
  if (service.verificationStatus !== 'verified' || !service.capabilities.some(item => item.id === 'coding' && item.status === 'verified')) return { status: 'unknown', reason: 'コード制作や利用環境の公式確認が揃っていません。最初に使う候補として決める前に公式情報を確認してください。' };
  if (service.platforms.includes('Web')) return { status: 'browser', reason: '公式確認済みの掲載情報にブラウザ利用とコード支援があります。最初の1ファイルをAIへ依頼する作業の候補です。ログイン・利用枠は公式案内で確認してください。' };
  if (service.platforms.some(platform => ['Windows', 'macOS', 'Linux'].includes(platform))) return { status: 'desktop', reason: '掲載情報はパソコンに入れる開発ツールです。ブラウザ上のチャットから始める今回の手順とは異なり、導入とファイルを開く準備が必要です。' };
  return { status: 'unknown', reason: 'ブラウザでコード制作できるか掲載情報では確認できません。公式の開始方法を確認してください。' };
}

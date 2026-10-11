import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { gameIntroDrafts } from '@/data/game-intro-drafts';
import { games, getPublishedGames } from '@/data/games';
import { validateGames } from '@/lib/game-validation';
import sitemap from '@/app/sitemap';

describe('seven author introductions', () => {
  it('keeps all seven drafts out of published routes and sitemap', () => {
    expect(gameIntroDrafts).toHaveLength(7);
    expect(games).toHaveLength(8);
    expect(getPublishedGames().map(g => g.slug)).toEqual(['aramon']);
    expect(validateGames(games)).toEqual([]);
    for (const g of gameIntroDrafts) {
      expect(g.publicationStatus).toBe('draft');
      expect(g.publicationReview.approved).toBe(false);
      expect(g.publicationReview.imageChecked).toBe(false);
      expect(g.publicationReview.permissionConfirmed).toBe(true);
      expect(sitemap().some(s => s.url.endsWith(`/games/${g.slug}/`))).toBe(false);
      expect(existsSync(`docs/drafts/seven-game-intros/${g.slug}.md`)).toBe(true);
    }
  });
  it('retains editorial corrections and evidence boundaries', () => {
    const bySlug = (slug: string) => gameIntroDrafts.find(g => g.slug === slug)!;
    expect(bySlug('monster-construction').highlights[2]).toContain('デッキ構成');
    expect(bySlug('sumaraku').about).toContain('ランダム');
    expect(bySlug('sumaraku').about).not.toContain('描いた姿から決まる');
    expect(bySlug('aura-connect-battle').pricingAndRegistration).toContain('現金による課金の有無：未確認');
    expect(bySlug('create-monsters').pricingAndRegistration).toContain('クラウド復旧用の登録は任意');
    expect(bySlug('create-monsters').howToPlay[0]).toContain('戦闘は未確認');
    for (const game of gameIntroDrafts) {
      expect(game.about).toContain('作者');
      expect(game.verifiedDevices.join(' ')).toContain('実機');
    }
  });
  it('retains seven asset identities without inventing successful assets', () => {
    const assets = JSON.parse(readFileSync('docs/drafts/seven-game-intros/image-sources.json', 'utf8'));
    expect(new Set(assets.map((a: {library_file_id: string}) => a.library_file_id)).size).toBe(7);
    expect(assets.every((a: {status: string}) => a.status.startsWith('BLOCKED'))).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { gameIntroductions } from '@/data/game-introductions';
import { games, getPublishedGames } from '@/data/games';
import { validateGames } from '@/lib/game-validation';
import sitemap from '@/app/sitemap';

describe('seven approved author introductions', () => {
  it('includes seven verified introductions in existing published selectors and sitemap', () => {
    expect(gameIntroductions).toHaveLength(7);
    expect(games).toHaveLength(8);
    expect(getPublishedGames()).toHaveLength(8);
    expect(validateGames(games)).toEqual([]);
    for (const game of gameIntroductions) {
      expect(game.publicationReview).toEqual({urlChecked:true,imageChecked:true,permissionConfirmed:true,approved:true});
      expect(sitemap().some(s => s.url.endsWith(`/games/${game.slug}/`))).toBe(true);
      expect(game.sourceNote).toContain('作者提供');
      expect(game.sourceNote).toContain('実機');
    }
  });
  it('retains corrected mechanics, payment uncertainty and the supplied initial UI facts', () => {
    const bySlug = (slug: string) => gameIntroductions.find(g => g.slug === slug)!;
    expect(bySlug('monster-construction').highlights[2]).toContain('デッキ構成');
    expect(bySlug('sumaraku').about).toContain('ランダム');
    expect(bySlug('sumaraku').about).not.toContain('描いた姿から決まる');
    expect(bySlug('aura-connect-battle').pricingAndRegistration).toContain('現金による課金の有無：未確認');
    expect(bySlug('aura-connect-battle').humanContribution).toBe('');
    expect(bySlug('create-monsters').pricingAndRegistration).toContain('クラウド復旧用の登録は任意');
    expect(bySlug('create-monsters').howToPlay.join(' ')).toContain('遊び方');
    expect(bySlug('create-monsters').howToPlay.join(' ')).toContain('冒険');
  });
  it('retains independently verified original bytes and seven Library identities', () => {
    const assets = JSON.parse(readFileSync('docs/drafts/seven-game-intros/image-sources.json', 'utf8'));
    expect(new Set(assets.map((a: {library_file_id: string}) => a.library_file_id)).size).toBe(7);
    const checks = JSON.parse(readFileSync('docs/drafts/seven-game-intros/asset-verification.json','utf8'));
    expect(checks).toHaveLength(7);
    for (const game of gameIntroductions) {
      const image = readFileSync(`public${game.image.src}`);
      expect(image.length).toBe(checks.find((c: {repo_path: string}) => c.repo_path === `public${game.image.src}`).size_bytes);
    }
  });
});

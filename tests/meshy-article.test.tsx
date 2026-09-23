import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MeshyGameDevelopmentGuide from "@/app/articles/meshy-game-development-guide/page";
import { getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

describe("Meshy game-development guide", () => {
  it("publishes a sourced path from one asset to imported verification", () => {
    const article = getArticle("meshy-game-development-guide")!;
    const html = renderToStaticMarkup(<MeshyGameDevelopmentGuide />);
    expect(article.publicationStatus).toBe("published");
    expect(article.sources).toHaveLength(8);
    expect(article.promotions).toEqual([expect.objectContaining({ serviceSlug: "meshy", placement: "production_tools" })]);
    for (const text of ["Text to 3DとImage to 3D", "Blenderへ持っていく", "Unityへ持っていく", "ゲームで「使える」か判定", "失敗した場所から1工程だけ戻る"]) expect(html).toContain(text);
  });

  it("uses exactly two registry-driven, disclosed affiliate opportunities", () => {
    const html = renderToStaticMarkup(<MeshyGameDevelopmentGuide />);
    const url = getService("meshy")!.affiliateUrl!;
    expect((html.match(new RegExp(`href="${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g")) ?? [])).toHaveLength(2);
    expect((html.match(/rel="sponsored nofollow noopener"/g) ?? [])).toHaveLength(2);
    expect(html).toContain("meshy_game_guide_first_asset");
    expect(html).toContain("meshy_game_guide_export_check");
    expect(html).toContain("この記事にはプロモーションを含みます。");
  });

  it("keeps internal and Project continuation links valid and contextual", () => {
    const html = renderToStaticMarkup(<MeshyGameDevelopmentGuide />);
    expect(html).toContain('href="/tools/meshy/"');
    expect(html).toContain('href="/project?source=meshy-game-development-guide"');
    expect(html).toContain("取り込んだ3Dアセットの次のtaskを決める");
  });
});

import MeshyCommercialUseGame from "@/app/articles/meshy-commercial-use-game/page";

describe("Meshy commercial-use guide", () => {
  it("publishes a primary-sourced Free/Paid decision path", () => {
    const article = getArticle("meshy-commercial-use-game")!;
    const html = renderToStaticMarkup(<MeshyCommercialUseGame />);
    expect(article.publicationStatus).toBe("published");
    expect(article.sources).toHaveLength(9);
    expect(article.sources.every(source => source.kind === "primary")).toBe(true);
    expect(article.sources.map(source => source.url)).toEqual([
      "https://help.meshy.ai/en/articles/9992001-can-i-use-meshy-assets-commercially-license-copyright-explained",
      "https://help.meshy.ai/en/articles/15696428-what-is-included-on-the-free-plan",
      "https://help.meshy.ai/en/articles/10137554-what-is-the-ownership-of-the-generated-models",
      "https://help.meshy.ai/en/articles/9992023-if-i-cancel-my-subscription-will-all-my-models-revert-to-a-cc-by-4-0-license",
      "https://help.meshy.ai/en/articles/16103168-copyright-checklist-for-meshy-reference-images-and-assets",
      "https://help.meshy.ai/en/articles/16102951-can-you-publish-or-sell-meshy-models-on-marketplaces",
      "https://help.meshy.ai/en/articles/9992022-can-i-sell-meshy-models-marketplaces-stores-licensing",
      "https://www.meshy.ai/terms-of-use",
      "https://creativecommons.org/licenses/by/4.0/",
    ]);
    expect(article.promotions).toEqual([expect.objectContaining({ serviceSlug: "meshy", placement: "production_tools" })]);
    for (const text of ["Freeプランで生成", "Paidプランで非公開生成", "CC BY 4.0", "生成時のプラン", "downgrade", "アップロード画像・参照画像", "Marketplace・素材再販売"]) expect(html).toContain(text);
  });

  it("exposes the marketplace-source conflict rather than flattening it", () => {
    const html = renderToStaticMarkup(<MeshyCommercialUseGame />);
    expect(html).toContain("公式情報に現在残る不一致");
    expect(html).toContain("personal / non-commercial use");
    expect(html).toContain("raw assetを出品する前");
  });

  it("uses exactly one late registry-driven, disclosed affiliate CTA", () => {
    const html = renderToStaticMarkup(<MeshyCommercialUseGame />);
    const url = getService("meshy")!.affiliateUrl!;
    expect((html.match(new RegExp(`href="${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g")) ?? [])).toHaveLength(1);
    expect((html.match(/rel="sponsored nofollow noopener"/g) ?? [])).toHaveLength(1);
    expect(html).toContain("meshy_commercial_terms_check");
    expect(html).toContain("この記事にはプロモーションを含みます。");
    expect(html.indexOf("公開前チェックリスト")).toBeLessThan(html.indexOf("meshy_commercial_terms_check"));
  });

  it("links to the practical guide and registered tool route", () => {
    const html = renderToStaticMarkup(<MeshyCommercialUseGame />);
    expect(html).toContain('href="/articles/meshy-game-development-guide/"');
    expect(html).toContain('href="/tools/meshy/"');
  });
});

import MeshyPricingCreditsGame from "@/app/articles/meshy-pricing-credits-game/page";

describe("Meshy pricing and credit article", () => {
  it("publishes a sourced game-production pricing decision guide", () => {
    const article = getArticle("meshy-pricing-credits-game")!;
    expect(article.publicationStatus).toBe("published");
    expect(article.lastVerifiedAt).toBe("2026-09-22");
    expect(article.sources.length).toBeGreaterThanOrEqual(10);
    expect(article.title).toContain("料金");
    expect(article.description).not.toBe(getArticle("meshy-commercial-use-game")!.description);
  });

  it("renders transparent arithmetic, conflicts, sibling paths, and one registry CTA", () => {
    const html = renderToStaticMarkup(<MeshyPricingCreditsGame />);
    expect(html).toContain("monthly credits");
    expect(html).toContain("permanent credits");
    expect(html).toContain("5 × (25 + 10) = 175");
    expect(html).toContain("小物10 + creature 2");
    expect(html).toContain("8,000");
    expect(html).toContain("10,000");
    expect(html).toContain('href="/articles/meshy-commercial-use-game/"');
    expect(html).toContain('href="/articles/meshy-game-development-guide/"');
    expect(html).toContain("meshy_pricing_plan_check");
    expect(html.match(/href="https:\/\/www\.meshy\.ai\?via=gameaihub"/g)).toHaveLength(1);
    const destination = getService("meshy")!.affiliateUrl!;
    expect(html).toContain(`href="${destination.replaceAll("&", "&amp;")}"`);
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).toContain('target="_blank"');
  });
});

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

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

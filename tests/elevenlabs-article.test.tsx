import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ElevenLabsGameDevelopmentGuide from "@/app/articles/elevenlabs-game-development-guide/page";
import { getArticle } from "@/data/articles";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("ElevenLabs game-development article", () => {
  it("publishes a sourced, intent-preserving path from sample lines to in-game verification", () => {
    const article = getArticle("elevenlabs-game-development-guide")!;
    const html = renderToStaticMarkup(<ElevenLabsGameDevelopmentGuide />);

    expect(article.publicationStatus).toBe("published");
    expect(article.sources).toHaveLength(6);
    expect(article.promotions).toEqual([
      expect.objectContaining({ serviceSlug: "elevenlabs", placement: "production_tools" }),
    ]);
    for (const text of [
      "固定音声ファイル",
      "代表セリフを1〜3本だけ決める",
      "ゲーム用音声の合格基準",
      "APIはいつ使えばいい？",
      "音声が不要ならElevenLabsを使う必要はありません",
    ]) expect(html).toContain(text);
    expect(html).toContain("Project Generatorで音声制作taskを整理する");
    expect(html).toContain("https://try.elevenlabs.io/jlxoxtxe9768");
    expect(html).toContain('rel="sponsored nofollow noopener"');
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ElevenLabsGameDevelopmentGuide from "@/app/articles/elevenlabs-game-development-guide/page";
import ElevenLabsCommercialUseGame from "@/app/articles/elevenlabs-commercial-use-game/page";
import { getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

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

describe("ElevenLabs commercial-use article", () => {
  it("publishes the sourced commercial-use decision guide through the article registry", () => {
    const article = getArticle("elevenlabs-commercial-use-game")!;

    expect(article).toBeDefined();
    expect(article.publicationStatus).toBe("published");
    expect(article.sources.length).toBeGreaterThanOrEqual(6);
    expect(article.promotions).toEqual([
      expect.objectContaining({ serviceSlug: "elevenlabs", placement: "production_tools" }),
    ]);
  });

  it("renders the rights checks, reciprocal link, schema, affiliate and Project handoff", () => {
    const html = renderToStaticMarkup(<ElevenLabsCommercialUseGame />);

    for (const text of [
      "ElevenLabsの商用利用ガイド｜ゲーム音声で確認すべき権利とプラン",
      "Free Userは非商用利用のみ",
      "入力する文章や声に必要な権利",
      "Instant Voice Cloning",
      "Professional Voice Cloning",
      "Case E：声優の声をclone",
    ]) expect(html).toContain(text);

    expect((html.match(/class="button"[^>]+href="https:\/\/try\.elevenlabs\.io/g) ?? [])).toHaveLength(1);
    expect(html).toContain(`href="${getService("elevenlabs")!.affiliateUrl}"`);
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).toContain('href="/project?source=elevenlabs-commercial-use-game"');
    expect(html).toContain('href="/articles/elevenlabs-game-development-guide/"');
    expect((html.match(/application\/ld\+json/g) ?? [])).toHaveLength(2);
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  });

  it("links from the pillar article to the commercial-use guide without a future placeholder", () => {
    const html = renderToStaticMarkup(<ElevenLabsGameDevelopmentGuide />);

    expect(html).toContain('href="/articles/elevenlabs-commercial-use-game/"');
    expect(html).toContain("ElevenLabsの商用利用条件とVoice Cloningの権利確認");
    expect(html).not.toContain("今後公開予定");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ElevenLabsGameDevelopmentGuide from "@/app/articles/elevenlabs-game-development-guide/page";
import ElevenLabsCommercialUseGame from "@/app/articles/elevenlabs-commercial-use-game/page";
import ElevenLabsV4GameVoice from "@/app/articles/elevenlabs-v4-game-voice/page";
import { getArticle } from "@/data/articles";
import { getService } from "@/lib/services";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ElevenLabs game-development article", () => {
  it("publishes a sourced, intent-preserving path from sample lines to in-game verification", () => {
    const article = getArticle("elevenlabs-game-development-guide")!;
    const html = renderToStaticMarkup(<ElevenLabsGameDevelopmentGuide />);

    expect(article.publicationStatus).toBe("published");
    expect(article.sources).toHaveLength(7);
    expect(article.promotions).toEqual([
      expect.objectContaining({
        serviceSlug: "elevenlabs",
        placement: "production_tools",
      }),
    ]);
    for (const text of [
      "固定音声ファイル",
      "代表セリフを1〜3本だけ決める",
      "ゲーム用音声の合格基準",
      "APIはいつ使えばいい？",
      "音声が不要ならElevenLabsを使う必要はありません",
    ])
      expect(html).toContain(text);
    expect(html).toContain("Project Generatorで音声制作taskを整理する");
    expect(html).toContain("https://try.elevenlabs.io/jlxoxtxe9768");
    expect(html).toContain('rel="sponsored nofollow noopener"');
  });
});

describe("ElevenLabs v4 game-voice article", () => {
  it("keeps fixed, dialogue and realtime decisions distinct with sourced caveats", () => {
    const article = getArticle("elevenlabs-v4-game-voice")!;
    const html = renderToStaticMarkup(<ElevenLabsV4GameVoice />);

    expect(article.publicationStatus).toBe("published");
    expect(article.sources).toHaveLength(9);
    for (const text of [
      "固定ゲーム音声",
      "複数話者の会話",
      "リアルタイムAI NPC",
      "約100msのmedian inference latency",
      "約150msのmedian time to first speech",
      "再現用テスト台本",
      "SSML",
    ])
      expect(html).toContain(text);
    expect(html).toContain('href="/articles/elevenlabs-commercial-use-game/"');
    expect(html).toContain(
      'href="/articles/elevenlabs-game-development-guide/"',
    );
    expect(html).toContain('href="/tools/elevenlabs/"');
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).toContain('href="/project?source=elevenlabs-v4-game-voice"');
  });

  it("uses the current product brand in the article note while preserving authorship and verification dates", () => {
    const article = getArticle("elevenlabs-v4-game-voice")!;
    const html = renderToStaticMarkup(<ElevenLabsV4GameVoice />);
    expect(html).toContain("GameBuildiaryによる音声生成・試聴評価ではなく");
    expect(html).not.toContain("GameAI Hub");
    expect(article.editorialNote).toContain("GameBuildiaryによる音声生成・試聴評価");
    expect(article.editorialNote).not.toContain("GameAI Hub");
    expect(article.author).toBe("AI Iterproof編集部");
    expect(article.updatedAt).toBe("2026-10-04");
    expect(article.lastVerifiedAt).toBe("2026-09-30");
    expect(article.sources.every(source => source.verifiedAt === "2026-09-30")).toBe(true);
  });

  it("preserves the official limits, realtime comparison and PVC discrepancy", () => {
    const html = renderToStaticMarkup(<ElevenLabsV4GameVoice />);

    expect(html).toContain("公式Model資料のAPI文字数上限");
    expect(html).toContain(
      '<th>公式Model資料のAPI文字数上限</th><td data-label="v3">5,000</td><td data-label="v4">10,000</td><td data-label="v4 Turbo">同じ数値の明記を確認できず</td>',
    );
    expect(html.match(/data-label="v3"/g)).toHaveLength(6);
    expect(html.match(/data-label="v4"/g)).toHaveLength(6);
    expect(html.match(/data-label="v4 Turbo"/g)).toHaveLength(6);
    expect(html).not.toContain(
      "<th>公式Model資料のAPI文字数上限</th><td>5,000</td><td>10,000</td><td>10,000</td>",
    );
    expect(html).toContain("同じ数値の明記を確認できず");
    expect(html).toContain("1つのdialogueに話者数の上限はない");
    expect(html).not.toContain("話者数の上限は公式資料に明記されていません");
    expect(html).toContain("ベストプラクティス");
    expect(html).toContain("約75msの低遅延モデル");
    expect(html).toContain("遅延やコストを優先する場合はFlash");
    expect(html).toContain("公式資料間で表現が一致しません");
    expect(html).toContain("製品page: 利用不可 / prompting: 未最適化");
    expect(html).toContain("完全には最適化されず、clone品質が下がり得る");
    expect(html).not.toContain("v3で非対応だったPVCが戻りました");
    expect(html).toContain("同じ公式ガイド内で説明が一致しない");
    expect(html).toContain("StyleとSpeedスライダーは利用できない");
    expect(html).toContain("Speed設定がすべてのモデルで利用できる");
    expect(html).toContain("現在のv4 UI/APIで動作を確認してから依存する");
    expect(html).not.toContain(
      "v4はStabilityとSimilarityを使い、StyleとSpeedスライダーは利用できない。",
    );
  });
});

describe("ElevenLabs commercial-use article", () => {
  it("publishes the sourced commercial-use decision guide through the article registry", () => {
    const article = getArticle("elevenlabs-commercial-use-game")!;

    expect(article).toBeDefined();
    expect(article.publicationStatus).toBe("published");
    expect(article.sources.length).toBeGreaterThanOrEqual(6);
    expect(article.promotions).toEqual([
      expect.objectContaining({
        serviceSlug: "elevenlabs",
        placement: "production_tools",
      }),
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
    ])
      expect(html).toContain(text);

    expect(
      html.match(/class="button"[^>]+href="https:\/\/try\.elevenlabs\.io/g) ??
        [],
    ).toHaveLength(1);
    expect(html).toContain("現行プランと商用利用条件を確認");
    expect(html).not.toContain("無料枠を公式サイトで確認");
    expect(html).toContain(`href="${getService("elevenlabs")!.affiliateUrl}"`);
    expect(html).toContain('rel="sponsored nofollow noopener"');
    expect(html).toContain(
      'href="/project?source=elevenlabs-commercial-use-game"',
    );
    expect(html).toContain(
      'href="/articles/elevenlabs-game-development-guide/"',
    );
    expect(html.match(/application\/ld\+json/g) ?? []).toHaveLength(2);
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

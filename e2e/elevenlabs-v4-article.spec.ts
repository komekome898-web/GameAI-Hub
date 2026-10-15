import { expect, test } from "./fixtures";
import { mkdir } from "node:fs/promises";

for (const viewport of [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-320", width: 320, height: 720 },
]) {
  test(`ElevenLabs v4 article supports the game-voice decision — ${viewport.name}`, async ({
    page,
  }) => {
    await mkdir("docs/screenshots/issue-153-elevenlabs-v4", {
      recursive: true,
    });
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto("/articles/elevenlabs-v4-game-voice/");
    await expect(
      page.getByRole("heading", { level: 1, name: /ElevenLabs v4とは/ }),
    ).toBeVisible();
    await expect(
      page.getByText("この記事にはプロモーションを含みます。"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "先に結論：ゲームの音声方式から選ぶ" }),
    ).toBeVisible();
    await expect(
      page.getByText("再現用テスト台本", { exact: true }),
    ).toBeVisible();
    const affiliate = page.getByRole("link", {
      name: "ElevenLabsで代表セリフを試す",
    });
    await expect(affiliate).toHaveAttribute(
      "href",
      "https://try.elevenlabs.io/jlxoxtxe9768",
    );
    await expect(affiliate).toHaveAttribute(
      "rel",
      "sponsored nofollow noopener",
    );
    await expect(
      page
        .getByRole("link", { name: "自分のゲーム用に最初の音声taskを作る" })
        .first(),
    ).toHaveAttribute("href", /\/project\/?\?source=elevenlabs-v4-game-voice/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/articles\/elevenlabs-v4-game-voice\/$/,
    );
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(2);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    expect(pageErrors).toEqual([]);
    await page.screenshot({
      path: `docs/screenshots/issue-153-elevenlabs-v4/article-${viewport.name}.png`,
      fullPage: true,
    });
  });
}

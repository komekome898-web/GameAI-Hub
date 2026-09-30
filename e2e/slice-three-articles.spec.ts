import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "./fixtures";
import {
  acceptanceViewports,
  installAcceptanceNetworkGuard,
} from "./acceptance/fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";
import {
  evidenceManifestVersion,
  type EvidenceRecord,
} from "./acceptance/manifest";

const routes = [
  { id: "hub", path: "/articles/" },
  { id: "browser", path: "/articles/ai-browser-game-how-to/" },
  { id: "elevenlabs", path: "/articles/elevenlabs-game-development-guide/" },
  { id: "meshy", path: "/articles/meshy-game-development-guide/" },
] as const;

test("Slice 3 representative routes meet the rendered reading contract", async ({
  page,
  context,
}) => {
  test.setTimeout(120_000);
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  const evidenceDir = path.join("docs", "screenshots", "issue-137-slice3");
  await mkdir(evidenceDir, { recursive: true });
  const records: EvidenceRecord[] = [];

  for (const viewport of acceptanceViewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const diagnostics = await diagnoseWidths(page);
      expect(
        diagnostics.documentOverflowPx,
        `${route.path} at ${viewport.width}px`,
      ).toBe(0);
      expect(
        diagnostics.unownedOverflowingElements,
        `${route.path} has unowned overflow`,
      ).toEqual([]);

      if (route.id === "hub") {
        await expect(
          page.getByRole("navigation", { name: "制作目的から記事を選ぶ" }),
        ).toBeVisible();
        await expect(page.locator(".article-cluster-list")).toHaveCount(4);
      } else {
        await expect(page.locator(".article-answer")).toBeVisible();
        await expect(
          page.getByRole("navigation", { name: "この記事の目次" }),
        ).toBeVisible();
        const heading = await page
          .getByRole("heading", { level: 1 })
          .boundingBox();
        if (viewport.width < 400) expect(heading?.height).toBeLessThan(190);
      }

      const screenshot = `${route.id}-${viewport.id}.png`;
      await page.screenshot({
        path: path.join(evidenceDir, screenshot),
        fullPage: true,
      });
      records.push({
        id: `${route.id}-${viewport.id}`,
        route: route.path,
        viewport,
        zoom: { mode: "none", factor: 1 },
        emulation: { viewport: true, physicalDevice: false },
        state: ["default", "browser-emulated", "ga4-collector-blocked"],
        screenshot,
        diagnostics: {
          documentOverflowPx: diagnostics.documentOverflowPx,
          ownedLocalScrollers: diagnostics.ownedLocalScrollers.length,
          unownedOverflowingElements:
            diagnostics.unownedOverflowingElements.length,
        },
        provenance: {
          capturedAt: new Date().toISOString(),
          runner: "Playwright Chromium viewport emulation",
          note: "Responsive evidence only; not physical-device evidence.",
        },
      });
    }
  }

  expect(collectorAttempts).toEqual([]);
  await writeFile(
    path.join(evidenceDir, "manifest.json"),
    `${JSON.stringify(
      {
        schema: evidenceManifestVersion,
        target: {
          sha: process.env.EVIDENCE_SHA ?? "0000000",
          environment: "local",
          baseUrl: "http://127.0.0.1:3100",
        },
        records,
      },
      null,
      2,
    )}\n`,
  );
});

test("affiliate disclosure, destination, events, and local scrollers retain parity", async ({
  page,
  context,
}) => {
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  await page.addInitScript(() => {
    (window as Window & { __sliceThreeEvents?: unknown[] }).__sliceThreeEvents =
      [];
    window.addEventListener("gameai:event", (event) => {
      (
        window as Window & { __sliceThreeEvents?: unknown[] }
      ).__sliceThreeEvents?.push((event as CustomEvent).detail);
    });
  });
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/articles/meshy-game-development-guide/");
  const disclosure = page.getByText("この記事にはプロモーションを含みます。", {
    exact: true,
  });
  const affiliate = page
    .locator('a[rel="sponsored nofollow noopener"]')
    .first();
  await expect(disclosure).toBeVisible();
  await expect(affiliate).toHaveAttribute(
    "href",
    "https://www.meshy.ai?via=gameaihub",
  );
  expect(
    await page.evaluate(
      ([disclosureNode, affiliateNode]) =>
        Boolean(
          disclosureNode.compareDocumentPosition(affiliateNode) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      [await disclosure.elementHandle(), await affiliate.elementHandle()],
    ),
  ).toBe(true);
  await affiliate.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as Window & { __sliceThreeEvents?: Array<{ name: string }> }
        ).__sliceThreeEvents?.map((event) => event.name),
      ),
    )
    .toContain("affiliate_impression");
  await affiliate.click({ modifiers: ["Control"] });
  const events = await page.evaluate(
    () =>
      (
        window as Window & {
          __sliceThreeEvents?: Array<{
            name: string;
            properties: Record<string, unknown>;
          }>;
        }
      ).__sliceThreeEvents ?? [],
  );
  expect(events.filter((event) => event.name === "article_view")).toHaveLength(
    1,
  );
  expect(
    events.find((event) => event.name === "article_view")?.properties,
  ).toMatchObject({ article_slug: "meshy-game-development-guide" });
  for (const name of ["affiliate_impression", "affiliate_click"]) {
    expect(
      events.find((event) => event.name === name)?.properties,
    ).toMatchObject({
      article_slug: "meshy-game-development-guide",
      placement: "meshy_game_guide_first_asset",
      service_id: "meshy",
    });
  }

  await page.goto("/articles/meshy-pricing-credits-game/");
  const tableRegion = page
    .getByRole("region", {
      name: "比較表（横にスクロールできます）",
    })
    .first();
  await expect(tableRegion).toHaveAttribute("tabindex", "0");
  await tableRegion.focus();
  await expect(tableRegion).toBeFocused();
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  expect(collectorAttempts).toEqual([]);
});

test("shared-template commercial and pricing articles regress safely at every acceptance width", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const regressions = [
    "/articles/elevenlabs-commercial-use-game/",
    "/articles/meshy-pricing-credits-game/",
    "/articles/meshy-commercial-use-game/",
  ];
  for (const viewport of acceptanceViewports) {
    await page.setViewportSize(viewport);
    for (const route of regressions) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "この記事の目次" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "情報源と更新方針" }),
      ).toBeVisible();
      const affiliate = page
        .locator('a[rel="sponsored nofollow noopener"]')
        .first();
      await expect(affiliate).toBeVisible();
      const disclosure = page
        .getByText("この記事にはプロモーションを含みます。", { exact: true })
        .first();
      expect(
        await disclosure.evaluate(
          (node, affiliateNode) =>
            Boolean(
              node.compareDocumentPosition(affiliateNode) &
              Node.DOCUMENT_POSITION_FOLLOWING,
            ),
          await affiliate.elementHandle(),
        ),
      ).toBe(true);
      expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
    }
  }
});

test("TOC supports mobile disclosure, sticky-safe anchors, initial fragments, and owned code scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/articles/ai-browser-game-how-to/");
  const toc = page.getByRole("navigation", { name: "この記事の目次" });
  const disclosure = toc.locator("details");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await disclosure.locator("summary").click();
  await toc.getByRole("link", { name: "1. まず完成例を動かす" }).click();
  await expect
    .poll(() => page.evaluate(() => decodeURIComponent(location.hash)))
    .toBe("#section-1-まず完成例を動かす");
  const heading = page.getByRole("heading", { name: "1. まず完成例を動かす" });
  await expect
    .poll(async () => (await heading.boundingBox())?.y ?? -1)
    .toBeGreaterThan(55);

  // Exercise a true initial-fragment document navigation. Reusing the current
  // article document turns this into a same-document hash transition whose
  // timing can race Playwright's goto completion and browser restoration.
  await page.goto("about:blank");
  await page.goto(
    "/articles/ai-browser-game-how-to/#section-3-最初のゲームをaiへ生成してもらう",
  );
  const target = page.getByRole("heading", {
    name: "3. 最初のゲームをAIへ生成してもらう",
  });
  await expect
    .poll(async () => (await target.boundingBox())?.y ?? 9999)
    .toBeLessThan(180);

  const code = page.locator("pre.article-code").first();
  await code.evaluate((node) => {
    node.style.whiteSpace = "pre";
    node.textContent = `const token = "${"unbroken-token-".repeat(50)}";`;
  });
  const widths = await diagnoseWidths(page);
  expect(widths.documentOverflowPx).toBe(0);
  expect(await code.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  await expect(code).toHaveCSS("overflow-x", "auto");
});

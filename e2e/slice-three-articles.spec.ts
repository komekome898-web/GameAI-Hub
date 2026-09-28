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

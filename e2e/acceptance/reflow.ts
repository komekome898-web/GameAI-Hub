import type { Locator, Page } from "@playwright/test";

export type TextMethod =
  | "none"
  | "synthetic-root-text"
  | "synthetic-computed-text"
  | "spacing-line-height"
  | "spacing-paragraph"
  | "spacing-letter"
  | "spacing-word";
export type TextRole = { role: string; selector: string };
export type TextMeasurement = {
  role: string;
  selector: string;
  matched: number;
  baselineFontPx: number[];
  changedFontPx: number[];
  achievedFactors: number[];
  baselineLineHeightPx: Array<number | null>;
  changedLineHeightPx: Array<number | null>;
};

/** Snapshot before mutation, so nested targets are never multiplied recursively. */
export async function applyTextMethod(
  page: Page,
  roles: TextRole[],
  method: TextMethod,
  factor = 1,
) {
  if (!roles.length) throw new Error("text roles must not be empty");
  if (!Number.isFinite(factor) || factor < 1)
    throw new Error("text factor must be finite and at least 1");
  const snapshot = await page.evaluate(
    (targets) =>
      targets.map(({ role, selector }) => {
        const elements = [...document.querySelectorAll<HTMLElement>(selector)];
        if (elements.length === 0)
          throw new Error(
            `${role}: selector matched zero surfaces: ${selector}`,
          );
        return {
          role,
          selector,
          rootInline: document.documentElement.style.fontSize,
          elements: elements.map((element) => {
            const style = getComputedStyle(element);
            return {
              fontSize: Number.parseFloat(style.fontSize),
              lineHeight:
                style.lineHeight === "normal"
                  ? null
                  : Number.parseFloat(style.lineHeight),
              inline: {
                fontSize: element.style.fontSize,
                lineHeight: element.style.lineHeight,
                letterSpacing: element.style.letterSpacing,
                wordSpacing: element.style.wordSpacing,
                marginBottom: element.style.marginBottom,
              },
            };
          }),
        };
      }),
    roles,
  );

  await page.evaluate(
    ({ targets, selectedMethod, selectedFactor }) => {
      if (selectedMethod === "synthetic-root-text") {
        const baseline = Number.parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        document.documentElement.style.fontSize = `${baseline * selectedFactor}px`;
      }
      targets.forEach(({ selector, elements }) => {
        [...document.querySelectorAll<HTMLElement>(selector)].forEach(
          (element, index) => {
            const baseline = elements[index];
            if (selectedMethod === "synthetic-computed-text") {
              element.style.fontSize = `${baseline.fontSize * selectedFactor}px`;
              if (baseline.lineHeight !== null)
                element.style.lineHeight = `${baseline.lineHeight * selectedFactor}px`;
            } else if (selectedMethod === "spacing-line-height")
              element.style.lineHeight = "1.5";
            else if (selectedMethod === "spacing-paragraph")
              element.style.marginBottom = "2em";
            else if (selectedMethod === "spacing-letter")
              element.style.letterSpacing = ".12em";
            else if (selectedMethod === "spacing-word")
              element.style.wordSpacing = ".16em";
          },
        );
      });
    },
    { targets: snapshot, selectedMethod: method, selectedFactor: factor },
  );

  const measurements: TextMeasurement[] = await page.evaluate(
    (targets) =>
      targets.map(({ role, selector, elements }) => {
        const changed = [
          ...document.querySelectorAll<HTMLElement>(selector),
        ].map((element) => getComputedStyle(element));
        return {
          role,
          selector,
          matched: changed.length,
          baselineFontPx: elements.map(({ fontSize }) => fontSize),
          changedFontPx: changed.map((style) =>
            Number.parseFloat(style.fontSize),
          ),
          achievedFactors: changed.map(
            (style, index) =>
              Number.parseFloat(style.fontSize) / elements[index].fontSize,
          ),
          baselineLineHeightPx: elements.map(({ lineHeight }) => lineHeight),
          changedLineHeightPx: changed.map((style) =>
            style.lineHeight === "normal"
              ? null
              : Number.parseFloat(style.lineHeight),
          ),
        };
      }),
    snapshot,
  );

  const sufficient =
    measurements.length === roles.length &&
    measurements.every(
      (measurement) =>
        measurement.matched > 0 &&
        measurement.matched === measurement.baselineFontPx.length &&
        measurement.achievedFactors.length === measurement.matched &&
        measurement.achievedFactors.every(
          (achieved) =>
            Number.isFinite(achieved) &&
            (method === "synthetic-root-text" ||
            method === "synthetic-computed-text"
              ? Math.abs(achieved - factor) <= 0.05
              : true),
        ),
    );
  return {
    method,
    requestedFactor: factor,
    measurements,
    sufficient,
    restore: async () =>
      page.evaluate((targets) => {
        document.documentElement.style.fontSize = targets[0]?.rootInline ?? "";
        targets.forEach(({ selector, elements }) => {
          [...document.querySelectorAll<HTMLElement>(selector)].forEach(
            (element, index) => {
              const original = elements[index].inline;
              Object.assign(element.style, original);
            },
          );
        });
      }, snapshot),
  };
}

export type SurfaceProbe = {
  selector: string;
  matched: number;
  clippedText: Array<{
    selector: string;
    horizontal: boolean;
    vertical: boolean;
  }>;
  undersizedTargets: Array<{ selector: string; width: number; height: number }>;
  focusable: number;
  focusApplicable: boolean;
  focusReachable: boolean;
  focusVisible: boolean;
  focusVerification: "verified" | "unverified" | "not-applicable";
};

export async function probeSurface(
  page: Page,
  selector: string,
  minimumTarget = 44,
): Promise<SurfaceProbe> {
  const prior = await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.dataset.acceptancePriorFocus = "true";
    return { x: scrollX, y: scrollY };
  });
  const base = await page.evaluate(
    ({ target, minTarget }) => {
      const roots = [...document.querySelectorAll<HTMLElement>(target)];
      if (roots.length === 0)
        throw new Error(`selector matched zero surfaces: ${target}`);
      const identify = (element: Element) =>
        element.id
          ? `#${CSS.escape(element.id)}`
          : element.tagName.toLowerCase();
      const clippedText: SurfaceProbe["clippedText"] = [];
      const undersizedTargets: SurfaceProbe["undersizedTargets"] = [];
      const focusables: HTMLElement[] = [];
      roots.forEach((root) => {
        [root, ...root.querySelectorAll<HTMLElement>("*")].forEach(
          (element) => {
            const style = getComputedStyle(element);
            const ownsHorizontalScroll =
              element.matches(
                '[data-acceptance-scroll-owner="true"], pre, .table-scroll, .article-decision-table, .code-block',
              ) && /(auto|scroll)/.test(`${style.overflowX} ${style.overflow}`);
            const horizontal =
              element.scrollWidth > element.clientWidth + 1 &&
              !ownsHorizontalScroll;
            const vertical =
              element.scrollHeight > element.clientHeight + 1 &&
              /(hidden|clip)/.test(style.overflowY || style.overflow);
            if ((horizontal || vertical) && (element.textContent?.trim() ?? ""))
              clippedText.push({
                selector: identify(element),
                horizontal,
                vertical,
              });
            if (
              element.matches(
                "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
              )
            ) {
              focusables.push(element);
              const rect = element.getBoundingClientRect();
              if (rect.width < minTarget || rect.height < minTarget)
                undersizedTargets.push({
                  selector: identify(element),
                  width: rect.width,
                  height: rect.height,
                });
            }
          },
        );
      });
      return {
        selector: target,
        matched: roots.length,
        clippedText,
        undersizedTargets,
        focusable: focusables.length,
        focusApplicable: focusables.length > 0,
      };
    },
    { target: selector, minTarget: minimumTarget },
  );
  const focusResults: Array<{ reachable: boolean; visible: boolean }> = [];
  for (let index = 0; index < base.focusable; index += 1) {
    const prepared = await page.evaluate(
      ({ target, item }) => {
        const roots = [...document.querySelectorAll<HTMLElement>(target)];
        const candidates = roots
          .flatMap((root) => [root, ...root.querySelectorAll<HTMLElement>("*")])
          .filter(
            (element, position, all) =>
              all.indexOf(element) === position &&
              element.matches(
                "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
              ),
          );
      const candidate = candidates[item];
      if (!candidate) return null;
      candidate.scrollIntoView({ block: "nearest", inline: "nearest" });
      candidate.blur();
      const style = getComputedStyle(candidate);
      const before = {
        outline: `${style.outlineStyle}|${style.outlineWidth}|${style.outlineColor}|${style.outlineOffset}`,
        shadow: style.boxShadow,
        border: `${style.borderColor}|${style.borderWidth}`,
        background: style.backgroundColor,
      };
      candidate.dataset.acceptanceFocusTarget = "true";
      candidate.focus({ preventScroll: true });
      return before;
      },
      { target: selector, item: index },
    );
    if (!prepared) continue;
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    focusResults.push(
      await page.evaluate(
        ({ before }) => {
          const candidate = document.querySelector<HTMLElement>(
            '[data-acceptance-focus-target="true"]',
          )!;
          const rect = candidate.getBoundingClientRect();
          const style = getComputedStyle(candidate);
          const x = Math.max(
            0,
            Math.min(
              innerWidth - 1,
              rect.left + Math.min(rect.width, innerWidth) / 2,
            ),
          );
          const y = Math.max(
            0,
            Math.min(
              innerHeight - 1,
              rect.top + Math.min(rect.height, innerHeight) / 2,
            ),
          );
          const hit = document.elementFromPoint(x, y);
          const after = {
            outline: `${style.outlineStyle}|${style.outlineWidth}|${style.outlineColor}|${style.outlineOffset}`,
            shadow: style.boxShadow,
            border: `${style.borderColor}|${style.borderWidth}`,
            background: style.backgroundColor,
          };
          const reachable =
            document.activeElement === candidate &&
            rect.bottom > 0 &&
            rect.top < innerHeight &&
            rect.right > 0 &&
            rect.left < innerWidth &&
            !!hit &&
            (hit === candidate || candidate.contains(hit));
          const visible =
            reachable &&
            Object.keys(after).some(
              (key) =>
                after[key as keyof typeof after] !==
                before[key as keyof typeof before],
            );
      candidate.removeAttribute("data-acceptance-focus-target");
      return { reachable, visible };
        },
        { before: prepared },
      ),
    );
  }
  await page.evaluate(({ x, y }) => {
    const focus = document.querySelector<HTMLElement>(
      '[data-acceptance-prior-focus="true"]',
    );
    focus?.focus({ preventScroll: true });
    focus?.removeAttribute("data-acceptance-prior-focus");
    scrollTo(x, y);
  }, prior);
  return {
    ...base,
    focusReachable: focusResults.every(({ reachable }) => reachable),
    focusVisible: focusResults.every(({ visible }) => visible),
    focusVerification: !base.focusApplicable
      ? "not-applicable"
      : focusResults.length === base.focusable &&
          focusResults.every(({ visible }) => visible)
        ? "verified"
        : "unverified",
  };
}

export type RowProbe = {
  layout: "inline" | "stacked";
  nonoverlapping: boolean;
  contained: boolean;
  ordinaryLabelSqueezed: boolean;
  labelWidth: number;
  naturalLabelWidth: number;
};

export async function probeSemanticRow(
  row: Locator,
  labelSelector: string,
  peerSelector: string,
): Promise<RowProbe> {
  if ((await row.count()) === 0)
    throw new Error("semantic row matched zero surfaces");
  return row.evaluate(
    (element, { labelTarget, peerTarget }) => {
      const label = element.querySelector<HTMLElement>(labelTarget);
      const peer = element.querySelector<HTMLElement>(peerTarget);
      if (!label || !peer)
        throw new Error("semantic row label or peer matched zero surfaces");
      const rowRect = element.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const peerRect = peer.getBoundingClientRect();
      const clone = label.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        position: "absolute",
        visibility: "hidden",
        inset: "auto",
        width: "max-content",
        minWidth: "0",
        maxWidth: "none",
        flex: "none",
        whiteSpace: "nowrap",
        transform: "none",
      });
      element.append(clone);
      const naturalLabelWidth = clone.getBoundingClientRect().width;
      clone.remove();
      const range = document.createRange();
      range.selectNodeContents(label);
      const labelLineHeight =
        Number.parseFloat(getComputedStyle(label).lineHeight) ||
        Number.parseFloat(getComputedStyle(label).fontSize) * 1.2;
      const lineTops: number[] = [];
      for (const rect of range.getClientRects())
        if (!lineTops.some((top) => Math.abs(top - rect.top) < 1))
          lineTops.push(rect.top);
      const labelWraps =
        lineTops.length > 1 || labelRect.height > labelLineHeight * 1.5;
      const verticalOverlap =
        Math.min(labelRect.bottom, peerRect.bottom) -
        Math.max(labelRect.top, peerRect.top);
      const horizontalOverlap =
        Math.min(labelRect.right, peerRect.right) -
        Math.max(labelRect.left, peerRect.left);
      const layout = verticalOverlap > 1 ? "inline" : "stacked";
      return {
        layout,
        nonoverlapping:
          layout === "inline" ? horizontalOverlap <= 0 : verticalOverlap <= 0,
        contained: [labelRect, peerRect].every(
          (rect) =>
            rect.left >= rowRect.left - 1 &&
            rect.right <= rowRect.right + 1 &&
            rect.top >= rowRect.top - 1 &&
            rect.bottom <= rowRect.bottom + 1,
        ),
        ordinaryLabelSqueezed:
          labelWraps && naturalLabelWidth <= rowRect.width - 2,
        labelWidth: labelRect.width,
        naturalLabelWidth,
      };
    },
    { labelTarget: labelSelector, peerTarget: peerSelector },
  );
}

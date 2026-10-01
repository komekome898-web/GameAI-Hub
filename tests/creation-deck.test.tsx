// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreationDeck, type CreationDeckItem } from "@/components/CreationDeck";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>,
}));

const item = (index: number): CreationDeckItem => ({
  href: `/articles/fixture-${index}/`,
  title: `Fixture ${index}`,
  description: `Description ${index}`,
  updatedAt: "2026-09-30",
  label: "START",
  image: { src: `/fixture-${index}.webp`, srcSet: `/fixture-${index}.webp 1x` },
});

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

const installUsableGeometry = () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const width = this.matches("ol") ? 390 : 304;
    return { x: 0, y: 0, top: 0, right: width, bottom: 360, left: 0, width, height: 360, toJSON: () => ({}) };
  });
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(344);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".creation-deck-controls") ? 304 : 390;
  });
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.matches(".creation-deck-controls") ? 304 : 390;
  });
};

describe("CreationDeck disposable item-count fixtures", () => {
  it.each([0, 1, 2, 3, 5])("renders %i unique anchors without duplicating content", async (count) => {
    installUsableGeometry();
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    const items = Array.from({ length: count }, (_, index) => item(index));
    const view = render(<CreationDeck items={items} />);
    const anchors = Array.from(view.container.querySelectorAll<HTMLAnchorElement>("ol > li > a"));
    expect(anchors).toHaveLength(count);
    expect(new Set(anchors.map(({ href }) => href)).size).toBe(count);
    if (count <= 2) {
      await waitFor(() => expect(view.container.querySelector(".creation-deck-controls")).toBeNull());
      expect(view.container.querySelector(".creation-deck")?.getAttribute("data-mode")).toBe("list");
    } else {
      await waitFor(() => expect(view.container.querySelector(".creation-deck-controls")).not.toBeNull());
    }
    view.unmount();
  });

  it("keeps the same links in the list when intrinsic measurement is unusable", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0, toJSON: () => ({}),
    });
    const view = render(<CreationDeck items={[item(0), item(1), item(2)]} />);
    await waitFor(() => expect(view.container.querySelector(".creation-deck-controls")).toBeNull());
    expect(view.container.querySelector(".creation-deck")?.getAttribute("data-mode")).toBe("list");
    expect(view.container.querySelectorAll("ol > li > a")).toHaveLength(3);
  });

  it("falls back before exposing controls when their initial layout does not fit", async () => {
    installUsableGeometry();
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.matches(".creation-deck-controls") ? 180 : 390;
    });
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
      return this.matches(".creation-deck-controls") ? 360 : 390;
    });
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    const view = render(<CreationDeck items={[item(0), item(1), item(2)]} />);
    await waitFor(() => expect(view.container.querySelector(".creation-deck")?.getAttribute("data-available")).toBe("false"));
    expect(view.container.querySelector(".creation-deck")?.getAttribute("data-mode")).toBe("list");
    expect(view.container.querySelector(".creation-deck-controls")).toBeNull();
    expect(view.container.querySelectorAll("ol > li > a")).toHaveLength(3);
  });
});

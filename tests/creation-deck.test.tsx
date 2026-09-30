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

describe("CreationDeck disposable item-count fixtures", () => {
  it.each([0, 1, 2, 3, 5])("renders %i unique anchors without duplicating content", async (count) => {
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
});

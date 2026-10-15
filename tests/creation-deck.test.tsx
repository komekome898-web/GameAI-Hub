// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreationDeck, type CreationDeckItem } from "@/components/CreationDeck";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>,
}));

const item = (index: number): CreationDeckItem => ({
  id: `fixture-${index}`,
  href: `/articles/fixture-${index}/`,
  title: `Fixture ${index}`,
  description: `Description ${index}`,
  updatedAt: "2026-09-30",
  label: "START",
  image: { src: `/fixture-${index}.webp`, srcSet: `/fixture-${index}.webp 1x` },
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
    const anchors = Array.from(view.container.querySelectorAll<HTMLAnchorElement>("ol > li a"));
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
    expect(view.container.querySelectorAll("ol > li a")).toHaveLength(3);
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
    expect(view.container.querySelectorAll("ol > li a")).toHaveLength(3);
  });
  it("retains the selected ID across reorder and href change; removal/count changes safely fall back", async () => {
    installUsableGeometry();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const items = [item(0), item(1), item(2)];
    const view = render(<CreationDeck items={items} />);
    await waitFor(() => expect(view.getByRole('button', { name: '円環で見る' })).toBeTruthy());
    fireEvent.click(view.getByRole('button', { name: '円環で見る' }));
    const originalLink = view.getByRole('link', { name: 'Fixture 1' });
    fireEvent.focusIn(originalLink);
    await waitFor(() => expect(view.container.querySelector('.creation-deck-count')?.textContent).toBe('2 / 3'));
    view.rerender(<CreationDeck items={[{ ...items[1], href: '/changed/' }, items[2], items[0]]} />);
    await waitFor(() => expect(view.container.querySelector('.creation-deck-count')?.textContent).toBe('1 / 3'));
    expect(view.getByRole('link', { name: 'Fixture 1' })).toBe(originalLink);
    view.rerender(<CreationDeck items={[items[2], items[0], item(3)]} />);
    await waitFor(() => expect(view.container.querySelector('.creation-deck-status')?.textContent).toContain('Fixture 2'));
    for (const count of [2, 1, 0]) {
      view.rerender(<CreationDeck items={items.slice(0, count)} />);
      await waitFor(() => expect(view.container.querySelector('.creation-deck')?.getAttribute('data-mode')).toBe('list'));
      expect(view.container.querySelectorAll('a')).toHaveLength(count);
      expect(view.container.querySelector('ol')?.getAttribute('data-motion-raf')).toBe('0');
    }
    view.unmount();
  });

  it("cancels the one scheduled motion frame when unmounted", async () => {
    installUsableGeometry();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const request = vi.fn(() => 42), cancel = vi.fn();
    vi.stubGlobal('requestAnimationFrame', request); vi.stubGlobal('cancelAnimationFrame', cancel);
    const view = render(<CreationDeck items={[item(0), item(1), item(2)]} />);
    await waitFor(() => expect(view.getByRole('button', { name: '円環で見る' })).toBeTruthy());
    fireEvent.click(view.getByRole('button', { name: '円環で見る' }));
    fireEvent.click(view.getByRole('button', { name: '次の記事' }));
    expect(request).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(cancel).toHaveBeenCalledWith(42);
  });

});


describe("shared category cards", () => {
  it("uses category labels/counts without invented dates and isolates explicit mode", async () => {
    installUsableGeometry();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches:false, addEventListener:vi.fn(), removeEventListener:vi.fn() })));
    sessionStorage.setItem("category-fixture-mode", "list");
    const categories = [0,1,2,3].map(index => ({ ...item(index), updatedAt:undefined, image:undefined, count:index+3 }));
    const view = render(<><CreationDeck kind="category" items={categories} defaultMode="deck" preferenceKey="category-fixture-mode" /><CreationDeck items={[item(0),item(1),item(2)]} defaultMode="deck" /></>);
    const decks = view.container.querySelectorAll('.creation-deck');
    await waitFor(() => expect(decks[1].getAttribute('data-mode')).toBe('deck'));
    expect(decks[0].getAttribute('data-mode')).toBe('list');
    expect(decks[0].textContent).toContain('3本の記事');
    expect(decks[0].textContent).not.toContain('更新');
    expect(decks[0].textContent).toContain('記事を見る');
    fireEvent.click(decks[0].querySelector('button')!);
    await waitFor(() => expect(decks[0].getAttribute('data-mode')).toBe('deck'));
    expect(decks[0].querySelector('[aria-label="次のカテゴリ"]')).not.toBeNull();
    expect(decks[1].querySelector('[aria-label="次の記事"]')).not.toBeNull();
    expect(sessionStorage.getItem('gameai-creation-deck-mode')).toBeNull();
  });
});

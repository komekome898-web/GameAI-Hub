// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArticlesPage from "@/app/articles/page";
import { getArticle } from "@/data/articles";
import { startArticleVisuals } from "@/lib/article-visuals";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const startSlugs = [
  "ai-browser-game-how-to",
  "before-asking-ai-build-game",
  "github-beginner-game-development",
] as const;

describe("Visual Layer v2 article hub V1", () => {
  it("keeps four static lists and gives START one link per preserved article", () => {
    const { container } = render(<ArticlesPage />);
    expect(container.querySelectorAll(".article-cluster-list")).toHaveLength(4);
    expect(container.querySelectorAll("#start button")).toHaveLength(0);
    expect(container.querySelectorAll("#start li > a")).toHaveLength(3);

    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("#start li > a"));
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      startSlugs.map((slug) => `/articles/${slug}/`),
    );
    for (const [index, slug] of startSlugs.entries()) {
      const article = getArticle(slug)!;
      expect(links[index].textContent).toContain(article.title);
      expect(links[index].textContent).toContain(article.description);
      expect(links[index].textContent).toContain(article.updatedAt);
      expect(links[index].querySelector("img")?.getAttribute("alt")).toBe("");
    }
  });

  it("maps only the approved START articles to their supplied covers", () => {
    expect(startArticleVisuals).toEqual({
      "ai-browser-game-how-to": "game-creation",
      "before-asking-ai-build-game": "planning",
      "github-beginner-game-development": "development",
    });
  });
});

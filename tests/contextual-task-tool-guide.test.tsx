import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContextualTaskToolGuide } from "@/components/ProjectGeneratorClient";
import { buildChecklist, generateProjectPlan, type ProjectBrief } from "@/lib/project";

const projectIdea = "秘密のキャラクター名を含む音声ゲーム";
const makeBrief = (capabilities: ProjectBrief["capabilities"]): ProjectBrief => ({
  idea: projectIdea, genre: "action", dimension: "2d", platform: "desktop",
  engine: "unity", budget: "low", experience: "intermediate", team: "solo",
  commercialIntent: "personal", capabilities, locale: "ja", details: [],
});

beforeEach(() => {
  class MockIntersectionObserver {
    root = null; rootMargin = "0px"; thresholds = [0.5];
    constructor() {} observe() {} disconnect() {} unobserve() {} takeRecords() { return []; }
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, "", "/project"); });

describe("ContextualTaskToolGuide", () => {
  it("renders the contextual affiliate CTA with safe task and article attribution", () => {
    history.replaceState(null, "", "/project?source=ai-browser-game-how-to");
    const step = buildChecklist(generateProjectPlan(makeBrief(["coding", "voice"])))
      .find((item) => item.id === "voice")!;
    const events: CustomEvent[] = [];
    const listener: EventListener = (event) => events.push(event as CustomEvent);
    window.addEventListener("gameai:event", listener);
    render(<ContextualTaskToolGuide step={step} taskIndex={7} />);
    expect(screen.getByText("今回作るもの")).toBeTruthy();
    expect(screen.getByText(/自分で代表台詞を録音/)).toBeTruthy();
    expect(screen.getByText(/このProjectへ戻って/)).toBeTruthy();
    const link = screen.getByRole("link", { name: /広告リンク/ });
    expect(link.getAttribute("href")).toBe("https://try.elevenlabs.io/jlxoxtxe9768");
    expect(link.getAttribute("rel")).toBe("sponsored nofollow noopener");
    expect(document.getElementById(link.getAttribute("aria-describedby")!)?.textContent).toContain("報酬");
    fireEvent.click(link);
    const serialized = JSON.stringify(events.map((event) => event.detail));
    expect(serialized).toContain('"task_stage":"audio"');
    expect(serialized).toContain('"task_index":7');
    expect(serialized).toContain('"article_slug":"ai-browser-game-how-to"');
    expect(serialized).toContain("elevenlabs__-project__project-task-tool");
    expect(serialized).not.toContain(projectIdea);
    window.removeEventListener("gameai:event", listener);
  });

  it("renders nothing for an unrelated task", () => {
    const step = buildChecklist(generateProjectPlan(makeBrief(["coding"])))
      .find((item) => item.id === "core-loop")!;
    const { container } = render(<ContextualTaskToolGuide step={step} taskIndex={3} />);
    expect(container.innerHTML).toBe("");
  });
});

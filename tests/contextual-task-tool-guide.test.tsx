import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BuildChecklist,
  ContextualTaskToolGuide,
} from "@/components/ProjectGeneratorClient";
import { buildChecklist, generateProjectPlan, type ProjectBrief } from "@/lib/project";

const projectIdea = "秘密のキャラクター名を含む音声ゲーム";
const observe = vi.fn();
const observedTargets = () =>
  new Set(observe.mock.calls.map(([target]) => target)).size;
const makeBrief = (capabilities: ProjectBrief["capabilities"]): ProjectBrief => ({
  idea: projectIdea, genre: "action", dimension: "2d", platform: "desktop",
  engine: "unity", budget: "low", experience: "intermediate", team: "solo",
  commercialIntent: "personal", capabilities, locale: "ja", details: [],
});

beforeEach(() => {
  class MockIntersectionObserver {
    root = null; rootMargin = "0px"; thresholds = [0.5];
    constructor() {} observe = observe; disconnect() {} unobserve() {} takeRecords() { return []; }
  }
  observe.mockClear();
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
    expect(screen.queryByRole("link", { name: /広告リンク/ })).toBeNull();
    fireEvent.change(screen.getByLabelText("台詞本文（必須）"), {
      target: { value: "Projectで決めた代表台詞" },
    });
    fireEvent.change(screen.getByLabelText("話者（任意）"), {
      target: { value: "Projectで決めたNPC" },
    });
    fireEvent.change(screen.getByLabelText("感情（任意）"), {
      target: { value: "Projectで決めた感情" },
    });
    expect(screen.queryByRole("link", { name: /広告リンク/ })).toBeNull();
    fireEvent.change(screen.getByLabelText("出力形式（必須）"), {
      target: { value: "wav" },
    });
    const generation = document.querySelector(".generation-prompt")!;
    const inspection = document.querySelector(".tool-inspection")!;
    expect(generation.textContent).toContain("Projectで決めた代表台詞");
    expect(generation.textContent).not.toContain("再生タイミングで再生されるか確認");
    expect(inspection.textContent).toContain("再生タイミングで再生されるか確認");
    const settings = screen.getByLabelText("ElevenLabsで設定する項目");
    expect(settings.textContent).toContain("Projectで決めたNPC");
    expect(settings.textContent).toContain("Projectで決めた感情");
    expect(settings.textContent).toContain("WAV");
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

  it.each([
    ["voice", ["coding", "voice"] as ProjectBrief["capabilities"], "ElevenLabs"],
    ["assets-3d", ["coding", "assets-3d"] as ProjectBrief["capabilities"], "Meshy"],
  ])("mounts exactly one contextual CTA and observer for the current %s task", (taskId, capabilities, serviceName) => {
    const plan = generateProjectPlan({
      ...makeBrief(capabilities),
      dimension: taskId === "assets-3d" ? "3d" : "2d",
      experience: "beginner",
    });
    const step = buildChecklist(plan).find((item) => item.id === taskId)!;
    render(
      <BuildChecklist
        steps={[step]}
        plan={plan}
        onCopy={vi.fn().mockResolvedValue(true)}
        engineBlocked={false}
      />,
    );
    if (taskId === "voice") {
      fireEvent.change(screen.getByLabelText("台詞本文（必須）"), {
        target: { value: "明示した台詞" },
      });
      fireEvent.change(screen.getByLabelText("出力形式（必須）"), {
        target: { value: "mp3" },
      });
    } else {
      fireEvent.change(screen.getByLabelText("作る対象（必須）"), {
        target: { value: "明示した対象" },
      });
      fireEvent.change(screen.getByLabelText("外観description（必須）"), {
        target: { value: "明示した外観" },
      });
    }
    expect(screen.getAllByLabelText("現在の作業で使えるツール")).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: /広告リンク/ })).toHaveLength(1);
    const guide = screen.getByLabelText("現在の作業で使えるツール");
    expect(within(guide).getByRole("heading", { name: serviceName })).toBeTruthy();
    expect(observedTargets()).toBe(1);
  });

  it("keeps the 3D generation description separate from import inspection", () => {
    const plan = generateProjectPlan({
      ...makeBrief(["coding", "assets-3d"]),
      dimension: "3d",
    });
    const step = buildChecklist(plan).find((item) => item.id === "assets-3d")!;
    render(<ContextualTaskToolGuide step={step} taskIndex={7} />);
    expect(screen.queryByRole("link", { name: /広告リンク/ })).toBeNull();
    fireEvent.change(screen.getByLabelText("作る対象（必須）"), { target: { value: "Projectで決めた対象" } });
    expect(screen.queryByRole("link", { name: /広告リンク/ })).toBeNull();
    fireEvent.change(screen.getByLabelText("外観description（必須）"), { target: { value: "Projectで決めた外観" } });
    const generation = document.querySelector(".generation-prompt")!;
    const inspection = document.querySelector(".tool-inspection")!;
    expect(generation.textContent).toMatch(/対象:.*外観description:/s);
    expect(generation.textContent).not.toContain("collisionを設定して確認");
    expect(inspection.textContent).toContain("collisionを設定して確認");
  });

  it("keeps one CTA when the current roadmap detail is the primary work area", () => {
    const plan = generateProjectPlan({
      ...makeBrief(["coding", "voice"]),
      experience: "intermediate",
    });
    const step = buildChecklist(plan).find((item) => item.id === "voice")!;
    render(
      <BuildChecklist
        steps={[step]}
        plan={plan}
        onCopy={vi.fn().mockResolvedValue(true)}
        engineBlocked={false}
      />,
    );
    fireEvent.change(screen.getByLabelText("台詞本文（必須）"), {
      target: { value: "明示した台詞" },
    });
    fireEvent.change(screen.getByLabelText("出力形式（必須）"), {
      target: { value: "wav" },
    });
    expect(screen.getAllByLabelText("現在の作業で使えるツール")).toHaveLength(1);
    expect(observedTargets()).toBe(1);
  });

  it("mounts no contextual CTA or impression observer without voice or 3D", () => {
    const plan = generateProjectPlan(makeBrief(["coding"]));
    const step = buildChecklist(plan).find((item) => item.id === "core-loop")!;
    render(
      <BuildChecklist
        steps={[step]}
        plan={plan}
        onCopy={vi.fn().mockResolvedValue(true)}
        engineBlocked={false}
      />,
    );
    expect(screen.queryByLabelText("現在の作業で使えるツール")).toBeNull();
    expect(observe).not.toHaveBeenCalled();
  });
});

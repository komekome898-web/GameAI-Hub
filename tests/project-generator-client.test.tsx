import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ProjectGeneratorClient,
  ProjectIdeaForm,
} from "@/components/ProjectGeneratorClient";
import { encodeProjectState, type ProjectBrief } from "@/lib/project";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  history.replaceState(null, "", "/project");
  push.mockClear();
});

describe("Project Generator client", () => {
  it("starts from free text without putting the description in analytics", () => {
    const listener = vi.fn();
    window.addEventListener("gameai:event", listener);
    render(<ProjectIdeaForm location="home" />);
    const idea =
      "2Dのモンスター収集ゲーム。iPhone向け。一人開発。秘密の企画名。";
    fireEvent.change(screen.getByLabelText(/どんなゲームを作りたいですか？/), {
      target: { value: idea },
    });
    fireEvent.click(screen.getByRole("button", { name: "制作ロードマップを作る" }));
    expect(sessionStorage.getItem("gameai:project-idea")).toBe(idea);
    expect(push).toHaveBeenCalledWith("/project");
    const detail = (listener.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({
      name: "project_start",
      properties: { page: "/" },
    });
    expect(JSON.stringify(detail)).not.toContain("秘密の企画名");
    window.removeEventListener("gameai:event", listener);
  });

  it("shows inferred provenance, blocks unknown critical fields, then creates an actionable plan", async () => {
    sessionStorage.setItem(
      "gameai:project-idea",
      "2Dのモンスター収集ゲーム。iPhone向け。一人開発。月1万円以内。",
    );
    render(<ProjectGeneratorClient />);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /読み取った条件/ }),
      ).toBeTruthy(),
    );
    expect(screen.getAllByText("入力文に明記").length).toBeGreaterThan(3);
    fireEvent.click(screen.getByRole("button", { name: "Project Planを作る" }));
    expect(screen.getByRole("alert").textContent).toContain("制作経験");
    for (const button of screen.queryAllByRole("button", {
      name: "計画に含める",
    }))
      fireEvent.click(button);
    fireEvent.change(screen.getByLabelText(/制作経験/), {
      target: { value: "beginner" },
    });
    fireEvent.change(screen.getByLabelText(/利用目的/), {
      target: { value: "commercial" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Project Planを作る" }));
    expect(
      screen.getByRole("heading", { name: /今日やること/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "最初のプレイ可能範囲" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /モンスター3体と図鑑/ }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "プロンプトをコピー" })[0],
    ).toBeTruthy();
    expect(location.search).toContain("v=1");
  });

  it("surfaces contradictory text instead of silently selecting one value", async () => {
    sessionStorage.setItem(
      "gameai:project-idea",
      "2Dと3Dのどちらにするか未定。Steam向けホラー。",
    );
    render(<ProjectGeneratorClient />);
    const warning = await screen.findByRole("alert");
    expect(warning.textContent).toContain("複数の条件");
    expect(warning.textContent).toContain("2D / 3D");
    expect((screen.getByLabelText(/2D \/ 3D/) as HTMLSelectElement).value).toBe(
      "unknown",
    );
  });

  it("routes a shared draft with critical unknowns through clarification and preserves it on edit", async () => {
    const shared: ProjectBrief = {
      idea: "共有用Project Plan",
      genre: "horror",
      dimension: "3d",
      platform: "desktop",
      engine: "unity",
      budget: "unknown",
      experience: "intermediate",
      team: "solo",
      commercialIntent: "commercial",
      capabilities: ["coding", "assets-3d"],
      locale: "ja",
      details: [],
    };
    history.replaceState(null, "", `/project?${encodeProjectState(shared)}`);
    render(<ProjectGeneratorClient />);
    expect(
      await screen.findByRole("heading", { name: /読み取った条件/ }),
    ).toBeTruthy();
    expect(screen.getByText(/共有された構造化条件/)).toBeTruthy();
    expect((screen.getByLabelText(/予算/) as HTMLSelectElement).value).toBe(
      "unknown",
    );
    fireEvent.change(screen.getByLabelText(/予算/), {
      target: { value: "low" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Project Planを作る" }));
    expect(
      screen.getByRole("heading", { name: /今日やること/ }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "条件を編集" }));
    expect(
      (screen.getByLabelText(/ゲームエンジン/) as HTMLSelectElement).value,
    ).toBe("unity");
    expect((screen.getByLabelText(/予算/) as HTMLSelectElement).value).toBe(
      "low",
    );
  });

  it("requires an explicit decision for extracted game details and lets included text be corrected", async () => {
    sessionStorage.setItem(
      "gameai:project-idea",
      "Steam向け3Dホラー。Unity。中級。一人開発。低予算。商用。廃駅を舞台に、音を立てると盲目の怪物が追跡する。",
    );
    render(<ProjectGeneratorClient />);
    await screen.findByRole("heading", { name: /読み取った条件/ });
    const include = screen.getAllByRole("button", { name: "計画に含める" });
    expect(include.length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Project Planを作る" }));
    expect(screen.getByRole("alert").textContent).toContain("ゲーム固有情報");
    for (const button of include) fireEvent.click(button);
    const detail = screen.getAllByLabelText(
      "抽出した固有情報",
    )[0] as HTMLTextAreaElement;
    fireEvent.change(detail, { target: { value: "固".repeat(81) } });
    expect(detail.value).toHaveLength(80);
    fireEvent.change(detail, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Project Planを作る" }));
    expect(screen.getByRole("alert").textContent).toContain("1文字以上");
    expect(document.activeElement).toBe(detail);
    expect(detail.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(detail, {
      target: { value: "廃駅で、音を立てると盲目の怪物が追跡する" },
    });
    expect(detail.value).toContain("盲目の怪物");
    expect(
      screen.getByText(/アクセス解析・共有URLには含まれません/),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Project Planを作る" }));
    expect(
      screen.getByRole("heading", { name: /今日やること/ }),
    ).toBeTruthy();
    expect(location.search).not.toContain(encodeURIComponent("盲目の怪物"));
  });
});

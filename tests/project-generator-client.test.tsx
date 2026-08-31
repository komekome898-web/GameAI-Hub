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
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
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

  it("continues to the project route when session storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage) {
      if (this === window.sessionStorage) throw new Error("storage blocked");
    });
    render(<ProjectIdeaForm location="home" />);
    fireEvent.change(screen.getByLabelText(/どんなゲームを作りたいですか？/), {
      target: { value: "小さな2Dゲーム" },
    });
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "制作ロードマップを作る" })),
    ).not.toThrow();
    expect(push).toHaveBeenCalledWith("/project");
  });

  it("keeps the idea in memory when session storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage) {
      if (this === window.sessionStorage) throw new Error("storage blocked");
    });
    render(<ProjectIdeaForm location="home" />);
    fireEvent.change(screen.getByLabelText(/どんなゲームを作りたいですか？/), {
      target: { value: "スマートフォン向け2Dパズル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "制作ロードマップを作る" }));
    cleanup();
    render(<ProjectGeneratorClient />);
    expect(await screen.findByText("スマートフォン向け2Dパズル")).toBeTruthy();
  });

  it("collapses home examples until requested", () => {
    render(<ProjectIdeaForm location="home" />);
    const summary = screen.getByText("入力例を見る");
    expect(summary.closest("details")?.open).toBe(false);
    fireEvent.click(summary);
    expect(summary.closest("details")?.open).toBe(true);
    expect(screen.getAllByRole("button", { name: /モンスター収集|Steam向け3Dホラー|ビジュアルノベル/ })).toHaveLength(3);
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

  it("blocks implementation while the engine is unresolved and regenerates after adoption", async () => {
    const shared: ProjectBrief = {
      idea: "エンジン比較中の小規模ゲーム",
      genre: "puzzle",
      dimension: "2d",
      platform: "desktop",
      engine: "undecided",
      budget: "low",
      experience: "beginner",
      team: "solo",
      commercialIntent: "personal",
      capabilities: ["coding"],
      locale: "ja",
      details: [],
    };
    history.replaceState(null, "", `/project?${encodeProjectState(shared)}`);
    render(<ProjectGeneratorClient />);
    expect(await screen.findByRole("heading", { name: "実装前にゲームエンジンを決める" })).toBeTruthy();
    expect(screen.getAllByText("エンジン決定待ち").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "今回は保留する" }));
    expect(screen.getByRole("status").textContent).toContain("比較以外のQuestはブロック");
    fireEvent.change(screen.getByLabelText("採用候補"), { target: { value: "godot" } });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage) {
      if (this === window.localStorage) throw new Error("quota exceeded");
    });
    fireEvent.click(screen.getByRole("button", { name: "このエンジンを採用して計画を再生成" }));
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "実装前にゲームエンジンを決める" })).toBeNull(),
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Godot");
    expect(screen.getByText(/非公開下書きをこの端末に保存できませんでした/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Markdownを今すぐ保存" })).toBeTruthy();
  });

  it("deletes all local project data and keeps the live status outside the collapsed utility", async () => {
    const shared: ProjectBrief = {
      idea: "削除確認用ゲーム",
      genre: "puzzle",
      dimension: "2d",
      platform: "web",
      engine: "other",
      budget: "free",
      experience: "beginner",
      team: "solo",
      commercialIntent: "personal",
      capabilities: ["coding"],
      locale: "ja",
      details: [],
    };
    localStorage.setItem("gameai:project-private-draft:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "private");
    localStorage.setItem("gameai:build-progress:v2:test", "progress");
    sessionStorage.setItem("gameai:project-idea", "元の秘密文");
    history.replaceState(null, "", `/project?${encodeProjectState(shared)}`);
    render(<ProjectGeneratorClient />);
    await screen.findByRole("heading", { name: /今日やること/ });
    const summary = screen.getByText("共有・書き出し・条件編集");
    fireEvent.click(summary);
    fireEvent.click(screen.getByRole("button", { name: "この端末の非公開データをすべて削除" }));
    fireEvent.click(summary);
    expect(localStorage.getItem("gameai:project-private-draft:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBeNull();
    expect(localStorage.getItem("gameai:build-progress:v2:test")).toBeNull();
    expect(sessionStorage.getItem("gameai:project-idea")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("すべて削除しました");
  });
});

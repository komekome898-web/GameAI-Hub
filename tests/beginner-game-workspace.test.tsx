import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BeginnerGameWorkspace, makeGamePreview } from "@/components/BeginnerGameWorkspace";

const game = '<!doctype html><html><body><button>はじめる</button><script>window.gameStarted=true;</script></body></html>';

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

describe("beginner game isolation and recovery", () => {
  it("places supplied HTML only in an opaque sandbox after an explicit action", async () => {
    render(<BeginnerGameWorkspace projectId="a" />);
    await waitFor(() => expect(screen.getByLabelText("ゲームのコード")).toBeTruthy());
    fireEvent.change(screen.getByLabelText("ゲームのコード"), { target: { value: game } });
    expect(screen.queryByTitle("作ったゲームの動作確認")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "ゲームを表示" }));
    const frame = await screen.findByTitle("作ったゲームの動作確認");
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame.getAttribute("srcdoc")).toContain("connect-src 'none'");
    expect(frame.getAttribute("srcdoc")).toContain("form-action 'none'");
    expect(screen.queryByRole("button", { name: "はじめる" })).toBeNull();
  });

  it("puts restrictive CSP before attacker scripts and removes refresh/base/embedded frames", () => {
    const html = makeGamePreview('<meta http-equiv="refresh" content="0;url=https://example.test"><meta http-equiv="Content-Security-Policy" content="default-src *"><base href="https://example.test"><iframe src="https://example.test"></iframe><script>fetch("https://example.test")</script>');
    const parsed = new DOMParser().parseFromString(html, "text/html");
    expect(parsed.head.firstElementChild?.getAttribute("http-equiv")).toBe("Content-Security-Policy");
    expect(parsed.querySelectorAll("meta[http-equiv]")).toHaveLength(1);
    expect(parsed.querySelector("base,iframe,object,embed")).toBeNull();
    expect(parsed.head.firstElementChild?.getAttribute("content")).toContain("default-src 'none'");
    expect(parsed.head.firstElementChild?.getAttribute("content")).not.toContain("'unsafe-eval'");
  });

  it("restores saved source without running it and keeps projects separate", async () => {
    localStorage.setItem("gameai:beginner-game:v1:a", JSON.stringify({ code: game, working: game }));
    const { rerender } = render(<BeginnerGameWorkspace projectId="a" />);
    await waitFor(() => expect((screen.getByLabelText("ゲームのコード") as HTMLTextAreaElement).value).toBe(game));
    expect(screen.queryByTitle("作ったゲームの動作確認")).toBeNull();
    rerender(<BeginnerGameWorkspace projectId="b" />);
    await waitFor(() => expect((screen.getByLabelText("ゲームのコード") as HTMLTextAreaElement).value).toBe(""));
    expect(localStorage.getItem("gameai:beginner-game:v1:a")).toContain("はじめる");
  });

  it("allows preview when storage fails and makes the loss risk visible", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    render(<BeginnerGameWorkspace projectId="a" initialCode={game} />);
    await waitFor(() => expect((screen.getByRole("button", { name: "ゲームを表示" }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: "ゲームを表示" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByTitle("作ったゲームの動作確認")).toBeTruthy();
  });

  it("keeps the user-confirmed working version when a later game is previewed", async () => {
    render(<BeginnerGameWorkspace projectId="a" initialCode={game} />);
    await waitFor(() => expect((screen.getByRole("button", { name: "ゲームを表示" }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: "ゲームを表示" }));
    fireEvent.click(screen.getByRole("button", { name: "この版は動いたと記録" }));
    fireEvent.change(screen.getByLabelText("ゲームのコード"), { target: { value: "<html><body>変更後</body></html>" } });
    fireEvent.click(screen.getByRole("button", { name: "ゲームを表示" }));
    fireEvent.click(screen.getByRole("button", { name: "動いた版へ戻す" }));
    expect((screen.getByLabelText("ゲームのコード") as HTMLTextAreaElement).value).toBe(game);
    expect(screen.getByTitle("作ったゲームの動作確認").getAttribute("srcdoc")).toContain("はじめる");
  });

  it("loads a saved HTML file without executing it until the preview action", async () => {
    render(<BeginnerGameWorkspace projectId="a" />);
    await waitFor(() => expect(screen.getByLabelText("ゲームのコード")).toBeTruthy());
    const file = new File([game], "index.html", { type: "text/html" });
    Object.defineProperty(file, "text", { value: async () => game });
    fireEvent.change(screen.getByLabelText("保存したゲームを開く"), { target: { files: [file] } });
    await waitFor(() => expect((screen.getByLabelText("ゲームのコード") as HTMLTextAreaElement).value).toBe(game));
    expect(screen.queryByTitle("作ったゲームの動作確認")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "ゲームを表示" }));
    expect(screen.getByTitle("作ったゲームの動作確認")).toBeTruthy();
  });
});

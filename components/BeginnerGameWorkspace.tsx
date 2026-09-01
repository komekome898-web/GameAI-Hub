"use client";

import { useEffect, useId, useRef, useState } from "react";

const maxCodeLength = 500_000;
const storagePrefix = "gameai:beginner-game:v1:";
const previewPolicy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; connect-src 'none'; font-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; form-action 'none'; base-uri 'none'; navigate-to 'none'";

/** Never inject game markup into the host. The iframe retains an opaque origin.
 * CSP blocks resource requests, while sandbox blocks top navigation/popups/forms.
 * navigate-to is defense in depth only: browsers do not uniformly enforce it.
 */
export function makeGamePreview(code: string): string {
  const document = new DOMParser().parseFromString(code, "text/html");
  document.querySelectorAll("base, meta[http-equiv], iframe, frame, object, embed").forEach(node => node.remove());
  const policy = document.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  policy.content = previewPolicy;
  document.head.prepend(policy);
  const viewport = document.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  document.head.append(viewport);
  const navigationGuard = document.createElement("script");
  navigationGuard.textContent = "document.addEventListener('click',function(event){if(event.target instanceof Element && event.target.closest('a'))event.preventDefault()},true);document.addEventListener('submit',function(event){event.preventDefault()},true);";
  policy.after(navigationGuard);
  return `<!doctype html>\n${document.documentElement.outerHTML}`;
}

function cleanCode(value: string) {
  return value.trim().replace(/^```(?:html)?\s*\n/i, "").replace(/\n```\s*$/, "").trim();
}

export function BeginnerGameWorkspace({ projectId, initialCode = "" }: { projectId: string; initialCode?: string }) {
  const editorId = useId();
  const fileId = useId();
  const [code, setCode] = useState(initialCode);
  const [preview, setPreview] = useState<{ code: string; html: string } | null>(null);
  const [previous, setPrevious] = useState("");
  const [working, setWorking] = useState("");
  const [status, setStatus] = useState("");
  const [storageWarning, setStorageWarning] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [revision, setRevision] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const storageKey = `${storagePrefix}${projectId}`;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setCode(initialCode); setPreview(null); setPrevious(""); setWorking(""); setStatus(""); setStorageWarning("");
      try {
        const raw = localStorage.getItem(storageKey);
        const saved: unknown = raw ? JSON.parse(raw) : null;
        if (saved && typeof saved === "object" && "code" in saved && typeof saved.code === "string" && saved.code.length <= maxCodeLength) {
          setCode(saved.code);
          if ("working" in saved && typeof saved.working === "string" && saved.working.length <= maxCodeLength) setWorking(saved.working);
          setStatus("前に表示したコードを戻しました。「ゲームを表示」で開けます。");
        }
      } catch {
        setStorageWarning("この端末のコード保存を利用できません。動作を確認したら「index.htmlを保存」で残してください。");
      }
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [storageKey, initialCode]);

  function persist(nextCode: string, nextWorking: string) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ code: nextCode, working: nextWorking }));
      setStorageWarning("");
    } catch {
      setStorageWarning("この端末にコードを保存できませんでした。「index.htmlを保存」で残してください。");
    }
  }

  function showGame(value = code) {
    const nextCode = cleanCode(value);
    if (!nextCode || nextCode.length > maxCodeLength || !/<(?:!doctype\s+html|html|body|canvas|div|main|script)\b/i.test(nextCode)) {
      setStatus("AIが返したHTMLコードを、最初から最後まで貼ってください（500KB以内）。");
      return;
    }
    if (preview && preview.code !== nextCode) setPrevious(preview.code);
    setCode(nextCode);
    setPreview({ code: nextCode, html: makeGamePreview(nextCode) });
    setRevision(value => value + 1);
    persist(nextCode, working);
    setStatus("下にゲームを表示しました。操作して、完了条件を確認してください。");
    requestAnimationFrame(() => frameRef.current?.scrollIntoView?.({ block: "nearest" }));
  }

  function downloadGame() {
    if (!preview) return;
    const href = URL.createObjectURL(new Blob([preview.code], { type: "text/html;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = href; anchor.download = "index.html";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    setStatus("index.html の保存を開始しました。スマホではダウンロード先や「ファイル」アプリを確認してください。");
  }

  async function openFile(file: File | undefined) {
    if (!file) return;
    if (file.size > maxCodeLength || !/\.html?$/i.test(file.name)) {
      setStatus("保存した .html ファイルを選んでください（500KB以内）。"); return;
    }
    try {
      setCode(await file.text());
      setStatus("保存したコードを読み込みました。「ゲームを表示」で動作を確認してください。");
    } catch {
      setStatus("ファイルを読み込めませんでした。もう一度ファイルを選んでください。");
    }
  }

  return <section className="beginner-workspace" aria-labelledby={`${editorId}-title`}>
    <h3 id={`${editorId}-title`}>ここでゲームを動かす</h3>
    <p>AIが返したコードを全部貼り、「ゲームを表示」を押します。スマホでも、この下で遊べます。</p>
    <label htmlFor={editorId}>ゲームのコード</label>
    <textarea id={editorId} className="beginner-code-editor" value={code} rows={7} wrap="soft" spellCheck={false} maxLength={maxCodeLength} onChange={event => setCode(event.target.value)} placeholder="AIの回答のコード部分を、最初から最後まで貼る" />
    <div className="beginner-workspace-actions">
      <button type="button" className="button" disabled={!loaded || !code.trim()} onClick={() => showGame()}>ゲームを表示</button>
      <button type="button" disabled={!preview} onClick={downloadGame}>index.htmlを保存</button>
    </div>
    <label className="beginner-file-label" htmlFor={fileId}>保存したゲームを開く</label>
    <input id={fileId} className="beginner-game-file" type="file" accept=".html,.htm,text/html" onChange={event => { void openFile(event.target.files?.[0]); event.target.value = ""; }} />
    <p className="beginner-workspace-status" role="status" aria-live="polite">{status}</p>
    {storageWarning && <p className="beginner-workspace-warning" role="alert">{storageWarning}</p>}
    {preview && <div className="beginner-game-preview">
      <iframe key={revision} ref={frameRef} title="作ったゲームの動作確認" srcDoc={preview.html} sandbox="allow-scripts" referrerPolicy="no-referrer" allow="camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'; clipboard-read 'none'; clipboard-write 'none'" />
      <p>ゲーム内のボタンを押して確認してください。画面が変わらない場合は、上の「ここで詰まった」で相談できます。</p>
      <button type="button" onClick={() => { setWorking(preview.code); persist(preview.code, preview.code); setStatus("動いた版として記録しました。次の変更で困ったら戻せます。"); }}>この版は動いたと記録</button>
    </div>}
    {(previous || working) && <div className="beginner-workspace-recovery">
      {previous && <button type="button" onClick={() => showGame(previous)}>前に表示したコードへ戻す</button>}
      {working && <button type="button" onClick={() => showGame(working)}>動いた版へ戻す</button>}
    </div>}
  </section>;
}

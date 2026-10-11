"use client";

import { useId, useState } from "react";
import { BeginnerGameWorkspace } from "@/components/BeginnerGameWorkspace";
import { htmlGameDebugExamples } from "@/data/html-game-debug-examples";

export function HtmlGameDebugDemo() {
  const selectId = useId();
  const switchHelpId = `${selectId}-switch-help`;
  const [selected, setSelected] = useState("original");
  const example = htmlGameDebugExamples.find((item) => item.id === selected)!;

  return (
    <div>
      <p id={switchHelpId}>例を切り替えると、まだ実行していない編集は消えます。編集を残すには、切り替える前に「ゲームを表示」を押してください。ファイルにも残すなら「index.htmlを保存」を押してください。</p>
      <label htmlFor={selectId}>試す例を選ぶ</label>{" "}
      <select id={selectId} aria-describedby={switchHelpId} value={selected} onChange={(event) => setSelected(event.target.value)} style={{ width: "100%", minWidth: 0 }}>
        {htmlGameDebugExamples.map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      <p>{example.note}</p>
      <p>「ゲームを表示」で実行します。この端末の保存を利用できる場合、前に実行したコードが戻ります。掲載例を試すには「掲載完成例へ戻す」から再表示してください。</p>
      <p>下のボタンが隠れたら、ゲームの表示枠の中を下へスクロールしてください。</p>
      <p>このページに「ここで詰まった」ボタンはありません。相談するときは、表示されたエラーを自分でコピーし、<a href="#ask-ai">AIへの相談例</a>に添えてください。</p>
      <BeginnerGameWorkspace
        key={selected}
        projectId={`article-html-game-debug-${selected}`}
        initialCode={example.code}
        helpMode="copy"
      />
    </div>
  );
}

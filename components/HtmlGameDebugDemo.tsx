"use client";

import { useId, useState } from "react";
import { BeginnerGameWorkspace } from "@/components/BeginnerGameWorkspace";
import { htmlGameDebugExamples } from "@/data/html-game-debug-examples";

export function HtmlGameDebugDemo() {
  const selectId = useId();
  const [selected, setSelected] = useState("original");
  const example = htmlGameDebugExamples.find((item) => item.id === selected)!;

  return (
    <div>
      <label htmlFor={selectId}>試す例を選ぶ</label>{" "}
      <select id={selectId} value={selected} onChange={(event) => setSelected(event.target.value)} style={{ width: "100%", minWidth: 0 }}>
        {htmlGameDebugExamples.map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      <p>{example.note}</p>
      <p>「ゲームを表示」で実行します。例を切り替えると、その例で前に編集したコードが戻る場合があります。掲載例を試すには「掲載完成例へ戻す」から再表示してください。</p>
      <p>下のボタンが隠れたら、ゲームの表示枠の中を下へスクロールしてください。</p>
      <BeginnerGameWorkspace
        key={selected}
        projectId={`article-html-game-debug-${selected}`}
        initialCode={example.code}
      />
    </div>
  );
}

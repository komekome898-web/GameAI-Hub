"use client";
import { useState } from "react";

export function CopyTextButton({
  text,
  label = "コピー",
}: {
  text: string;
  label?: string;
}) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("コピーしました。");
    } catch {
      setMessage("コピーできませんでした。文章を長押しして選択してください。");
    }
  }
  return (
    <span className="copy-text-control">
      <button type="button" onClick={() => void copy()}>
        {label}
      </button>
      {message && <small role="status">{message}</small>}
    </span>
  );
}

import { describe, expect, it } from "vitest";
import { safeProjectReturn } from "@/lib/safe-project-return";

describe("safeProjectReturn", () => {
  it.each([
    "/project",
    "/project?source=guide",
    "/project#quest-core-loop",
    "/project?source=guide#quest-core-loop",
  ])("retains an internal Project target: %s", (value) => {
    expect(safeProjectReturn(value)).toBe(value);
  });

  it.each([
    "https://evil.example/project",
    "//evil.example/project",
    "javascript:alert(1)",
    "data:text/html,test",
    "/project\\evil",
    "/project-elsewhere",
    ["/project"],
    undefined,
  ])("rejects an external or malformed target: %s", (value) => {
    expect(safeProjectReturn(value)).toBeNull();
  });
});

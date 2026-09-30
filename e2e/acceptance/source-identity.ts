import { execFileSync } from "node:child_process";

export type SourceIdentity = {
  kind: "clean-git-checkpoint";
  sha: string;
  status: "clean";
};

/** Evidence is attributable only to an exact, clean source checkpoint. */
export function cleanSourceIdentity(): SourceIdentity {
  const sha = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const status = execFileSync(
    "git",
    ["status", "--porcelain", "--untracked-files=all", "--", ".", ":(exclude)docs/screenshots/issue-157-stage-b"],
    { encoding: "utf8" },
  ).trim();
  if (status) {
    throw new Error(
      `evidence requires a clean source checkpoint; commit or restore:\n${status}`,
    );
  }
  return { kind: "clean-git-checkpoint", sha, status: "clean" };
}

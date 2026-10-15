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
    // Browser suites may leave durable PNG/JSON diagnostics anywhere under the
    // repository's established screenshot tree. They are outputs, not source.
    // Keep every other tracked/untracked path in the identity check so a real
    // application, test, or documentation edit still prevents attribution to
    // the current checkpoint.
    ["status", "--porcelain", "--untracked-files=all", "--", ".", ":(exclude)docs/screenshots/**"],
    { encoding: "utf8" },
  ).trim();
  if (status) {
    throw new Error(
      `evidence requires a clean source checkpoint; commit or restore:\n${status}`,
    );
  }
  return { kind: "clean-git-checkpoint", sha, status: "clean" };
}

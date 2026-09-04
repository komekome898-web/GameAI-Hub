/** Accept only the Project route on this origin. Query and fragment state are retained. */
export function safeProjectReturn(
  value: string | string[] | undefined,
): string | null {
  if (typeof value !== "string" || value.length > 2_000) return null;
  if (!/^\/project(?:[?#][^\r\n\\]*)?$/.test(value)) return null;
  return value;
}

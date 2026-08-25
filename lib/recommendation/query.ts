import { defaultProjectInput, ProjectInputSchema, type ProjectInput } from '@/lib/domain';

const arrayFields = new Set(['assetRequirements']);
const MAX_QUERY_LENGTH = 2048;
const MAX_FIELD_LENGTH = 64;

export function encodeProjectInput(input: ProjectInput): string {
  const value = ProjectInputSchema.parse(input);
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(value)) {
    params.set(key, Array.isArray(item) ? item.join(',') : item);
  }
  return params.toString();
}

/** Malformed or partial URLs never throw; valid fields are retained and the rest use defaults. */
export function decodeProjectInput(query: string | URLSearchParams, base:ProjectInput=defaultProjectInput): ProjectInput {
  if ((typeof query === 'string' ? query : query.toString()).length > MAX_QUERY_LENGTH) return ProjectInputSchema.parse(base);
  const params = typeof query === 'string'
    ? new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
    : query;
  const candidate: Record<string, unknown> = { ...base };
  for (const key of Object.keys(defaultProjectInput)) {
    const raw = params.get(key);
    if (raw !== null && raw.length <= MAX_FIELD_LENGTH) candidate[key] = arrayFields.has(key) ? raw.split(',').filter(Boolean).slice(0,4) : raw;
  }
  const parsed = ProjectInputSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  // Reject only invalid fields rather than discarding an otherwise useful shared configuration.
  const repaired: Record<string, unknown> = { ...candidate };
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string') repaired[key] = base[key as keyof ProjectInput];
  }
  return ProjectInputSchema.parse(repaired);
}

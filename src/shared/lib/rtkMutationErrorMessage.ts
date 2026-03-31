export function rtkMutationErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === 'object' && e !== null) {
    const o = e as Record<string, unknown>;
    if (typeof o.data === 'string') return o.data;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

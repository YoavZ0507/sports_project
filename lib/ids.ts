export function createId(prefix: string): string {
  const segment = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${segment}`;
}

export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

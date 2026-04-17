/** Keeps first occurrence of each lowercase meaning; stable order. */
export function dedupeMeaningsPreservingOrder(meanings: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const meaning of meanings) {
    const key = meaning.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(meaning);
  }
  return out;
}

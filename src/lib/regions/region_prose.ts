/** Sentence case changes only the initial character, preserving literal names within text. */
export function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Compound compass adjectives share the same policy for patches and individual sites. */
export function compassPosition(x: number, y: number): string {
  const vertical = y < 1 / 3 ? 'north' : y > 2 / 3 ? 'south' : '';
  const horizontal = x < 1 / 3 ? 'west' : x > 2 / 3 ? 'east' : '';
  return vertical || horizontal ? `${vertical}${horizontal}ern` : 'central';
}

/** Split only the explicit stored hook marker; never recase saved or authored prose. */
export function regionHook(text: string): { body: string; hook?: string } {
  const index = text.indexOf(' Hook:');
  return index < 0
    ? { body: text }
    : { body: text.slice(0, index), hook: text.slice(index + ' Hook:'.length).trim() };
}

export const REGION_HOOK_SECTIONS = ['Travel', 'Notable places', 'Hazards'];

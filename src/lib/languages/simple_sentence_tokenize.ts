/** Splits on whitespace and strips common surrounding punctuation from each token. */
export function tokenizeSimpleSentence(sentence: string): string[] {
  return sentence
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[\u2026"'([«]+/, '').replace(/[.,!?;:"')\]»]+$/, ''))
    .filter((token) => token.length > 0);
}

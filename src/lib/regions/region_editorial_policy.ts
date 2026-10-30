/** Count rendered sentences, including any retained qualification in a generated adapter. */
export const editorialSentenceCount = (text: string) => text.match(/[.!?](?:\s|$)/g)?.length ?? 1;

/**
 * Known generated qualification clauses belong to the same assertion. Join them without
 * discarding limitations or changing proper names; arbitrary saved/authored prose is never passed
 * here. Unrecognized multi-sentence options are omitted by the adapter's one-sentence contract.
 */
export function editorialSingleSentence(text: string): string {
  return text.replace(
    /\.\s+(The work |Local sources |Potential sources |Using them |Bringing goods |Acquisition |Inputs brought |Freezing temperatures )/g,
    (_match, clause: string) => `; ${clause.charAt(0).toLowerCase()}${clause.slice(1)}`,
  );
}

import type { WordOrder } from './language_types.js';

export type ClauseConstituent = 'subject' | 'verb' | 'object';

export function getClauseConstituentOrderForWordOrder(wordOrder: WordOrder): ClauseConstituent[] {
  const byOrder: Record<WordOrder, ClauseConstituent[]> = {
    SVO: ['subject', 'verb', 'object'],
    SOV: ['subject', 'object', 'verb'],
    VSO: ['verb', 'subject', 'object'],
    VOS: ['verb', 'object', 'subject'],
    OVS: ['object', 'verb', 'subject'],
    OSV: ['object', 'subject', 'verb'],
  };
  return byOrder[wordOrder];
}

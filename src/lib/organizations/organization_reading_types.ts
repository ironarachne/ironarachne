import type { NarrativeCandidate, NarrativeContext, NarrativeSelection } from '$lib/narrative';

export type OrganizationReadingSubject = { id: string; candidates: NarrativeCandidate[] };
export type OrganizationReadingResult = {
  text: string;
  selections: NarrativeSelection[];
  nextContext: NarrativeContext;
};

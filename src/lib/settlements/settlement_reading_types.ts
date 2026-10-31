import type { NarrativeCandidate, NarrativeResult } from '$lib/narrative';

export type SettlementPortraitSubject = { id: string; candidates: NarrativeCandidate[] };
export type SettlementPortraitResult = NarrativeResult;

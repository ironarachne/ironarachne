import type { FactReason, SettlementTarget } from './region_fact_types';
import type {
  RegionEditorialCandidate,
  RegionEditorialObservation,
  RegionGazetteerSentence,
} from './region_editorial_types';

export type RegionNotableSubject =
  | { kind: 'settlement'; target: SettlementTarget }
  | { kind: 'fact'; factId: string };
export type RegionNotableHeadingKind =
  | 'settlement-approach'
  | 'place'
  | 'road-river-meeting'
  | 'hazard';
export type RegionNotableNameObservation = {
  kind: 'notable-name';
  subject: RegionNotableSubject;
  observedName: string;
};
export type RegionAdventurePrompt = { familyId: string; sentence: RegionGazetteerSentence };
export type RegionNotableReading = {
  notableId: string;
  headingKind: RegionNotableHeadingKind;
  subject?: RegionNotableSubject;
  reason: FactReason;
  observations: RegionEditorialObservation[];
  prompt?: RegionAdventurePrompt;
};
export type RegionNotablePromptCandidate = {
  notableId: string;
  familyId: string;
  editorial: RegionEditorialCandidate;
};

/** Explicit resolved artifact names; never populated by reading another vault implicitly. */
export type RegionNotableReferenceContext = Readonly<Record<string, string>>;

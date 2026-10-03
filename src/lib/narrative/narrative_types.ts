/** Transient inputs; domain adapters own eligibility and comparisons against similar subjects. */
export type NarrativeImportance = 'defining' | 'distinctive' | 'supporting';
export type NarrativePart = { id: string; options: string[] };
export type NarrativeTemplate = { id: string; parts: NarrativePart[] };
export type NarrativeCandidate = {
  id: string;
  topic: string;
  importance: NarrativeImportance;
  sourceIds: string[];
  templates: NarrativeTemplate[];
};
export type NarrativeSubject = { id: string; kind: string; candidates: NarrativeCandidate[] };
export type NarrativePolicy = {
  maxSentences: number;
  maxPerTopic: number;
  repetitionWindow: number;
};
export type NarrativeSelection = {
  subjectId: string;
  candidateId: string;
  templateId: string;
  optionIndexes: number[];
};
export type NarrativeContext = { recentSelections: NarrativeSelection[] };
export type NarrativeResult = {
  text: string;
  selections: NarrativeSelection[];
  nextContext: NarrativeContext;
};

/** User/config input; `random` picks at generation time. */
export type PolytheisticStandingMode = 'random' | 'egalitarian' | 'hierarchical' | 'balanced';

/** Resolved stance used in narrative (after resolving `random` and config). */
export type ResolvedPolytheisticStanding = 'egalitarian' | 'hierarchical' | 'balanced';

/** How many spirit orders / intermediate beings populate the cosmos around the high gods. */
export type SpiritCosmologyDepthMode = 'random' | 'none' | 'shallow' | 'moderate' | 'deep';

export type SpiritEchelonKind =
  | 'messenger_host'
  | 'rebel_host'
  | 'nature_spirit'
  | 'ancestor_presence'
  | 'exalted_exemplar'
  | 'psychopomp'
  | 'tutelary';

export type SpiritEchelon = {
  kind: SpiritEchelonKind;
  /** Plain-language label, e.g. "choirs of messengers". */
  label: string;
  /** Nested grades or courts said to exist within this order (1–3). */
  rankDepth: number;
  summary: string;
};

export type ReligionCosmology = {
  echelons: SpiritEchelon[];
  summary: string;
};

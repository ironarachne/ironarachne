export type NonTheisticReligionDetail = {
  /** Matches `ReligionCategory.name` for the drawn category. */
  categoryName: string;
  /** Stable ids for tooling (snake_case); prose uses curated phrases in `narrativeSummary`. */
  spiritDomains: string[];
  /** Stable ids for recurring duties; prose uses curated phrases in `narrativeSummary`. */
  obligationCycles: string[];
  /** Who negotiates the unseen (labels, not personal names). */
  mediationRoles: string[];
  /** One or two sentences on how mediation works. */
  mediationSummary: string;
  /** Purity, pollution, avoidance, or restoration logic. */
  pollutionOrPurityNotes: string;
  /** Full prose block composed for the main religion description. */
  narrativeSummary: string;
};

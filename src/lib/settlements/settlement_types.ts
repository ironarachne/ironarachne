import type * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';
import type { Character, CharacterGenerationConfig } from '$lib/characters';
import type { Environment } from '$lib/environment';
import type { Organization } from '$lib/organizations';
import type { Vertex } from '$lib/geometry';

/**
 * One row in the settlement size table (village, town, city, …).
 */
export type SettlementCategory = {
  name: string;
  minSize: number;
  maxSize: number;
  sizeClass: string;
  possibleDescriptions: string[];
};

/**
 * Coarse economic posture for trade blurbs, org filtering, and future simulation hooks.
 */
export type SettlementEconomicRole = 'agrarian' | 'market' | 'industrial' | 'extractive' | 'mixed';

export type SettlementProblem = {
  kind: 'acute' | 'creeping';
  summary: string;
  detail?: string;
};

/**
 * A named local role + generated NPC after civic mutators (title, archetype, redescribed).
 */
export type SettlementImportantPerson = {
  character: Character;
  roleId: string;
  /**
   * Gender-appropriate civic title from the role (via {@link getTitle} after mutators), e.g. "Mayor".
   */
  roleDisplay: string;
  /** Why this person matters in the settlement. */
  importance: string;
  salientPersonality: string[];
  salientPhysical: string[];
};

/**
 * Enrichment: organizations, trade lists, problems, and notables. All off unless explicitly enabled.
 */
export type SettlementEnrichmentConfig = {
  /** When true, generate N organizations; requires a character source (config or default fantasy org config). */
  includeOrganizations?: boolean;
  /** Defaults to { min: 1, max: 2 } when `includeOrganizations` is true. */
  organizationCount?: { min: number; max: number };
  /** Used for `generateOrganization`; defaults to `fantasy` to match region generation. */
  genre?: 'fantasy' | 'science_fiction' | 'any';
  /** Narrative import/export lists and trade blurb. */
  includeTrade?: boolean;
  includeProblems?: boolean;
  /** Counts of acute (immediate) problems; default { min: 1, max: 2 } when includeProblems. */
  acuteProblemCount?: { min: number; max: number };
  /** Counts of creeping (slow) problems; default { min: 1, max: 2 } when includeProblems. */
  creepingProblemCount?: { min: number; max: number };
  /** When set with min/max both 0, skips notables. Otherwise needs `characterConfig` or falls back to default fantasy character config. */
  importantCharacterCount?: { min: number; max: number };
  /**
   * Used for notables and organizations. If missing, org/notable steps use
   * `getDefaultOrganizationCharacterConfig` / `getDefaultCharacterGenerationConfig` with `seedPrefix`.
   */
  characterConfig?: CharacterGenerationConfig;
  /** Prefixes RNG / character / org generation seeds. */
  seedPrefix?: string;
};

export type SettlementSizeFilter = 'small' | 'medium' | 'large' | 'any';

export type SettlementGeneratorConfig = {
  environment: Environment;
  nameGenerator: MUN.NameGenerator | null;
  /** Which `sizeClass` values to draw categories from. Use `any` for all listed categories. */
  size: SettlementSizeFilter;
  rng: RNG;
  /** Optional: trade, orgs, problems, VIPs. */
  enrichment?: SettlementEnrichmentConfig;
};

/**
 * A populated place: narrative description plus structured fields for later rules and UI.
 */
export type Settlement = {
  name: string;
  description: string;
  category: SettlementCategory;
  population: number;
  /** Typically 2–12 from 2d6 in core generation. */
  prosperity: number;
  environment: Environment;
  location?: Vertex;
  mapNodeId?: number;

  /** 0–10; derived in `generate` from prosperity, size, and environment. */
  lawAndOrder: number;
  commerce: number;
  foodSecurity: number;
  publicHealth: number;
  /** Tags for hooks (e.g. river_trade, highland). */
  settlementTags: string[];
  economicRole: SettlementEconomicRole;

  primaryImports?: string[];
  primaryExports?: string[];
  tradeBlurb?: string;
  acuteProblems?: SettlementProblem[];
  creepingProblems?: SettlementProblem[];
  organizations?: Organization[];
  importantPeople?: SettlementImportantPerson[];
};

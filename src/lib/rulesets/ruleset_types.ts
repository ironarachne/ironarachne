import type { GameSystem } from '$lib/tools';
import type { RNG } from '@ironarachne/rng';

/** Rulesets this build may author. Stored values still cross a runtime validation boundary. */
export const RULESET_IDS = ['ironarachne', 'adnd-2e', 'dcc', 'dnd-5e'] as const;

export type RulesetId = (typeof RULESET_IDS)[number];

export const MECHANICS_SUBJECTS = ['actor', 'item', 'potion', 'spell', 'hoard'] as const;

export type MechanicsSubject = (typeof MECHANICS_SUBJECTS)[number];

export const MECHANICS_ORIGINS = ['migrated', 'generated', 'user'] as const;

export type MechanicsOrigin = (typeof MECHANICS_ORIGINS)[number];

export const RULESET_CAPABILITIES = [
  ...MECHANICS_SUBJECTS,
  'currency',
  'equipment',
  'treasure-items',
] as const;

export type RulesetCapability = (typeof RULESET_CAPABILITIES)[number];

/** Stable identity for one compatible rules-data release. `release` is never a floating alias. */
export type RulesetRef = {
  id: RulesetId;
  release: string;
};

export const CONTENT_SCOPES = ['mechanics', 'open-content', 'permission', 'original'] as const;

export type ContentScope = (typeof CONTENT_SCOPES)[number];

export type LicenseGrant = {
  id: string;
  name: string;
  url?: string;
  scope: ContentScope;
  notice: string;
};

/** One exact source of rules data, rather than a licence claim about a whole game. */
export type RulesDataSource = {
  id: string;
  title: string;
  version: string;
  publisher: string;
  url?: string;
  grant: LicenseGrant;
  attribution: string;
  redistributable: true;
};

export type RulesetDescriptor = {
  ref: RulesetRef;
  displayName: string;
  gameSystem?: GameSystem;
  capabilities: RulesetCapability[];
  sourceIds: string[];
};

/** The rules-owned portion of an otherwise shared entity. */
export type QualifiedMechanics = {
  ruleset: RulesetRef;
  subject: MechanicsSubject;
  schemaVersion: number;
  origin: MechanicsOrigin;
  sourceIds: string[];
  payload: unknown;
};

export type MechanicsSet = {
  variants: QualifiedMechanics[];
};

export type MechanicsPresentation = {
  title?: string;
  lines: string[];
};

export type CurrencyDenominationDefinition = {
  id: string;
  name: string;
  symbol?: string;
  value: number;
  weight?: number;
};

export type CurrencyDefinition = {
  baseDenominationId: string;
  denominations: CurrencyDenominationDefinition[];
};

export type RulesNeutralItem = {
  id: string;
  name: string;
  description: string;
  weight: number;
};

export type MechanicsCodec = {
  schemaVersion: (subject: MechanicsSubject) => number | undefined;
  validate: (
    subject: MechanicsSubject,
    payload: unknown,
    schemaVersion: number,
  ) => RulesetResult<unknown>;
  migrate: (
    subject: MechanicsSubject,
    payload: unknown,
    fromVersion: number,
  ) => RulesetResult<unknown>;
  present: (subject: MechanicsSubject, payload: unknown) => MechanicsPresentation;
};

export type CurrencyRules = {
  definition: CurrencyDefinition;
  format: (amount: number, denominationId: string) => string;
};

export type EquipmentRules = {
  validateItem: (payload: unknown) => RulesetResult<unknown>;
  presentItem: (payload: unknown) => MechanicsPresentation;
};

export type TreasureItemRules<TContext = unknown> = {
  derive: (
    item: Readonly<RulesNeutralItem>,
    existing: Readonly<MechanicsSet>,
    context: TContext,
    rng: RNG,
  ) => RulesetResult<QualifiedMechanics>;
};

/**
 * Runtime behavior for one release. Optional services must agree exactly with the descriptor's
 * capabilities; a catalog entry may exist before all of its mechanics do.
 */
export type RulesetDefinition = {
  descriptor: RulesetDescriptor;
  mechanics?: MechanicsCodec;
  currency?: CurrencyRules;
  equipment?: EquipmentRules;
  treasureItems?: TreasureItemRules;
};

export type RulesetFailureReason =
  | 'unknown-ruleset'
  | 'unknown-release'
  | 'unsupported-capability'
  | 'invalid-mechanics'
  | 'unsupported-version'
  | 'migration-failed'
  | 'variant-conflict'
  | 'unknown-source'
  | 'ruleset-load-failed';

export type RulesetResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: RulesetFailureReason; message: string };

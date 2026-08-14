import type { Container, Item, Rarity } from '$lib/equipment';
import type { Duration, Element, MagicIntent, MagicSphere } from '$lib/magic';

export type PotionForm = 'drink' | 'oil' | 'ointment';

export type ResistanceDamageType =
  | 'acid'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'thunder';

export type PotionEffectParameters =
  | { kind: 'healing'; dice: string }
  | { kind: 'strength'; score: number; giantType: string }
  | { kind: 'resistance'; damageType: ResistanceDamageType }
  | { kind: 'spell'; spellName: string; saveDc?: number }
  | { kind: 'bonus'; description: string }
  | { kind: 'homebrew'; tier: number };

export type PotionEffect = {
  id: string;
  name: string;
  description: string;
  duration: Duration;
  intent: MagicIntent;
  elements?: Element[];
  spheres?: MagicSphere[];
  magnitude: number;
  statOffsets?: Record<string, number>;
  parameters?: PotionEffectParameters;
};

export type PotionSensoryProfile = {
  appearance: string;
  viscosity: string;
  flavor: string;
  scent: string;
};

export type PotionSensoryHints = {
  colors?: string[];
  viscosities?: string[];
  flavors?: string[];
  scents?: string[];
  appearances?: string[];
};

export type PotionCatalogVariant = {
  id: string;
  suffix: string;
  rarity: Rarity;
  baseValue: number;
  magnitude: number;
  parameters?: PotionEffectParameters;
  statOffsets?: Record<string, number>;
  duration?: Duration;
};

export type PotionEffectTemplate = {
  description: string;
  duration: Duration;
  intent: MagicIntent;
  elements?: Element[];
  spheres?: MagicSphere[];
  magnitude: number;
  statOffsets?: Record<string, number>;
  parameters?: PotionEffectParameters;
};

export type PotionCatalogEntry = {
  id: string;
  canonicalName: string;
  rarity: Rarity;
  baseValue: number;
  form: PotionForm;
  effectTemplate: PotionEffectTemplate;
  sensoryHints?: PotionSensoryHints;
  variants?: PotionCatalogVariant[];
  tags: string[];
};

export type PotencyTier = 'weakened' | 'heightened' | 'supreme';

export type PotionModification =
  | { kind: 'homebrew' }
  | { kind: 'potency'; tier: PotencyTier; magnitudeDelta: number }
  | { kind: 'duration'; change: 'extended' | 'shortened' | 'permanent' }
  | { kind: 'tainted' };

export type PotionLiquid = Item & {
  itemMajorType: 'potion';
  itemMinorType: string;
  effect: PotionEffect;
  sensory: PotionSensoryProfile;
};

export type Potion = {
  container: Container;
  liquid: PotionLiquid;
  displayName: string;
  canonicalName?: string;
  sensory: PotionSensoryProfile;
  effect: PotionEffect;
  modifications: PotionModification[];
};

export type ResolvedPotionCatalogEntry = {
  entry: PotionCatalogEntry;
  variant?: PotionCatalogVariant;
  catalogId: string;
};

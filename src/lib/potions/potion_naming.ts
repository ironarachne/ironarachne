import type { RNG } from '@ironarachne/rng';
import type { MagicIntent } from '$lib/magic/types';
import type {
  PotionForm,
  PotionModification,
  PotencyTier,
  PotionEffectTemplate,
  PotionEffect,
} from './potion_types';

const POTENCY_PREFIX: Record<PotencyTier, string[]> = {
  weakened: ['Diluted', 'Weak', 'Lesser', 'Faint'],
  heightened: ['Greater', 'Potent', 'Concentrated', 'Strong'],
  supreme: ['Sovereign', 'Mythic', 'Grand', 'Supreme'],
};

const DURATION_EXTENDED_PREFIX = ['Enduring', 'Long-lasting', 'Persistent'];
const DURATION_SHORTENED_PREFIX = ['Fleeting', 'Brief', 'Momentary'];
const DURATION_PERMANENT_PREFIX = ['Everlasting', 'Eternal', 'Perpetual'];

const TAINTED_PREFIX = ['Tainted', 'Adulterated', 'Corrupted', 'Impure'];

const BASE_BY_FORM: Record<PotionForm, string[]> = {
  drink: ['Draught', 'Elixir', 'Philter', 'Tincture', 'Brew', 'Potion', 'Concoction', 'Infusion'],
  oil: ['Oil', 'Unguent', 'Anointing Oil'],
  ointment: ['Salve', 'Ointment', 'Balm', 'Poultice'],
};

const INTENT_NOUNS: Record<MagicIntent, string[]> = {
  restore: ['Restoration', 'Renewal', 'Mending', 'Revival'],
  imbue: ['Might', 'Valor', 'Prowess', 'Empowerment'],
  alter: ['Change', 'Transmutation', 'Metamorphosis'],
  protect: ['Warding', 'Aegis', 'Shelter', 'Ward'],
  destroy: ['Ruin', 'Bane', 'Withering', 'Doom'],
  sense: ['Insight', 'Vision', 'Discernment', 'Perception'],
  create: ['Genesis', 'Summoning', 'Making'],
  control: ['Dominion', 'Binding', 'Command'],
  move: ['Swiftness', 'Flight', 'Passage'],
  summon: ['Calling', 'Conjuration'],
  banish: ['Banishment', 'Exorcism'],
  transform: ['Metamorphosis', 'Transfiguration'],
  drain: ['Sapping', 'Leeching', 'Emptiness'],
};

export type DisplayNameContext = {
  canonicalName: string;
  form: PotionForm;
  intent: MagicIntent;
  magnitude: number;
  modifications: PotionModification[];
  isHomebrew: boolean;
};

export function classifyPotencyTier(actual: number, baseline: number): PotencyTier | 'standard' {
  if (actual <= baseline - 8) {
    return 'weakened';
  }
  if (actual >= baseline + 20) {
    return 'supreme';
  }
  if (actual >= baseline + 8) {
    return 'heightened';
  }
  return 'standard';
}

export function potencyTierFromMagnitude(magnitude: number): PotencyTier {
  if (magnitude >= 75) {
    return 'supreme';
  }
  if (magnitude >= 45) {
    return 'heightened';
  }
  return 'weakened';
}

function pickBase(rng: RNG, form: PotionForm): string {
  return rng.item(BASE_BY_FORM[form]);
}

function pickIntentNoun(rng: RNG, intent: MagicIntent): string {
  return rng.item(INTENT_NOUNS[intent]);
}

function prefixForModification(rng: RNG, modification: PotionModification): string | undefined {
  switch (modification.kind) {
    case 'potency':
      return rng.item(POTENCY_PREFIX[modification.tier]);
    case 'duration':
      if (modification.change === 'permanent') {
        return rng.item(DURATION_PERMANENT_PREFIX);
      }
      if (modification.change === 'extended') {
        return rng.item(DURATION_EXTENDED_PREFIX);
      }
      return rng.item(DURATION_SHORTENED_PREFIX);
    case 'tainted':
      return rng.item(TAINTED_PREFIX);
    case 'homebrew':
      return undefined;
    default:
      return undefined;
  }
}

function buildHomebrewAffixName(rng: RNG, context: DisplayNameContext): string {
  const base = pickBase(rng, context.form);
  const intentNoun = pickIntentNoun(rng, context.intent);

  if (context.intent === 'destroy' || context.intent === 'drain') {
    return `${rng.item(TAINTED_PREFIX)} ${base} of ${intentNoun}`;
  }

  const tier = potencyTierFromMagnitude(context.magnitude);
  return `${rng.item(POTENCY_PREFIX[tier])} ${base} of ${intentNoun}`;
}

function buildModifiedCatalogName(rng: RNG, context: DisplayNameContext): string {
  const prefixes = context.modifications
    .map((modification) => prefixForModification(rng, modification))
    .filter((prefix): prefix is string => prefix !== undefined);

  if (prefixes.length === 0) {
    return context.canonicalName;
  }

  return `${prefixes.join(' ')} ${context.canonicalName}`;
}

export function buildDisplayNameFromModifications(rng: RNG, context: DisplayNameContext): string {
  if (context.modifications.length === 0) {
    return context.canonicalName;
  }

  if (context.isHomebrew) {
    return buildHomebrewAffixName(rng, context);
  }

  return buildModifiedCatalogName(rng, context);
}

export function applyPotionModifications(
  rng: RNG,
  effect: PotionEffect,
  template: PotionEffectTemplate,
  allowVariations: boolean,
  isHomebrew: boolean,
  hasVariant: boolean,
): { effect: PotionEffect; modifications: PotionModification[] } {
  const updated: PotionEffect = {
    ...effect,
    statOffsets: effect.statOffsets ? { ...effect.statOffsets } : undefined,
  };

  if (isHomebrew) {
    return { effect: updated, modifications: [{ kind: 'homebrew' }] };
  }

  if (!allowVariations || hasVariant) {
    return { effect: updated, modifications: [] };
  }

  if (rng.int(1, 100) > 35) {
    return { effect: updated, modifications: [] };
  }

  const modifications: PotionModification[] = [];
  const variation = rng.item([
    'potency_up',
    'potency_down',
    'duration_extend',
    'duration_shorten',
    'tainted',
  ] as const);

  switch (variation) {
    case 'potency_up': {
      const delta = rng.int(8, 22);
      updated.magnitude += delta;
      const tier = classifyPotencyTier(updated.magnitude, template.magnitude);
      if (tier !== 'standard') {
        modifications.push({ kind: 'potency', tier, magnitudeDelta: delta });
      }
      break;
    }
    case 'potency_down': {
      const delta = rng.int(8, 18);
      updated.magnitude = Math.max(1, updated.magnitude - delta);
      const tier = classifyPotencyTier(updated.magnitude, template.magnitude);
      if (tier !== 'standard') {
        modifications.push({ kind: 'potency', tier, magnitudeDelta: -delta });
      }
      break;
    }
    case 'duration_extend':
      if (applyDurationChange(updated, 'extended')) {
        modifications.push({ kind: 'duration', change: 'extended' });
      }
      break;
    case 'duration_shorten':
      if (applyDurationChange(updated, 'shortened')) {
        modifications.push({ kind: 'duration', change: 'shortened' });
      }
      break;
    case 'tainted':
      updated.statOffsets = {
        ...updated.statOffsets,
        health: (updated.statOffsets?.health ?? 0) - rng.int(2, 8),
      };
      modifications.push({ kind: 'tainted' });
      break;
  }

  return { effect: updated, modifications };
}

function applyDurationChange(
  effect: PotionEffect,
  change: 'extended' | 'shortened' | 'permanent',
): boolean {
  const duration = effect.duration;

  if (change === 'permanent' && duration.type !== 'permanent') {
    effect.duration = { type: 'permanent', description: 'The effect becomes permanent.' };
    return true;
  }

  if (duration.type !== 'timed' || !duration.value || !duration.unit) {
    return false;
  }

  if (change === 'extended') {
    effect.duration = {
      ...duration,
      value: duration.value * 2,
      description: `Lasts for ${duration.value * 2} ${duration.unit}(s), twice the usual duration.`,
    };
    return true;
  }

  if (change === 'shortened') {
    const shortened = Math.max(1, Math.floor(duration.value / 2));
    effect.duration = {
      ...duration,
      value: shortened,
      description: `Lasts for ${shortened} ${duration.unit}(s), half the usual duration.`,
    };
    return true;
  }

  return false;
}

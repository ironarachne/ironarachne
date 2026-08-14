import { RNG } from '@ironarachne/rng';
import { generateRandomContainer, DENSITY_MAP } from '$lib/equipment';
import type { DensityCategory, Rarity } from '$lib/equipment';
import type { Duration, Element, MagicIntent, MagicSphere } from '$lib/magic';
import {
  filterCatalogEntries,
  getDefaultPotionConfig,
  type PotionGeneratorConfig,
} from './potion_generator_config';
import { potionCatalog } from './potion_catalog';
import { describePotion as buildPotionDescription } from './potion_descriptor';
import { generateSensoryProfile } from './potion_sensory';
import {
  calculateHomebrewLiquidValue,
  getRarityBaseValue,
  resolveCatalogValue,
  resolveRarity,
} from './potion_value';
import type {
  Potion,
  PotionCatalogEntry,
  PotionCatalogVariant,
  PotionEffect,
  PotionForm,
  PotionModification,
  ResolvedPotionCatalogEntry,
} from './potion_types';
import { applyPotionModifications, buildDisplayNameFromModifications } from './potion_naming';

const HOMEBREW_DURATIONS: Duration[] = [
  { type: 'timed', unit: 'minute', value: 10 },
  { type: 'timed', unit: 'hour', value: 1 },
  { type: 'timed', unit: 'hour', value: 8 },
  { type: 'timed', unit: 'day', value: 1 },
  { type: 'instantaneous' },
  { type: 'permanent' },
];

const HOMEBREW_ELEMENTS: Element[] = [
  'arcane',
  'life',
  'death',
  'fire',
  'water',
  'mind',
  'poison',
  'shadow',
];
const HOMEBREW_SPHERES: MagicSphere[] = ['physical', 'mental', 'arcane', 'spiritual', 'nature'];
const HOMEBREW_INTENTS: MagicIntent[] = [
  'restore',
  'imbue',
  'alter',
  'protect',
  'destroy',
  'sense',
];

const RARITY_BY_MAGNITUDE: { min: number; rarity: Rarity }[] = [
  { min: 85, rarity: 'legendary' },
  { min: 65, rarity: 'epic' },
  { min: 45, rarity: 'rare' },
  { min: 25, rarity: 'uncommon' },
  { min: 0, rarity: 'common' },
];

export function generatePotion(
  seed: string,
  config: PotionGeneratorConfig = getDefaultPotionConfig(),
): Potion {
  const rng = new RNG(seed);
  const resolved = pickCatalogEntry(rng, config);
  const baseEffect = buildPotionEffect(resolved, rng);
  const isHomebrew = resolved.entry.id.startsWith('homebrew');
  const { effect, modifications } = applyPotionModifications(
    rng,
    baseEffect,
    resolved.entry.effectTemplate,
    config.allowProceduralNames,
    isHomebrew,
    resolved.variant !== undefined,
  );
  const sensory = generateSensoryProfile(rng, effect, resolved.entry.sensoryHints);
  const rarity = resolveRarity(resolved.entry, resolved.variant);
  const { displayName, canonicalName } = resolveDisplayName(resolved, effect, modifications, rng);
  const liquidValue = isHomebrew
    ? calculateHomebrewLiquidValue(rarity, effect.magnitude)
    : resolveCatalogValue(resolved.entry, resolved.variant, effect);

  const container = generateRandomContainer(`${seed}-container`, config.containerConfig);
  const fillPercentage = rng.int(80, 100) / 100;
  const volume = parseFloat((container.maxVolume * fillPercentage).toFixed(2));
  const densityCategory: DensityCategory = 'standard';
  const density = DENSITY_MAP[densityCategory];
  const weight = parseFloat((volume * density).toFixed(2));
  const catalogId = resolved.variant?.id ?? resolved.entry.id;

  const liquidId = `potion-${rng.randomString(13)}`;
  const liquid = {
    id: liquidId,
    name: displayName,
    itemMajorType: 'potion' as const,
    itemMinorType: catalogId,
    description: '',
    value: liquidValue,
    rarity,
    densityCategory,
    manualVolume: volume,
    weight,
    properties: [...resolved.entry.tags, resolved.entry.form],
    containerId: container.id,
    effect,
    sensory,
  };

  liquid.description = buildPotionDescription(
    {
      container,
      liquid,
      displayName,
      canonicalName,
      sensory,
      effect,
      modifications,
    },
    resolved.entry.form,
  );

  container.contents.push(liquidId);
  container.currentVolume = parseFloat((container.currentVolume + volume).toFixed(2));
  container.currentWeight = parseFloat((container.currentWeight + weight).toFixed(2));

  return {
    container,
    liquid,
    displayName,
    canonicalName,
    sensory,
    effect,
    modifications,
  };
}

export { buildPotionDescription as describePotion };

export { getDefaultPotionConfig };

function pickCatalogEntry(rng: RNG, config: PotionGeneratorConfig): ResolvedPotionCatalogEntry {
  const filtered = filterCatalogEntries(potionCatalog, config);
  const useHomebrew = config.allowHomebrew && (filtered.length === 0 || rng.int(1, 100) <= 20);

  if (useHomebrew) {
    return { entry: buildHomebrewCatalogEntry(rng), catalogId: 'homebrew' };
  }

  if (filtered.length === 0) {
    throw new Error('No potion catalog entries match the current generator config.');
  }

  const entry = rng.item(filtered);
  const variant = pickVariant(entry, rng);
  return {
    entry,
    variant,
    catalogId: variant?.id ?? entry.id,
  };
}

function pickVariant(entry: PotionCatalogEntry, rng: RNG): PotionCatalogVariant | undefined {
  if (!entry.variants?.length) {
    return undefined;
  }
  return rng.item(entry.variants);
}

function buildPotionEffect(resolved: ResolvedPotionCatalogEntry, rng: RNG): PotionEffect {
  const { entry, variant } = resolved;
  const template = entry.effectTemplate;
  const catalogId = variant?.id ?? entry.id;
  const magnitude = variant?.magnitude ?? template.magnitude;
  const duration = variant?.duration ?? template.duration;
  const parameters = variant?.parameters ?? template.parameters;
  const statOffsets = variant?.statOffsets ?? template.statOffsets;

  let name = entry.canonicalName;
  if (variant?.suffix) {
    name = `${entry.canonicalName} (${variant.suffix})`;
  }

  if (entry.id.startsWith('homebrew')) {
    return buildHomebrewEffect(entry, rng);
  }

  return {
    id: catalogId,
    name,
    description: template.description,
    duration,
    intent: template.intent,
    elements: template.elements,
    spheres: template.spheres,
    magnitude,
    statOffsets,
    parameters,
  };
}

function buildHomebrewCatalogEntry(rng: RNG): PotionCatalogEntry {
  const magnitude = rng.int(15, 95);
  const rarity = magnitudeToRarity(magnitude);
  const duration = rng.item(HOMEBREW_DURATIONS);
  const intent = rng.item(HOMEBREW_INTENTS);
  const elements = [rng.item(HOMEBREW_ELEMENTS)];
  const spheres = [rng.item(HOMEBREW_SPHERES)];

  return {
    id: 'homebrew-wild',
    canonicalName: 'Homebrew Concoction',
    rarity,
    baseValue: getRarityBaseValue(rarity),
    form: rng.item(['drink', 'oil', 'ointment'] as PotionForm[]),
    tags: ['magical', 'homebrew', 'potion'],
    effectTemplate: {
      description: 'An unpredictable alchemical effect brewed outside common formulae.',
      duration,
      intent,
      elements,
      spheres,
      magnitude,
      parameters: { kind: 'homebrew', tier: Math.ceil(magnitude / 20) },
      statOffsets: homebrewStatOffsets(magnitude, intent, rng),
    },
  };
}

function buildHomebrewEffect(entry: PotionCatalogEntry, rng: RNG): PotionEffect {
  const template = entry.effectTemplate;
  const descriptions: Record<MagicIntent, string[]> = {
    restore: ['Wounds close and vigor returns.', 'Fatigue melts away under a warm surge.'],
    imbue: ['Power floods the limbs.', 'Senses sharpen to a knife edge.'],
    alter: ['The body twists under unfamiliar magic.', 'Perception shifts in uncanny ways.'],
    protect: [
      'A ward settles over the body like invisible mail.',
      'Harm slides away before it lands.',
    ],
    destroy: ['Vitality curdles and burns from within.', 'A cold poison unravels the drinker.'],
    sense: ['Hidden truths press against the mind.', 'The world reveals secrets to the drinker.'],
    create: ['Something impossible takes shape within the drinker.'],
    control: ['Will bends toward an unseen hand.'],
    move: ['The body yearns to leap beyond its limits.'],
    summon: ['Something stirs at the edge of perception.'],
    banish: ['An unwelcome presence is driven away.'],
    transform: ['Flesh and bone reshape under the effect.'],
    drain: ['Strength seeps out like water through cloth.'],
  };

  const options = descriptions[template.intent] ?? ['The effect is strange and poorly understood.'];
  const description = rng.item(options);

  return {
    id: entry.id,
    name: entry.canonicalName,
    description,
    duration: template.duration,
    intent: template.intent,
    elements: template.elements,
    spheres: template.spheres,
    magnitude: template.magnitude,
    statOffsets: template.statOffsets,
    parameters: template.parameters,
  };
}

function homebrewStatOffsets(
  magnitude: number,
  intent: MagicIntent,
  rng: RNG,
): Record<string, number> | undefined {
  if (intent === 'destroy' || intent === 'drain') {
    return {
      health: -rng.int(5, Math.ceil(magnitude / 3)),
      resilience: -rng.int(1, Math.ceil(magnitude / 10)),
    };
  }
  if (intent === 'restore' || intent === 'imbue' || intent === 'protect') {
    return {
      health: rng.int(3, Math.ceil(magnitude / 4)),
      power: rng.int(1, Math.ceil(magnitude / 8)),
    };
  }
  return undefined;
}

function magnitudeToRarity(magnitude: number): Rarity {
  for (const row of RARITY_BY_MAGNITUDE) {
    if (magnitude >= row.min) {
      return row.rarity;
    }
  }
  return 'common';
}

function resolveDisplayName(
  resolved: ResolvedPotionCatalogEntry,
  effect: PotionEffect,
  modifications: PotionModification[],
  rng: RNG,
): { displayName: string; canonicalName?: string } {
  const { entry, variant } = resolved;
  let canonicalName = entry.canonicalName;
  if (variant?.suffix) {
    canonicalName = `${entry.canonicalName} (${variant.suffix})`;
  }

  const isHomebrew = entry.id.startsWith('homebrew');
  const displayName = buildDisplayNameFromModifications(rng, {
    canonicalName,
    form: entry.form,
    intent: effect.intent,
    magnitude: effect.magnitude,
    modifications,
    isHomebrew,
  });

  return {
    displayName,
    canonicalName: isHomebrew ? undefined : canonicalName,
  };
}

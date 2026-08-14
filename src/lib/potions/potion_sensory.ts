import type { RNG } from '@ironarachne/rng';
import type { Element } from '$lib/magic';
import type { PotionEffect, PotionSensoryHints, PotionSensoryProfile } from './potion_types';

const DEFAULT_COLORS = [
  'amber',
  'azure',
  'blue',
  'brown',
  'coppery',
  'crimson',
  'emerald',
  'golden',
  'green',
  'magenta',
  'orange',
  'pink',
  'purple',
  'red',
  'ruby',
  'sapphire',
  'turquoise',
  'violet',
  'yellow',
  'clear',
  'milky white',
  'pale blue',
];

const COLOR_MODIFIERS = [
  'bright',
  'dark',
  'deep',
  'dim',
  'fluorescent',
  'glittering',
  'glowing',
  'iridescent',
  'light',
  'luminous',
  'murky',
  'opalescent',
  'pearlescent',
  'shimmering',
  'sparkling',
  'translucent',
  'vivid',
];

const VISCOSITIES = [
  'thin and watery',
  'light and runny',
  'smooth and silky',
  'slightly syrupy',
  'syrupy',
  'thick and syrupy',
  'gelatinous',
  'oily',
  'viscous',
  'effervescent and bubbly',
  'misty and ethereal',
];

const FLAVOR_BASES: Record<string, string[]> = {
  life: ['honeyed', 'sweet', 'nourishing', 'warm'],
  death: ['bitter', 'ashy', 'metallic', 'cold'],
  poison: ['bitter', 'acrid', 'metallic', 'caustic'],
  fire: ['smoky', 'peppery', 'cinnamon-like', 'sharp'],
  water: ['salty', 'briny', 'fresh', 'mineral'],
  air: ['faint', 'barely there', 'crisp', 'cool'],
  light: ['bright', 'clean', 'citrus-like', 'radiant'],
  shadow: ['flat', 'hollow', 'muted', 'absent'],
  nature: ['earthy', 'herbal', 'grassy', 'woody'],
  arcane: ['ozone-like', 'electric', 'strange', 'unplaceable'],
  divine: ['incense-like', 'sacred', 'warm bread-like', 'pure'],
  mind: ['numbing', 'sharp', 'tingling', 'dreamlike'],
  default: ['faintly sweet', 'bitter', 'sour', 'neutral', 'complex', 'unremarkable'],
};

const SCENTS = [
  'alchemical reagents',
  'fresh herbs',
  'damp earth',
  'ozone',
  'incense',
  'roses',
  'sulfur',
  'sea salt',
  'pine resin',
  'vanilla',
  'musk',
  'jasmine',
  'copper',
  'iron',
  'lavender',
  'mint',
  'smoke',
  'rain on stone',
  'fermented fruit',
  'wildflowers',
  'decay',
  'clean linen',
  'burnt sugar',
  'mold and cellar dust',
];

const INCLUSIONS = [
  'tiny suspended beads',
  'slowly swirling motes',
  'a faint inner glow',
  'drifting cloud-like impurities',
  'crystalline flecks',
  'a single floating bubble',
  'threads of contrasting color',
  'occasional sparks of light',
  'a sediment layer at the bottom',
  'steam-like wisps within the liquid',
];

function pickWeightedColor(rng: RNG, hints?: PotionSensoryHints): string {
  const pool = hints?.colors?.length ? [...hints.colors, ...DEFAULT_COLORS] : DEFAULT_COLORS;
  return rng.item(pool);
}

function pickViscosity(rng: RNG, hints?: PotionSensoryHints): string {
  const pool = hints?.viscosities?.length ? [...hints.viscosities, ...VISCOSITIES] : VISCOSITIES;
  return rng.item(pool);
}

function pickFlavor(rng: RNG, elements: Element[] | undefined, hints?: PotionSensoryHints): string {
  if (hints?.flavors?.length && rng.int(1, 100) <= 60) {
    const base = rng.item(hints.flavors);
    const modifier = rng.item(['faintly', 'distinctly', 'overwhelmingly', 'surprisingly']);
    return `${modifier} ${base}`;
  }

  const element = elements?.length ? rng.item(elements) : undefined;
  const flavorPool =
    element && FLAVOR_BASES[element] ? FLAVOR_BASES[element] : FLAVOR_BASES.default;
  const base = rng.item(flavorPool);
  const modifier = rng.item([
    'faintly',
    'distinctly',
    'surprisingly',
    'unpleasantly',
    'pleasantly',
  ]);
  return `${modifier} ${base}`;
}

function pickScent(rng: RNG, hints?: PotionSensoryHints): string {
  const pool = hints?.scents?.length ? [...hints.scents, ...SCENTS] : SCENTS;
  const scent = rng.item(pool);
  const modifier = rng.item(['faint', 'sharp', 'sweet', 'pungent', 'subtle', 'heavy']);
  return `${modifier} ${scent}`;
}

function buildAppearance(rng: RNG, color: string, hints?: PotionSensoryHints): string {
  if (hints?.appearances?.length && rng.int(1, 100) <= 55) {
    return rng.item(hints.appearances);
  }

  const modifier = rng.item(COLOR_MODIFIERS);
  const inclusion = rng.int(1, 100) <= 50 ? ` with ${rng.item(INCLUSIONS)}` : '';
  return `${modifier} ${color} liquid${inclusion}`;
}

export function generateSensoryProfile(
  rng: RNG,
  effect: Pick<PotionEffect, 'elements'>,
  hints?: PotionSensoryHints,
): PotionSensoryProfile {
  const color = pickWeightedColor(rng, hints);
  const appearance = buildAppearance(rng, color, hints);
  const viscosity = pickViscosity(rng, hints);
  const flavor = pickFlavor(rng, effect.elements, hints);
  const scent = pickScent(rng, hints);

  return {
    appearance,
    viscosity,
    flavor,
    scent,
  };
}

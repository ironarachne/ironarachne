import type { RNG } from '@ironarachne/rng';
import { getOrdinal } from '@ironarachne/words';
import { nameGeneratorSetFromPatternSources } from './name_generator_patterns';
import type {
  LandscapeDirection,
  LandscapeNameContext,
  LandscapeNameInput,
  LandscapeNameResult,
  LandscapeNameStyle,
} from './landscape_name_types';

// Folk-name epithets are toponyms, not additional claims in the landscape description.
const epithets = [
  'Whispering',
  'Quiet',
  'Old',
  'Wandering',
  'Forgotten',
  'Silent',
  'Dreaming',
  'Waking',
  'Hidden',
  'Lonesome',
  'Watchful',
  'Sleeping',
  'Untold',
  'Hushed',
];
const adjectives: Record<LandscapeDirection, string> = {
  north: 'Northern',
  northeast: 'Northeastern',
  east: 'Eastern',
  southeast: 'Southeastern',
  south: 'Southern',
  southwest: 'Southwestern',
  west: 'Western',
  northwest: 'Northwestern',
  central: 'Central',
};
const nameKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

function descriptiveName(nouns: string[], used: Set<string>, rng: RNG): string {
  const options = nouns.flatMap((noun) => epithets.map((epithet) => `the ${epithet} ${noun}`));
  const unused = options.filter((name) => !used.has(nameKey(name)));
  return rng.item(unused.length ? unused : options);
}

function culturalName(input: LandscapeNameInput, noun: string, rng: RNG): string | undefined {
  if (!input.culturePatterns) return undefined;
  const generators = nameGeneratorSetFromPatternSources(input.culturePatterns, rng);
  const usable = (['female', 'male', 'family'] as const).filter((slot) => {
    const source = input.culturePatterns![slot];
    return Array.isArray(source)
      ? source.length > 0
      : !!(source.patterns?.length || source.combinations?.length);
  });
  if (!usable.length) return undefined;
  const slot = rng.item(usable);
  const name = generators[slot].generate(1)[0]?.trim();
  if (!name) return undefined;
  const possessive = /s$/i.test(name) ? `${name}’` : `${name}’s`;
  return `${slot === 'family' ? name : possessive} ${noun}`;
}

function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(nameKey(name))) return name;
  const ordinals = [
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth',
  ];
  for (let index = 0; index <= used.size; index++) {
    const qualifier = ordinals[index] ?? `${index + 2}${getOrdinal(index + 2)}`;
    const candidate = `${name} (${qualifier})`;
    if (!used.has(nameKey(candidate))) return candidate;
  }
  // There are more candidates than used names, so the loop always returns.
  throw new Error('Could not qualify landscape name.');
}

/** Name an eligible landscape once, using only caller-owned randomness and batch history. */
export function generateLandscapeName(
  input: LandscapeNameInput,
  context: LandscapeNameContext,
  rng: RNG,
): LandscapeNameResult {
  const nouns = [...new Set(input.nouns.map((noun) => noun.trim()).filter(Boolean))];
  if (!nouns.length) nouns.push('Country');
  const used = new Set(context.usedNames.map(nameKey));
  const options: { value: LandscapeNameStyle; commonality: number }[] = [
    { value: 'descriptive', commonality: 55 },
    ...(input.directions.length ? [{ value: 'geographic' as const, commonality: 30 }] : []),
    ...(input.culturePatterns ? [{ value: 'cultural' as const, commonality: 15 }] : []),
  ];
  const lastStyle = context.recentStyles.at(-1);
  const selected = rng.weighted(
    options.map((option) => ({
      ...option,
      // The RNG draws integer weights; scale the 3/4 repeat penalty to whole numbers.
      commonality: option.commonality * (option.value === lastStyle ? 3 : 4),
    })),
  );
  let style = selected;
  let name = '';
  for (let attempt = 0; attempt < 8; attempt++) {
    const noun = rng.item(nouns);
    if (style === 'geographic') name = `the ${adjectives[rng.item(input.directions)]} ${noun}`;
    else if (style === 'cultural') {
      const cultural = culturalName(input, noun, rng);
      if (cultural) name = cultural;
      else style = 'descriptive';
    }
    if (style === 'descriptive') name = descriptiveName(nouns, used, rng);
    if (!used.has(nameKey(name))) break;
  }
  name = uniqueName(name, used);
  return {
    name,
    style,
    nextContext: {
      usedNames: [...context.usedNames, name],
      recentStyles: [...context.recentStyles, style].slice(-3),
    },
  };
}

import type { RNG } from '@ironarachne/rng';
import { nameGeneratorSetFromPatternSources } from './name_generator_patterns';
import { landscapeNounVariants, landscapeRoots, landscapeTemplates } from './landscape_name_data';
import type {
  LandscapeDirection,
  LandscapeNameCandidate,
  LandscapeNameContext,
  LandscapeNameIdentity,
  LandscapeNameInput,
  LandscapeNameResult,
  LandscapeNameScope,
  LandscapeNameStyle,
  LandscapeNameTemplate,
} from './landscape_name_types';

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
const styleWeights: Record<LandscapeNameScope, Record<LandscapeNameStyle, number>> = {
  region: {
    compound: 30,
    descriptive: 25,
    metaphor: 20,
    toponym: 15,
    of_phrase: 10,
    geographic: 0,
    cultural: 5,
  },
  zone: {
    compound: 20,
    descriptive: 35,
    metaphor: 10,
    toponym: 15,
    of_phrase: 5,
    geographic: 10,
    cultural: 5,
  },
};
const nameKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();
const words = (name: string) => name.toLowerCase().match(/[\p{L}]+/gu) ?? [];
const genericWords = new Set([
  'the',
  'of',
  ...Object.values(adjectives).map(nameKey),
  ...Object.keys(landscapeNounVariants).flatMap(words),
  ...Object.values(landscapeNounVariants).flat().flatMap(words),
]);
const compoundMotifs = new Map(
  landscapeTemplates
    .filter((template) => template.style === 'compound')
    .flatMap((template) =>
      template.forms
        .filter((form) => !form.includes('{'))
        .map((form) => [nameKey(form), template.motifKey ?? nameKey(form)] as const),
    ),
);
const rootEndings = [
  ...new Set(
    landscapeTemplates
      .flatMap((template) => template.forms)
      .map((form) => /^\{root\}([a-z]+)$/.exec(form)?.[1])
      .filter((ending): ending is string => !!ending),
  ),
];
const knownRoots = new Set(Object.values(landscapeRoots).flat().map(nameKey));
const descriptiveMotifs = new Map(
  landscapeTemplates
    .filter((template) => template.style === 'descriptive')
    .flatMap((template) =>
      template.forms
        .flatMap((form) => meaningfulWords(form.replaceAll('{noun}', '')))
        .map((word) => [word, template.motifKey ?? word] as const),
    ),
);

/** Detect malformed joins without imposing English spelling on cultural names. */
export function isWellFormedLandscapeName(name: string, cultural = false): boolean {
  if (!name.trim() || /\{[^}]*\}/.test(name)) return false;
  const tokens = words(name);
  if (tokens.some((word, index) => index > 0 && word === tokens[index - 1])) return false;
  if (cultural) return true;
  return !tokens.some((word) => /([a-z])\1\1/i.test(word) || /([a-z]{2,3})\1$/i.test(word));
}

function eligibleNouns(template: LandscapeNameTemplate, nouns: string[]): string[] {
  return template.eligibleNouns.length
    ? nouns.filter((noun) => template.eligibleNouns.includes(noun))
    : nouns;
}

function formCapacity(form: string, template: LandscapeNameTemplate): number {
  return form.includes('{root}') && template.rootPalette
    ? landscapeRoots[template.rootPalette].length
    : 1;
}

function templateCapacity(template: LandscapeNameTemplate, nouns: string[]): number {
  const nounCount = eligibleNouns(template, nouns).flatMap(
    (noun) => landscapeNounVariants[noun] ?? [noun],
  ).length;
  return template.forms.reduce(
    (sum, form) => sum + formCapacity(form, template) * (form.includes('{noun}') ? nounCount : 1),
    0,
  );
}

function templateCandidate(
  template: LandscapeNameTemplate,
  nouns: string[],
  rng: RNG,
): LandscapeNameCandidate {
  const form = rng.weighted(
    template.forms.map((value) => ({ value, commonality: formCapacity(value, template) })),
  );
  const eligible = eligibleNouns(template, nouns);
  const noun = rng.item([
    ...new Set(eligible.flatMap((noun) => landscapeNounVariants[noun] ?? [noun])),
  ]);
  const root = form.includes('{root}')
    ? rng.item(landscapeRoots[template.rootPalette!])
    : undefined;
  const ending = /^\{root\}([a-z]+)$/.exec(form)?.[1];
  const join =
    root && ending
      ? `${root.match(/[^aeiouy]+$/i)?.[0] ?? ''}${ending.match(/^[^aeiouy]+/i)?.[0] ?? ''}`
      : '';
  return {
    name: form.replaceAll('{noun}', noun).replaceAll('{root}', root ?? ''),
    style: template.style,
    identity: {
      ...(template.motifKey ? { motifKey: template.motifKey } : {}),
      ...(root ? { rootKey: nameKey(root) } : {}),
    },
    weight: join.length > 3 ? 0 : 1,
  };
}

function culturalCandidate(
  input: LandscapeNameInput,
  nouns: string[],
  rng: RNG,
): LandscapeNameCandidate | undefined {
  if (!input.culturePatterns) return undefined;
  const usable = (['female', 'male', 'family'] as const).filter((slot) => {
    const source = input.culturePatterns![slot];
    return Array.isArray(source)
      ? source.some((pattern) => pattern.trim())
      : !!(source.patterns?.length || source.combinations?.length);
  });
  if (!usable.length) return undefined;
  const generators = nameGeneratorSetFromPatternSources(input.culturePatterns, rng);
  const slot = rng.item(usable);
  const name = generators[slot].generate(1)[0]?.trim();
  if (!name) return undefined;
  const possessive = /s$/i.test(name) ? `${name}’` : `${name}’s`;
  return {
    name: `${slot === 'family' ? name : possessive} ${rng.item(nouns)}`,
    style: 'cultural',
    identity: { rootKey: nameKey(name) },
    weight: 1,
  };
}

function makeCandidate(
  style: LandscapeNameStyle,
  templates: LandscapeNameTemplate[],
  input: LandscapeNameInput,
  nouns: string[],
  rng: RNG,
): LandscapeNameCandidate | undefined {
  if (style === 'cultural') return culturalCandidate(input, nouns, rng);
  if (style === 'geographic') {
    if (!input.directions.length) return undefined;
    return {
      name: `the ${adjectives[rng.item(input.directions)]} ${rng.item(nouns)}`,
      style,
      identity: {},
      weight: 1,
    };
  }
  const options = templates.filter((template) => template.style === style);
  const template = rng.weighted(
    options.map((value) => ({ value, commonality: templateCapacity(value, nouns) })),
  );
  return templateCandidate(template, nouns, rng);
}

function rootNear(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let left = 0;
  let right = 0;
  let differences = 0;
  while (left < a.length && right < b.length) {
    if (a[left] === b[right]) {
      left++;
      right++;
      continue;
    }
    if (++differences > 1) return false;
    if (a.length >= b.length) left++;
    if (b.length >= a.length) right++;
  }
  return differences + a.length - left + b.length - right <= 1;
}

function identityOverlap(a: LandscapeNameIdentity, b: LandscapeNameIdentity): boolean {
  return !!(
    (a.motifKey && a.motifKey === b.motifKey) ||
    (a.rootKey && b.rootKey && rootNear(a.rootKey, b.rootKey))
  );
}

function meaningfulWords(name: string): string[] {
  return words(name).filter((word) => !genericWords.has(word) && word !== 's');
}

function legacyTerms(name: string): string[] {
  return meaningfulWords(name).flatMap((word) => {
    const roots = rootEndings
      .filter((ending) => word.endsWith(ending))
      .map((ending) => word.slice(0, -ending.length))
      .filter((root) => knownRoots.has(root));
    const motif = compoundMotifs.get(word) ?? descriptiveMotifs.get(word);
    return [word, ...roots, ...(motif ? [motif] : [])];
  });
}

function legacyOverlap(candidate: LandscapeNameCandidate, previous: string[][]): boolean {
  const tokens = meaningfulWords(candidate.name);
  return previous.some((old) => {
    const motifWords = candidate.identity.motifKey
      ? meaningfulWords(candidate.identity.motifKey)
      : [];
    if (tokens.some((token) => old.includes(token))) return true;
    // Canonical literal compounds let Briarshade Woods and Briarshade Forest share identity.
    if (candidate.identity.motifKey && old.includes(candidate.identity.motifKey)) return true;
    if (motifWords.length && motifWords.every((word) => old.includes(word))) return true;
    return (
      !!candidate.identity.rootKey &&
      old.some((word) => rootNear(candidate.identity.rootKey!, word))
    );
  });
}

function selectCandidate(
  pool: LandscapeNameCandidate[],
  context: LandscapeNameContext,
  rng: RNG,
): LandscapeNameCandidate {
  const previous = context.usedNames.slice(-8).map(legacyTerms);
  const fresh = pool.filter(
    (candidate) =>
      !(context.recentIdentities ?? []).some((identity) =>
        identityOverlap(candidate.identity, identity),
      ) && !legacyOverlap(candidate, previous),
  );
  const options = fresh.length ? fresh : pool;
  return rng.weighted(options.map((value) => ({ value, commonality: value.weight })));
}

/** Injective syllable enumeration, used only after the bounded ordinary candidate pool fails. */
function fallbackCandidate(nouns: string[], used: Set<string>): LandscapeNameCandidate {
  const syllables = [
    'ba',
    'de',
    'fi',
    'go',
    'ha',
    'ke',
    'lu',
    'mo',
    'na',
    'pe',
    'ri',
    'so',
    'ta',
    've',
  ];
  for (let index = 0; index <= used.size; index++) {
    let remaining = index;
    let stem = '';
    do {
      stem += syllables[remaining % syllables.length];
      remaining = Math.floor(remaining / syllables.length) - 1;
    } while (remaining >= 0);
    // Interleaving 'r' avoids accidentally doubled syllables at chunk boundaries.
    const root = `A${stem.match(/.{2}/g)!.join('r')}len`;
    const name = `${root} ${nouns[0]}`;
    if (!used.has(nameKey(name)))
      return { name, style: 'toponym', identity: { rootKey: nameKey(root) }, weight: 1 };
  }
  throw new Error('Could not find an unused landscape name.');
}

/** Name an eligible landscape using only caller-owned randomness and immutable batch history. */
export function generateLandscapeName(
  input: LandscapeNameInput,
  context: LandscapeNameContext,
  rng: RNG,
): LandscapeNameResult {
  const normalized = [...new Set(input.nouns.map((noun) => noun.trim()).filter(Boolean))];
  const nouns = normalized.length ? normalized : ['Country'];
  const scope = input.scope ?? 'zone';
  const templates = landscapeTemplates.filter(
    (template) => template.scopes.includes(scope) && eligibleNouns(template, nouns).length,
  );
  const used = new Set(context.usedNames.map(nameKey));
  const weights = styleWeights[scope];
  const options = (Object.keys(weights) as LandscapeNameStyle[]).filter((style) => {
    if (!weights[style]) return false;
    if (style === 'geographic') return input.directions.length > 0;
    if (style === 'cultural') return !!input.culturePatterns;
    return templates.some((template) => template.style === style);
  });
  const style = rng.weighted(
    options.map((value) => ({
      value,
      commonality: weights[value] * (context.recentStyles.at(-1) === value ? 2 : 4),
    })),
  );
  const pool: LandscapeNameCandidate[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; attempt < 32; attempt++) {
    const candidate = makeCandidate(style, templates, input, nouns, rng);
    if (
      !candidate ||
      !candidate.weight ||
      !isWellFormedLandscapeName(candidate.name, candidate.style === 'cultural')
    )
      continue;
    const key = nameKey(candidate.name);
    if (used.has(key) || seen.has(key)) continue;
    pool.push(candidate);
    seen.add(key);
  }
  // Exhausted geography or unusable culture should get another creative form, never an ordinal.
  if (!pool.length && (style === 'cultural' || style === 'geographic')) {
    for (let attempt = 0; attempt < 32; attempt++) {
      const candidate = makeCandidate('descriptive', templates, input, nouns, rng)!;
      if (isWellFormedLandscapeName(candidate.name) && !used.has(nameKey(candidate.name)))
        pool.push(candidate);
    }
  }
  const selected = pool.length
    ? selectCandidate(pool, context, rng)
    : fallbackCandidate(nouns, used);
  return {
    name: selected.name,
    style: selected.style,
    nextContext: {
      usedNames: [...context.usedNames, selected.name],
      recentStyles: [...context.recentStyles, selected.style].slice(-3),
      recentIdentities: [...(context.recentIdentities ?? []), selected.identity].slice(-8),
    },
  };
}

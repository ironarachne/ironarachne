import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generateLandscapeName, isWellFormedLandscapeName } from './landscape_names';
import { landscapeNounVariants, landscapeRoots, landscapeTemplates } from './landscape_name_data';
import type {
  LandscapeNameContext,
  LandscapeNameInput,
  LandscapeNameStyle,
} from './landscape_name_types';
import type { StoredNameGeneratorPatternSet } from './name_generator_patterns';

const context: LandscapeNameContext = { usedNames: [], recentStyles: [] };
const patterns: StoredNameGeneratorPatternSet = {
  name: 'fixture',
  female: ['DOBBY'],
  male: ['DOBBY'],
  family: ['DOBBY'],
  culture: ['DOBBY'],
  country: ['DOBBY'],
  town: ['DOBBY'],
};
const input: LandscapeNameInput = {
  id: 'test',
  nouns: ['Woods'],
  directions: ['east'],
  culturePatterns: patterns,
};
const creativeStyles = ['compound', 'descriptive', 'metaphor', 'toponym', 'of_phrase'];
function forceStyle(style: LandscapeNameStyle, seed = 'style') {
  const rng = new RNG(seed);
  vi.spyOn(rng, 'weighted').mockReturnValueOnce(style);
  return rng;
}
const key = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

describe('landscape names', () => {
  it.each(['region', 'zone'] as const)('handles both RNG boundaries in %s scope', (scope) => {
    for (const boundary of [0, 0.999999]) {
      const rng = new RNG('boundary');
      vi.spyOn(rng, 'next').mockReturnValue(boundary);
      const result = generateLandscapeName(
        { ...input, scope },
        { ...context, recentStyles: ['cultural'] },
        rng,
      );
      expect(result.name.length).toBeGreaterThan(0);
      expect(isWellFormedLandscapeName(result.name, result.style === 'cultural')).toBe(true);
    }
  });

  it('reproduces full names and immutable history with the same seed', () => {
    function batch(seed: string) {
      const rng = new RNG(seed);
      let history = context;
      for (let index = 0; index < 100; index++)
        history = generateLandscapeName(input, history, rng).nextContext;
      return history;
    }
    expect(batch('a')).toEqual(batch('a'));
    expect(batch('a')).not.toEqual(batch('b'));
    const history = batch('a');
    expect(new Set(history.usedNames.map(key)).size).toBe(100);
    expect(history.recentStyles).toHaveLength(3);
    expect(history.recentIdentities).toHaveLength(8);
    expect(history.usedNames.every((name) => !/[\d()]/.test(name))).toBe(true);
    expect(context).toEqual({ usedNames: [], recentStyles: [] });
  });

  it.each([
    'Woods',
    'Hills',
    'Plains',
    'Desert',
    'Wetlands',
    'Tundra',
    'Icefields',
    'Mountains',
    'Country',
  ])('has a diverse, well-formed fresh region repertoire for %s', (noun) => {
    const results = Array.from({ length: 200 }, (_, index) =>
      generateLandscapeName(
        { id: 'quality', scope: 'region', nouns: [noun], directions: [] },
        context,
        new RNG(`quality:${noun}:${index}`),
      ),
    );
    expect(new Set(results.map((result) => key(result.name))).size).toBeGreaterThanOrEqual(180);
    expect(new Set(results.map((result) => result.style))).toEqual(new Set(creativeStyles));
    for (const style of creativeStyles)
      expect(results.filter((result) => result.style === style).length).toBeLessThanOrEqual(120);
    expect(results.every((result) => isWellFormedLandscapeName(result.name))).toBe(true);
    expect(results.every((result) => !/[\d{}]/.test(result.name))).toBe(true);
  });

  it('offers all seven forms for a zone, and no geographic form for a whole region', () => {
    const results = Array.from({ length: 200 }, (_, index) =>
      generateLandscapeName(input, context, new RNG(`all:${index}`)),
    );
    expect(new Set(results.map((result) => result.style))).toEqual(
      new Set([...creativeStyles, 'geographic', 'cultural']),
    );
    const rng = new RNG('region');
    const select = vi.spyOn(rng, 'weighted');
    generateLandscapeName({ ...input, scope: 'region' }, context, rng);
    expect(select.mock.calls[0][0].map((option) => option.value)).not.toContain('geographic');
  });

  it('defaults to zone scope and preserves supplied geographic nouns and directions', () => {
    expect(generateLandscapeName(input, context, new RNG('default'))).toEqual(
      generateLandscapeName({ ...input, scope: 'zone' }, context, new RNG('default')),
    );
    expect(generateLandscapeName(input, context, forceStyle('geographic')).name).toBe(
      'the Eastern Woods',
    );
    expect(
      generateLandscapeName(
        { ...input, directions: ['northwest'] },
        context,
        forceStyle('geographic'),
      ).name,
    ).toBe('the Northwestern Woods');
  });

  it('keeps unsupported nouns literal and supplies neutral country vocabulary for blank input', () => {
    for (const noun of ['Rainforest', 'Mangroves', 'Heights', 'Tundra', 'Stone Gardens']) {
      const names = Array.from(
        { length: 30 },
        (_, index) =>
          generateLandscapeName(
            { id: 'literal', nouns: [noun], directions: [], scope: 'region' },
            context,
            new RNG(`literal:${noun}:${index}`),
          ).name,
      ).join(' ');
      expect(names).not.toMatch(
        /Peaks|Crags|spires|Glacier|Icefields|Icewaste|Northern|Eastern|Southern|Western/,
      );
      if (noun === 'Stone Gardens') expect(names).not.toMatch(/Wood|Forest|Mire|Sands|Desert/);
    }
    expect(
      generateLandscapeName(
        { id: 'blank', nouns: [' '], directions: [] },
        context,
        forceStyle('descriptive'),
      ).name,
    ).toMatch(/Country|Lands|Reaches|Wilds/);
    expect(
      generateLandscapeName(
        { id: 'empty', nouns: [], directions: [] },
        context,
        forceStyle('geographic'),
      ).name,
    ).toBeDefined();
  });

  it('keeps a terrain cue in zones while allowing bare region roots', () => {
    const root = generateLandscapeName(
      { ...input, scope: 'region' },
      context,
      forceStyle('toponym'),
    ).name;
    const zone = generateLandscapeName(input, context, forceStyle('toponym')).name;
    expect(zone).toMatch(/\s(?:Woods|Wood|Weald|Forest)$/);
    expect(root.length).toBeGreaterThan(0);
    for (const style of ['metaphor', 'compound'] as const) {
      const names = Array.from(
        { length: 25 },
        (_, index) => generateLandscapeName(input, context, forceStyle(style, String(index))).name,
      );
      expect(
        names.every((name) =>
          style === 'metaphor'
            ? /Woods|Wood|Weald|Forest/.test(name)
            : /wood|weald|bough|shade|wake/i.test(name),
        ),
      ).toBe(true);
    }
  });

  it('retains personal possessives, family forms, and culture orthography', () => {
    const results = Array.from(
      { length: 40 },
      (_, index) =>
        generateLandscapeName(
          { ...input, nouns: ['Hills'] },
          context,
          forceStyle('cultural', String(index)),
        ).name,
    );
    expect(results).toContain('Dobby’s Hills');
    expect(results).toContain('Dobby Hills');
    expect(
      generateLandscapeName(
        {
          ...input,
          culturePatterns: { ...patterns, female: ['HARRIS'], male: ['HARRIS'], family: [] },
        },
        context,
        forceStyle('cultural'),
      ).name,
    ).toBe('Harris’ Woods');
    const accented = { ...patterns, female: ['ÉLÈNE'], male: [], family: [] };
    expect(
      generateLandscapeName(
        { ...input, culturePatterns: accented },
        context,
        forceStyle('cultural'),
      ).name,
    ).toMatch(/^Élène’s Woods$/);
  });

  it('reports the actual fallback style when culture is absent, empty, blank, or returns no name', () => {
    for (const source of [[], [''], { patterns: [] }, { patterns: [''] }]) {
      const result = generateLandscapeName(
        {
          ...input,
          culturePatterns: { ...patterns, female: source, male: source, family: source },
        },
        context,
        forceStyle('cultural'),
      );
      expect(result.style).toBe('descriptive');
    }
    const result = generateLandscapeName(
      { ...input, culturePatterns: undefined },
      context,
      forceStyle('cultural'),
    );
    expect(result.style).toBe('descriptive');
  });

  it('lowers the weight of the last style and omits ineligible options', () => {
    const rng = new RNG('options');
    const select = vi.spyOn(rng, 'weighted');
    generateLandscapeName(
      { ...input, culturePatterns: undefined, directions: [] },
      { ...context, recentStyles: ['descriptive'] },
      rng,
    );
    const options = select.mock.calls[0][0];
    expect(options.find((option) => option.value === 'descriptive')?.commonality).toBe(70);
    expect(options.map((option) => option.value)).not.toContain('cultural');
    expect(options.map((option) => option.value)).not.toContain('geographic');
  });

  it('avoids recent motif reuse and authored names without confusing shared terrain for identity', () => {
    const names = [
      'the Ragged Woods',
      'the Hollow Forest',
      'the Hidden Wood',
      'the Dreaming Weald',
    ];
    const motifs = ['ragged', 'hollow', 'hidden', 'dream'];
    for (let index = 0; index < 20; index++) {
      const history = {
        usedNames: names,
        recentStyles: [],
        recentIdentities: motifs.map((motifKey) => ({ motifKey })),
      };
      const result = generateLandscapeName(
        input,
        history,
        forceStyle('descriptive', String(index)),
      );
      expect(motifs).not.toContain(result.nextContext.recentIdentities!.at(-1)!.motifKey);
      expect(result.name).toMatch(/Woods|Forest|Wood|Weald/);
      expect(history.usedNames).toEqual(names);
    }
  });

  it('avoids a recent root and one-letter variants across root-bearing forms', () => {
    const first = generateLandscapeName(input, context, forceStyle('toponym', 'first'));
    const root = first.nextContext.recentIdentities!.at(-1)!.rootKey!;
    const near = `${root[0] === 'v' ? 't' : 'v'}${root.slice(1)}`;
    const history = {
      ...first.nextContext,
      recentIdentities: [{ rootKey: root }, { rootKey: near }],
    };
    for (let index = 0; index < 20; index++) {
      const result = generateLandscapeName(input, history, forceStyle('toponym', String(index)));
      const chosen = result.nextContext.recentIdentities!.at(-1)!.rootKey!;
      expect(chosen).not.toBe(root);
      expect(chosen).not.toBe(near);
    }
  });

  it('recognizes shared imagery in authored compounds and descriptive labels', () => {
    const history = {
      ...context,
      usedNames: ['Hushbough Woods', 'Dreamweald Forest', 'the Mournful Fens'],
    };
    for (let index = 0; index < 20; index++) {
      const result = generateLandscapeName(
        input,
        history,
        forceStyle('descriptive', `legacy:${index}`),
      );
      expect(result.name).not.toMatch(/^the (Hushed|Dreaming|Mournful) /);
    }
  });

  it('normalizes exact duplicates and exhausts a controlled pool without ordinals or IDs', () => {
    let history: LandscapeNameContext = {
      usedNames: [' THE   EASTERN Woods ', 'the Ragged Woods'],
      recentStyles: [],
    };
    const results: string[] = [];
    for (let index = 0; index < 40; index++) {
      const rng = forceStyle('geographic');
      vi.spyOn(rng, 'next').mockReturnValue(0);
      const result = generateLandscapeName(input, history, rng);
      expect(result.style).toBe('toponym');
      expect(history.usedNames.map(key)).not.toContain(key(result.name));
      expect(result.name).not.toMatch(/[\d(){}]/);
      expect(result.name).not.toContain(input.id);
      expect(isWellFormedLandscapeName(result.name)).toBe(true);
      history = result.nextContext;
      results.push(result.name);
    }
    expect(new Set(results).size).toBe(40);
  });

  it('relaxes motif preferences when the only geographic identity remains usable', () => {
    const rng = forceStyle('geographic');
    const result = generateLandscapeName(input, { ...context, usedNames: ['Other Woods'] }, rng);
    expect(result.name).toBe('the Eastern Woods');
  });

  it('rejects duplicate words, accidental syllable repeats, and triple letters', () => {
    for (const name of ['the Woods Woods', 'the {noun}', 'Nanan Woods', 'Ellla Forest', ' '])
      expect(isWellFormedLandscapeName(name)).toBe(false);
    expect(isWellFormedLandscapeName('Élène’s Hills', true)).toBe(true);
    expect(isWellFormedLandscapeName('Harris’ Woods', true)).toBe(true);
  });

  it('uses stable, unique vocabulary records with grounded nouns and valid substitutions', () => {
    expect(new Set(landscapeTemplates.map((template) => template.id)).size).toBe(
      landscapeTemplates.length,
    );
    for (const template of landscapeTemplates) {
      expect(template.eligibleNouns.every((noun) => noun in landscapeNounVariants)).toBe(true);
      expect(
        template.forms.every(
          (form) => !form.replaceAll('{root}', '').replaceAll('{noun}', '').includes('{'),
        ),
      ).toBe(true);
      if (template.forms.some((form) => form.includes('{root}')))
        expect(template.rootPalette).toBeDefined();
    }
    const roots = Object.values(landscapeRoots).flat();
    expect(new Set(roots).size).toBe(roots.length);
    expect(roots.every((root) => /^[A-Z][a-z]+$/.test(root) && /[aeiou]/.test(root))).toBe(true);
  });
});

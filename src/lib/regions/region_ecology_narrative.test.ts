import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { rollRegion, rollRegionSnapshot } from './region_roll';
import { emptyRegionFacts } from './region_facts';
import { toRegionSnapshot } from './region_snapshot';
import { regionArtifactKind, validateRegionSnapshot } from './region_artifact_kind';
import { regionToDocument, regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import { setRegionPlaceText, removeRegionPlace } from './region_editing';
import { setRegionResourceFactText, staleRegionFactDependents } from './region_resource_editing';
import {
  ECOLOGY_SUMMARY_ID,
  generateEcologyNarrative,
  legacyEcologyParagraph,
} from './region_ecology_narrative';
import type { EcologyInhabitantFact, EcologyRelationshipFact } from './region_ecology_types';

const base = rollRegion('ecology-paragraph-fixture', { affiliation: 'affiliated' }).region;
const reason = (ids: string[], status: 'current' | 'stale' = 'current') => ({
  ruleId: 'test:ecology',
  status,
  sources: ids.map((factId) => ({ kind: 'fact' as const, factId })),
});
function population(
  id: string,
  name: string,
  category: EcologyInhabitantFact['category'] = 'flora',
): EcologyInhabitantFact {
  return {
    id,
    name,
    category,
    roles: category === 'flora' ? ['producer'] : ['grazer'],
    description: `${name} occupies the wet banks.`,
    origin: 'generated',
    source: { kind: 'described', label: name },
    habitatIds: ['habitat:marsh'],
    reason: reason(['habitat:marsh']),
  };
}
function fixture() {
  const region = {
    ...base,
    facts: emptyRegionFacts('current'),
    settlements: base.settlements.map((entry) => ({ ...entry, name: 'Reedbank' })),
  };
  region.facts.areas = [
    { ...base.facts!.areas.find((fact) => fact.id === 'area:land')!, reason: undefined },
  ];
  region.facts.habitats = [
    {
      id: 'habitat:marsh',
      name: 'Silver Marsh',
      description: 'A freshwater marsh.',
      origin: 'generated',
      areaIds: ['area:land'],
      reason: reason(['area:land']),
    },
  ];
  region.facts.ecologyInhabitants = [
    population('reeds', 'reeds'),
    population('deer', 'deer', 'fauna'),
    population('moss', 'moss'),
  ];
  region.facts.ecologyRelationships = [
    {
      id: 'use:reeds',
      name: 'Reed gathering',
      description: 'Reeds in Silver Marsh provide materials for Reedbank.',
      origin: 'generated',
      subjectId: 'reeds',
      habitatIds: ['habitat:marsh'],
      relation: {
        kind: 'used-by',
        settlement: { kind: 'embedded', settlementId: region.settlementIds![0] },
        use: 'material',
      },
      reason: reason(['reeds', 'habitat:marsh']),
    },
  ];
  return region;
}
function summary(region: ReturnType<typeof fixture>) {
  return region.facts.claims.find((fact) => fact.id === ECOLOGY_SUMMARY_ID);
}
function compose(seed = 'paragraph') {
  const region = fixture();
  generateEcologyNarrative(region, new RNG(seed));
  return region;
}

describe('regional ecology narrative', () => {
  it('explains local use and location, omitting presence alone', () => {
    const region = compose();
    expect(summary(region)?.description).toMatch(/reeds.*Silver Marsh|Silver Marsh.*reeds/);
    expect(summary(region)?.description).toContain('Reedbank');
    expect(summary(region)?.description).toContain('materials');
    expect(summary(region)?.description).not.toMatch(/deer|moss|wet banks/);
    expect(summary(region)?.relatedIds).toEqual(['habitat:marsh', 'reeds', 'use:reeds']);
    expect(summary(region)?.reason?.sources).toContainEqual({ kind: 'fact', factId: 'area:land' });
  });

  it('is seeded, varies wording, and respects stable identity order', () => {
    const texts = new Set<string>();
    for (let index = 0; index < 40; index++) {
      const seed = `wording:${index}`;
      const first = compose(seed);
      const second = fixture();
      second.facts.ecologyInhabitants.reverse();
      generateEcologyNarrative(second, new RNG(seed));
      expect(summary(second)).toEqual(summary(first));
      texts.add(summary(first)!.description);
    }
    expect(texts.size).toBe(3);
    for (const text of texts) {
      expect(text).toMatch(/^[A-Z].*\.$/);
      expect(text).not.toMatch(/, reeds provides|, deer feeds|undefined|\s{2}/);
    }
  });

  it.each(['area:land', 'habitat:marsh', 'reeds', 'use:reeds'])(
    'omits stale evidence at %s',
    (id) => {
      const region = fixture();
      const fact = [
        ...region.facts.areas,
        ...region.facts.habitats,
        ...region.facts.ecologyInhabitants,
        ...region.facts.ecologyRelationships,
      ].find((entry) => entry.id === id)!;
      fact.reason = reason(['area:land'], 'stale');
      generateEcologyNarrative(region, new RNG('stale'));
      expect(summary(region)).toBeUndefined();
      expect(legacyEcologyParagraph(toRegionSnapshot(region))).toBe('');
    },
  );

  it('handles cyclic evidence and omits missing upstream facts', () => {
    const region = fixture();
    region.facts.habitats[0].reason = reason(['reeds']);
    generateEcologyNarrative(region, new RNG('cycle'));
    expect(summary(region)).toBeDefined();
    const missing = fixture();
    missing.facts.ecologyInhabitants[0].reason = reason(['missing']);
    generateEcologyNarrative(missing, new RNG('missing'));
    expect(summary(missing)).toBeUndefined();
  });

  it.each([
    'blank-population',
    'blank-habitat',
    'missing-habitat',
    'absent-habitat-link',
    'missing-settlement',
    'blank-settlement',
    'external-settlement',
  ])('omits unsupported %s', (change) => {
    const region = fixture();
    const use = region.facts.ecologyRelationships[0];
    if (change === 'blank-population') region.facts.ecologyInhabitants[0].name = ' ';
    if (change === 'blank-habitat') region.facts.habitats[0].name = ' ';
    if (change === 'missing-habitat') region.facts.habitats = [];
    if (change === 'absent-habitat-link') region.facts.ecologyInhabitants[0].habitatIds = [];
    if (change === 'missing-settlement') region.settlements = [];
    if (change === 'blank-settlement') region.settlements[0].name = ' ';
    if (change === 'external-settlement')
      use.relation = {
        kind: 'used-by',
        use: 'material',
        settlement: { kind: 'artifact', targetId: 'external' },
      };
    generateEcologyNarrative(region, new RNG('unsupported'));
    expect(summary(region)).toBeUndefined();
  });

  it('prioritizes residents and caps focus at four populations with seed variation', () => {
    const texts = new Set<string>();
    for (let index = 0; index < 30; index++) {
      const region = fixture();
      for (let other = 0; other < 6; other++) {
        const entry = population(`grazer:${other}`, `grazer ${other}`, 'fauna');
        region.facts.ecologyInhabitants.push(entry);
        region.facts.ecologyRelationships.push({
          id: `feed:${other}`,
          name: 'Feeding',
          description: `${entry.name} feeds on moss in Silver Marsh.`,
          origin: 'generated',
          subjectId: entry.id,
          habitatIds: ['habitat:marsh'],
          relation: { kind: 'feeds-on', targetId: 'moss' },
          reason: reason([entry.id, 'moss']),
        });
      }
      generateEcologyNarrative(region, new RNG(`focus:${index}`));
      const text = summary(region)!.description;
      expect(text).toContain('Reedbank');
      expect(text.match(/\./g)).toHaveLength(4);
      texts.add(text);
    }
    expect(texts.size).toBeGreaterThan(10);
  });

  it('allows supported fantastical subjects or targets occasionally, at most one per paragraph', () => {
    let appeared = 0;
    for (let index = 0; index < 200; index++) {
      const region = fixture();
      region.facts.ecologyInhabitants[1].category = 'fantastical';
      region.facts.ecologyRelationships.push({
        id: 'feed:fantasy',
        name: 'Feeding',
        description: 'Deer feeds on reeds in Silver Marsh.',
        origin: 'generated',
        subjectId: 'deer',
        habitatIds: ['habitat:marsh'],
        relation: { kind: 'feeds-on', targetId: 'reeds' },
      });
      region.facts.ecologyRelationships.push({
        id: 'feed:fantasy-target',
        name: 'Feeding',
        description: 'Moss feeds on deer in Silver Marsh.',
        origin: 'authored',
        subjectId: 'moss',
        habitatIds: ['habitat:marsh'],
        relation: { kind: 'feeds-on', targetId: 'deer' },
      });
      generateEcologyNarrative(region, new RNG(`fantasy:${index}`));
      const references = summary(region)!.relatedIds.filter((id) => id.startsWith('feed:fantasy'));
      expect(references.length).toBeLessThanOrEqual(1);
      if (references.length) appeared++;
    }
    expect(appeared).toBeGreaterThan(5);
    expect(appeared).toBeLessThan(40);
  });

  it('uses explicit gathering hazards, with one meaning per population', () => {
    const region = fixture();
    region.facts.notables.push({
      id: 'hazard:gathering',
      name: 'Hazardous banks',
      description: 'Gathering is hazardous. Hook: Scout first.',
      origin: 'generated',
      kind: 'hazard',
      areaIds: ['area:land'],
      reason: {
        ...reason(['deer', 'use:reeds']),
        ruleId: 'fantasy:region:ecology-bank-gathering:v1',
      },
    });
    generateEcologyNarrative(region, new RNG('hazard'));
    expect(summary(region)?.description).toMatch(/gatherers|gathering/);
    expect(summary(region)?.description).toContain('deer');
    expect(summary(region)?.description).not.toContain('Hook:');
    expect(summary(region)?.relatedIds).toContain('hazard:gathering');
  });

  it.each(['pollinates', 'pest-of', 'competes-with', 'feeds-on'] as const)(
    'expresses only the supported %s relationship',
    (kind) => {
      const region = fixture();
      region.facts.ecologyRelationships = [
        {
          ...region.facts.ecologyRelationships[0],
          id: 'relationship',
          subjectId: 'deer',
          relation: { kind, targetId: 'moss' },
        },
      ];
      const texts = new Set<string>();
      for (let index = 0; index < 30; index++) {
        region.facts.claims = [];
        generateEcologyNarrative(region, new RNG(`relation:${index}`));
        const text = summary(region)!.description;
        expect(text).toContain('deer');
        expect(text).toContain('moss');
        expect(text).toContain('Silver Marsh');
        expect(text).toMatch(/^[A-Z].*\.$/);
        texts.add(text);
      }
      expect(texts.size).toBe(2);
    },
  );

  it('omits missing and stale targets and duplicate reciprocal relationships', () => {
    const region = fixture();
    const relation: EcologyRelationshipFact = {
      ...region.facts.ecologyRelationships[0],
      id: 'competes',
      subjectId: 'deer',
      relation: { kind: 'competes-with', targetId: 'moss' },
    };
    region.facts.ecologyRelationships = [
      relation,
      {
        ...relation,
        id: 'reverse',
        subjectId: 'moss',
        relation: { kind: 'competes-with', targetId: 'deer' },
      },
    ];
    generateEcologyNarrative(region, new RNG('reciprocal'));
    expect(summary(region)?.description.match(/\./g)).toHaveLength(1);
    region.facts.claims = [];
    region.facts.ecologyInhabitants = region.facts.ecologyInhabitants.filter(
      (entry) => entry.id !== 'moss',
    );
    generateEcologyNarrative(region, new RNG('missing-target'));
    expect(summary(region)).toBeUndefined();
  });

  it('keeps saved and authored words across exports, editing and re-composition attempts', async () => {
    const region = compose();
    const saved = rollRegionSnapshot('alpha');
    expect(validateRegionSnapshot(saved)).toMatchObject({ ok: true });
    const codec = await regionArtifactKind.loadCodec();
    const reopened = codec.toSnapshot(codec.fromSnapshot(saved, undefined as never));
    expect(reopened).toEqual(saved);
    const edited = setRegionResourceFactText(
      reopened,
      'claims',
      ECOLOGY_SUMMARY_ID,
      'description',
      'An authored account of the marsh.',
    );
    const claim = edited.facts.claims.find((fact) => fact.id === ECOLOGY_SUMMARY_ID)!;
    expect(claim.origin).toBe('authored');
    region.facts.claims = edited.facts.claims;
    generateEcologyNarrative(region, new RNG('another-seed'));
    expect(summary(region)).toEqual(claim);
    for (const text of [regionToMarkdown(edited), regionToText(edited)]) {
      expect(text).toContain(claim.description);
      expect(text).not.toContain('## Inhabitants');
      expect(text).not.toContain(`Regional ecology: ${claim.description}`);
    }
    const ui = regionToUiDocument(edited).sections.find(
      (section) => section.heading === 'Flora and fauna',
    )!;
    expect(ui.entries).toHaveLength(1);
    expect(ui.entries[0].heading).toBe('');
    expect(ui.entries[0].body).toBe(claim.description);
    expect(regionToMarkdown(edited)).toContain(`## Flora and fauna\n\n${claim.description}`);
    expect(regionToMarkdown(edited)).not.toContain(`## Flora and fauna\n\n- `);
  });

  it('marks supporting edits stale, retaining words, and removes generated settlement dependents', () => {
    const saved = toRegionSnapshot(compose());
    const edited = setRegionPlaceText(saved, 'settlements', 0, 'name', 'New name');
    const claim = edited.facts.claims.find((fact) => fact.id === ECOLOGY_SUMMARY_ID)!;
    expect(claim.description).toBe(saved.facts.claims[0].description);
    expect(claim.reason?.status).toBe('stale');
    expect(regionToMarkdown(edited)).toContain('[Supporting explanation needs review.]');
    const removed = removeRegionPlace(saved, 'settlements', 0);
    expect(removed.facts.claims.some((fact) => fact.id === ECOLOGY_SUMMARY_ID)).toBe(false);
    expect(
      staleRegionFactDependents(saved.facts, new Set(['reeds'])).claims[0].reason?.status,
    ).toBe('stale');
  });

  it('uses a deterministic, bounded legacy paragraph without rewriting saved text', () => {
    const saved = toRegionSnapshot(fixture());
    const before = structuredClone(saved);
    const text = legacyEcologyParagraph(saved);
    expect(text).toBe(saved.facts.ecologyRelationships[0].description);
    expect(
      regionToDocument(saved).sections.find((section) => section.heading === 'Flora and fauna')
        ?.lines,
    ).toEqual([text]);
    expect(
      regionToUiDocument(saved).sections.find((section) => section.heading === 'Flora and fauna')
        ?.entries[0],
    ).toEqual({ heading: '', body: text });
    expect(saved).toEqual(before);
    saved.facts.ecologyRelationships[0].description =
      'Local reeds. One use. Another detail. Final detail. Too much detail.';
    expect(legacyEcologyParagraph(saved)).toBe('');
    saved.facts.ecologyRelationships = [];
    expect(
      regionToDocument(saved).sections.some((section) => section.heading === 'Flora and fauna'),
    ).toBe(false);
  });

  it.each(['alpha', 'bravo', 'charlie', 'delta'])(
    'validates and round-trips exact ecology words for %s',
    async (seed) => {
      const codec = await regionArtifactKind.loadCodec();
      const saved = rollRegionSnapshot(seed);
      expect(validateRegionSnapshot(saved).ok).toBe(true);
      const claim = saved.facts.claims.find((entry) => entry.id === ECOLOGY_SUMMARY_ID);
      if (seed === 'alpha' || seed === 'bravo') expect(claim).toBeDefined();
      const before = structuredClone(saved);
      const restored = codec.toSnapshot(codec.fromSnapshot(saved, undefined as never));
      expect(restored).toEqual(saved);
      expect(regionToMarkdown(restored)).toBe(regionToMarkdown(saved));
      expect(saved).toEqual(before);
    },
  );
});

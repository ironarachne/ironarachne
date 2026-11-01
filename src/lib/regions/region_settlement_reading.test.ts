import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it, vi } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { migrateRegionSnapshot, validateRegionSnapshot } from './region_artifact_kind';
import { rollRegionSnapshot } from './region_roll';
import { regionFromSnapshot } from './region_rehydrate';
import { toRegionSnapshot, type RegionSnapshot } from './region_snapshot';
import { generateRegionGazetteer, regionEditorialCandidates } from './region_editorial';
import { regionToMarkdown, regionToText } from './region_presentation';
import { regionToUiDocument } from './region_ui_presentation';
import {
  settlementWorkOptions,
  settlementCharacterObservation,
} from './region_settlement_reading_evidence';
import { regionGazetteerError } from './region_editorial_validation';
import { editorialSentenceChecker } from './region_editorial_evidence';
import { setRegionPlaceText, removeRegionPlace } from './region_editing';
import { setRegionResourceFactText } from './region_resource_editing';
import {
  settlementReadingsError,
  settlementCharacterObservationError,
} from './region_settlement_reading_validation';

const migrated = migrateRegionSnapshot(
  JSON.parse(
    gunzipSync(
      readFileSync(new URL('../../../test_fixtures/region_445_belvorn.json.gz', import.meta.url)),
    ).toString(),
  ),
  14,
);
if (!migrated.ok) throw new Error(migrated.message);
const historical = migrated.value;
const base = rollRegionSnapshot('5wyedz5q272fz');
function composed(snapshot: RegionSnapshot) {
  const source = structuredClone(snapshot);
  delete source.gazetteer;
  const region = regionFromSnapshot(source, new RNG('restore'));
  generateRegionGazetteer(region, new RNG('449'));
  return toRegionSnapshot(region);
}
const stone = (snapshot: RegionSnapshot) =>
  snapshot.facts.products.find((entry) => entry.productKey === 'dressed-stone')!;

describe('saved settlement reading', () => {
  it('retains the actual historical material chains without asserting installed tools or yields', () => {
    const drying = historical.facts.products.find(
      (entry) => entry.productKey === 'dried-provisions',
    )!;
    expect(settlementWorkOptions(historical, drying)[0]).toMatch(
      /Maenas could dry bison meat.*covered drying racks.*limited/,
    );
    expect(settlementWorkOptions(historical, stone(historical))[0]).toMatch(
      /Cilaamir could dress basalt.*stoneworking tools.*limited/,
    );
    const result = composed(historical);
    const markdown = regionToMarkdown(result);
    expect(markdown).toContain('#### Possible work');
    expect(markdown).toContain('bison meat');
    expect(markdown).toContain('stoneworking tools');
    expect(result.facts).toEqual(historical.facts);
    expect(validateRegionSnapshot(result).ok).toBe(true);
  });
  it('uses explicit limitations and omits stale, inaccessible and cyclic chains', () => {
    const source = structuredClone(historical);
    const product = stone(source);
    expect(settlementWorkOptions(source, product)[0]).toContain('limited supplies of basalt');
    product.reason!.status = 'stale';
    expect(settlementWorkOptions(source, product)).toEqual([]);
    product.reason!.status = 'current';
    const input = product.inputs[0];
    if (input.kind !== 'resource') throw new Error('Missing raw input');
    input.anchor.nodeIds = [999999];
    expect(settlementWorkOptions(source, product)).toEqual([]);
    product.inputs = [{ kind: 'product', role: 'material', productId: product.id }];
    expect(settlementWorkOptions(source, product)).toEqual([]);
  });
  it('reads source food metadata supplied by a reactive saved editor without cloning proxies', () => {
    const snapshot = rollRegionSnapshot('449-opportunity');
    const product = snapshot.facts.products.find(
      (entry) => entry.productKey === 'dried-provisions',
    )!;
    const expected = settlementWorkOptions(snapshot, product);
    expect(expected.length).toBeGreaterThan(0);
    for (const source of snapshot.facts.resourceSources)
      source.resource.food = new Proxy(source.resource.food, {});
    expect(settlementWorkOptions(snapshot, product)).toEqual(expected);
  });
  it('keeps explicit imported dependencies conditional and rejects unspecified imports', () => {
    const source = structuredClone(historical);
    const product = stone(source);
    product.inputs = [
      {
        kind: 'import',
        role: 'material',
        resourceName: 'basalt',
        explanation: 'brought from elsewhere',
        satisfies: { kind: 'raw', majorType: 'stone', minorTypes: [], resourceNames: [] },
      },
    ];
    const words = settlementWorkOptions(source, product)[0];
    expect(words).toContain('could dress basalt');
    expect(words).toContain('depending on imported basalt (brought from elsewhere)');
    if (product.inputs[0].kind !== 'import') throw new Error('Missing import');
    delete product.inputs[0].satisfies;
    expect(settlementWorkOptions(source, product)).toEqual([]);
  });
  it('does not paraphrase authored or unknown-recipe work', () => {
    const source = structuredClone(historical);
    const product = stone(source);
    product.origin = 'authored';
    expect(settlementWorkOptions(source, product)).toEqual([]);
    product.origin = 'generated';
    product.recipeId = 'unknown';
    expect(settlementWorkOptions(source, product)).toEqual([]);
  });
  it('stores each sentence once with one role, bounded across the whole region', () => {
    expect(base.gazetteer?.version).toBe(6);
    if (base.gazetteer?.version !== 6) throw new Error('Missing reading');
    const all = base.gazetteer.blocks.flatMap((block) => block.sentences);
    expect(all.length).toBeLessThanOrEqual(24);
    expect(base.gazetteer.settlementReadings).toHaveLength(base.settlements.length);
    for (const reading of base.gazetteer.settlementReadings) {
      expect(reading.portraitSentenceIds.length).toBeLessThanOrEqual(2);
      expect(reading.opportunitySentenceIds.length).toBeLessThanOrEqual(1);
      const ids = [...reading.portraitSentenceIds, ...reading.opportunitySentenceIds];
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((id) => all.some((sentence) => sentence.id === id))).toBe(true);
      const entry = base.settlements.find(
        (entry) =>
          reading.settlement.kind === 'embedded' && entry.id === reading.settlement.settlementId,
      )!;
      expect(entry.snapshot.description).toBe(
        all
          .filter((sentence) => reading.portraitSentenceIds.includes(sentence.id))
          .map((sentence) => sentence.text)
          .join(' '),
      );
      expect(entry.descriptionReason).toBeDefined();
    }
    expect(regionGazetteerError(base.gazetteer, base)).toBeNull();
  });
  it('preserves authored portraits and blanks while keeping independently supported work', () => {
    const result = composed(historical);
    const index = result.settlements.findIndex((entry) => entry.snapshot.name === 'Maenas');
    const edited = setRegionPlaceText(
      result,
      'settlements',
      index,
      'description',
      'My own portrait.',
    );
    expect(regionToMarkdown(edited)).toContain('My own portrait.');
    expect(regionToMarkdown(edited)).toContain('bison meat');
    const blank = setRegionPlaceText(edited, 'settlements', index, 'description', '');
    expect(regionToMarkdown(blank)).not.toContain('My own portrait.');
    expect(regionToMarkdown(blank)).toContain('bison meat');
  });
  it('prints authored activities and opportunities once in their own parts', () => {
    const result = composed(historical);
    const product = stone(result);
    const edited = setRegionResourceFactText(
      result,
      'products',
      product.id,
      'description',
      'My authored opportunity.',
    );
    const text = regionToMarkdown(edited);
    expect(text.match(/My authored opportunity\./g)).toHaveLength(1);
    expect(text).not.toContain('could dress basalt');
  });
  it('invalidates facet observations independently and never replaces a stale portrait', () => {
    const snapshot = structuredClone(base);
    const sentence = snapshot
      .gazetteer!.blocks.flatMap((block) => block.sentences)
      .find((sentence) =>
        sentence.observations.some((observation) => observation.kind === 'settlement-character'),
      )!;
    expect(sentence).toBeDefined();
    const observation = sentence.observations.find(
      (observation) => observation.kind === 'settlement-character',
    )!;
    if (observation.kind !== 'settlement-character') throw new Error('Missing observation');
    snapshot.settlements.find(
      (entry) => entry.id === observation.settlementId,
    )!.snapshot.lawAndOrder += 1;
    expect(editorialSentenceChecker(snapshot)(sentence)).toBe(false);
    expect(regionToMarkdown(snapshot)).not.toContain(sentence.text);
    expect(snapshot.gazetteer!.blocks.flatMap((block) => block.sentences)).toContainEqual(sentence);
  });
  it('keeps UI, Markdown and PDF text on the same saved words without RNG', () => {
    const result = composed(historical);
    const before = structuredClone(result);
    const draw = vi.spyOn(RNG.prototype, 'next');
    const ui = regionToUiDocument(result);
    const markdown = regionToMarkdown(result);
    const text = regionToText(result);
    for (const entry of ui.sections.find((section) => section.heading === 'Settlements')!.entries) {
      expect(markdown).toContain(entry.heading);
      expect(text).toContain(entry.heading);
      if (entry.possibleWork) {
        expect(markdown).toContain(entry.possibleWork);
        expect(text).toContain(entry.possibleWork);
      }
    }
    expect(draw).not.toHaveBeenCalled();
    draw.mockRestore();
    expect(result).toEqual(before);
  });
  it('preserves legacy text during migration and the complete new plan through round trips', () => {
    const old = { ...structuredClone(base), gazetteer: undefined };
    expect(migrateRegionSnapshot(old, 22)).toEqual({ ok: true, value: old });
    expect(toRegionSnapshot(regionFromSnapshot(base, new RNG('reopen')))).toEqual(base);
    const removed = removeRegionPlace(base, 'settlements', 0);
    expect(validateRegionSnapshot(removed).ok).toBe(true);
  });
  it('rejects foreign roles, duplicate roles, missing identities and malformed observations', () => {
    if (base.gazetteer?.version !== 6) throw new Error('Missing reading');
    const plan = structuredClone(base.gazetteer);
    const nonempty = plan.settlementReadings.find((reading) => reading.portraitSentenceIds.length)!;
    const id = nonempty.portraitSentenceIds[0];
    nonempty.opportunitySentenceIds.push(id);
    expect(settlementReadingsError(plan, base)).toBeTruthy();
    expect(
      settlementReadingsError({ ...base.gazetteer, settlementReadings: [] }, base),
    ).toBeTruthy();
    expect(settlementReadingsError(undefined, base)).toBeTruthy();
    expect(settlementCharacterObservationError({})).toBeTruthy();
    const observation = settlementCharacterObservation(
      base.settlements[0].id,
      base.settlements[0].snapshot,
    );
    expect(settlementCharacterObservationError(observation)).toBeNull();
    expect(
      settlementCharacterObservationError({ ...observation, settlementTags: ['b', 'a'] }),
    ).toBeTruthy();
  });
  it('normalizes batch meaning families while preserving settlement assertion ownership', () => {
    const region = regionFromSnapshot(base, new RNG('context'));
    const candidates = regionEditorialCandidates(region).filter(
      (candidate) => candidate.settlementReadingRole === 'portrait',
    );
    expect(candidates.length).toBeGreaterThan(8);
    expect(
      new Set(candidates.map((candidate) => candidate.narrative.templates[0].id)).size,
    ).toBeLessThan(candidates.length);
    expect(new Set(candidates.flatMap((candidate) => candidate.assertionKeys)).size).toBe(
      candidates.length,
    );
  });
});

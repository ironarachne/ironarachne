import { describe, expect, it } from 'vitest';
import { allSpecies } from '$lib/species';
import { resolvePlantDefinition } from '$lib/environment';
import {
  getBiologicalRawResources,
  getBiologicalSourceDefinitions,
  getManagedProductionRules,
  snapshotRawResource,
} from './raw_biological_catalog';
import { deriveResourcesFromSpecies } from './species_resource_derivation';

describe('reviewed raw biological source catalogs', () => {
  it('resolves every reviewed producer and raw identity, without inventing deferred products', () => {
    const raws = getBiologicalRawResources();
    const sources = getBiologicalSourceDefinitions();
    expect(new Set(raws.map((entry) => entry.id)).size).toBe(raws.length);
    expect(new Set(sources.map((entry) => entry.id)).size).toBe(sources.length);
    for (const source of sources) {
      const producer = source.producer;
      expect(
        raws.some((entry) => entry.id === source.rawResourceId),
        source.id,
      ).toBe(true);
      expect(
        producer.kind === 'plant'
          ? resolvePlantDefinition(producer.plantId)
          : allSpecies.find((entry) => entry.name === producer.speciesName),
        source.id,
      ).toBeDefined();
      expect(source.habitats.length).toBeGreaterThan(0);
      expect(source.reviewRefs.length).toBeGreaterThan(0);
      expect(source.requirements.length).toBeGreaterThan(0);
      expect(
        source.mode === 'wild' ? source.wildOccurrenceForm : source.wildOccurrenceForm === null,
      ).toBeTruthy();
    }
    for (const deferred of [
      'goat-textile-hair',
      'camel-textile-hair',
      'chicken-egg',
      'oak-acorn',
      'oak-gall',
      'common-bean-seed',
      'herring-flesh',
      'brook-trout-flesh',
    ])
      expect(raws.some((entry) => entry.id === deferred)).toBe(false);
    for (const raw of raws) expect(raw.uses.includes('food')).toBe(raw.food.kind === 'food');
  });
  it('distinguishes management, colonies, raw plant parts and source-qualified aquatic food', () => {
    const sources = getBiologicalSourceDefinitions();
    expect(
      sources.filter((entry) => entry.rawResourceId === 'cow-milk').map((entry) => entry.mode),
    ).toEqual(['husbandry']);
    expect(
      sources
        .filter((entry) => entry.rawResourceId === 'honeycomb')
        .map((entry) => entry.mode)
        .sort(),
    ).toEqual(['apiary', 'wild']);
    expect(
      sources.find((entry) => entry.rawResourceId === 'honeycomb' && entry.mode === 'wild')
        ?.wildOccurrenceForm,
    ).toBe('colony');
    expect(
      sources.some(
        (entry) => entry.producer.kind === 'species' && entry.producer.speciesName === 'giant bee',
      ),
    ).toBe(false);
    const raws = getBiologicalRawResources();
    expect(raws.find((entry) => entry.id === 'cotton-seed-fiber')?.resource.minor_type).toBe(
      'seed-cotton',
    );
    expect(raws.find((entry) => entry.id === 'perch-flesh')?.resource.minor_type).toBe('fish');
    expect(raws.find((entry) => entry.id === 'noble-crayfish-flesh')?.resource.minor_type).toBe(
      'crayfish',
    );
    for (const species of allSpecies.filter((entry) => entry.tags.includes('reviewed-source-only')))
      expect(deriveResourcesFromSpecies(species)).toEqual([]);
    const wheat = raws.find((entry) => entry.id === 'wheat-grain')!;
    const saved = snapshotRawResource(wheat);
    expect(saved.food).toEqual({
      kind: 'food',
      preparation: 'recipe-required',
      productKeys: ['wheat-bread', 'cooked-wheat'],
    });
    saved.uses.length = 0;
    expect(wheat.uses).toEqual(['food']);
  });
  it('gives managed producers explicit support and stable independent catalog copies', () => {
    const rules = getManagedProductionRules();
    expect(new Set(rules.map((entry) => entry.id)).size).toBe(rules.length);
    for (const rule of rules) {
      expect(rule.supportRequirements).toContain('freshwater');
      expect(rule.supportRequirements).toContain(
        rule.mode === 'cultivation'
          ? 'cultivable-ground'
          : rule.mode === 'apiary'
            ? 'flowering-forage'
            : 'grazing',
      );
    }
    const first = getBiologicalSourceDefinitions();
    const second = getBiologicalSourceDefinitions();
    expect(first).toEqual(second);
    first[0].habitats.length = 0;
    first[0].requirements.length = 0;
    expect(getBiologicalSourceDefinitions()).toEqual(second);
  });
});

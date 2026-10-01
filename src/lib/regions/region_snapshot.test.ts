import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';

import { rollRegion } from './region_roll';
import { regionFromSnapshot, realmTypeFromStoredName } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';
import { validateRegionSnapshot } from './region_artifact_kind';
import type { RegionFacts } from './region_fact_types';

/**
 * Requirement 7.2: `fromSnapshot(toSnapshot(x))` preserves everything that matters.
 *
 * "Everything that matters" for a region is the map, the words, and the places on it. What
 * deliberately does not survive is what the stored vocabulary rebuilds by name — a character's
 * species object, a charge's rendering closure, a realm type's table row — so those are checked by
 * name rather than by identity.
 */
const region = rollRegion('round-trip-seed').region;

describe('a region snapshot', () => {
  const snapshot = toRegionSnapshot(region);
  const restored = regionFromSnapshot(snapshot, new RNG('rehydrate'));

  it('keeps the region’s own words and its map', () => {
    expect(restored.name).toEqual(region.name);
    expect(restored.description).toEqual(region.description);
    expect(restored.map).toEqual(region.map);
    expect(restored.mainRealm).toEqual(region.mainRealm);
  });

  it('loads edited settlement sites and roles without moving, renaming or regenerating them', () => {
    const edited = structuredClone(snapshot);
    edited.settlements.reverse();
    edited.settlements[0].snapshot.name = 'Authored Town';
    edited.settlements[0].snapshot.mapNodeId = edited.map.nodes.find(
      (node) => !node.isOcean && !node.isWater,
    )!.id;
    edited.settlements[0].snapshot.location = { x: 7, y: 8 };
    edited.facts.settlementRoles[0].name = 'Authored site';
    edited.facts.settlementRoles[0].origin = 'authored';
    const back = toRegionSnapshot(regionFromSnapshot(edited, new RNG('different-read-seed')));
    expect(back.settlements).toEqual(edited.settlements);
    expect(back.facts).toEqual(edited.facts);
    expect(back.map).toEqual(edited.map);
    expect(back.realms).toEqual(edited.realms);
  });

  it('keeps every realm, its type and its ruler’s name', () => {
    expect(restored.realms).toHaveLength(region.realms.length);
    for (const [index, realm] of region.realms.entries()) {
      const back = restored.realms[index];
      expect(back.name).toEqual(realm.name);
      expect(back.adjective).toEqual(realm.adjective);
      expect(back.description).toEqual(realm.description);
      expect(back.tiles).toEqual(realm.tiles);
      expect(back.realmType.name).toEqual(realm.realmType.name);
      expect(back.authority.firstName).toEqual(realm.authority.firstName);
      expect(back.authority.species.name).toEqual(realm.authority.species.name);
      expect(back.heraldry.blazon).toEqual(realm.heraldry.blazon);
    }
  });

  it('keeps every settlement and organization', () => {
    expect(restored.settlements.map((s) => s.name)).toEqual(region.settlements.map((s) => s.name));
    expect(restored.organizations.map((o) => o.name)).toEqual(
      region.organizations.map((o) => o.name),
    );
  });

  it('keeps local settlement identities and semantic facts across read and write', () => {
    const area = {
      id: 'area:one',
      name: 'Hills',
      description: '',
      origin: 'authored' as const,
      mapNodeIds: [snapshot.map.nodes[0].id],
    };
    const facts: RegionFacts = {
      ...snapshot.facts,
      areas: [area],
      resources: [
        {
          id: 'resource:one',
          kind: 'freshwater',
          availability: 'limited' as const,
          depositIds: [],
          name: 'Spring',
          description: '',
          areaIds: [area.id],
          habitatIds: [],
          origin: 'authored',
        },
      ],
      routes: [
        {
          id: 'route:one',
          kind: 'road',
          name: 'Hills Road',
          description: '',
          areaIds: [area.id],
          anchor: { nodeIds: [], edgeIds: [snapshot.map.edges[0].id] },
          endpoints: [
            {
              kind: 'settlement',
              settlement: { kind: 'embedded', settlementId: snapshot.settlements[0].id },
            },
            { kind: 'settlement', settlement: { kind: 'artifact', targetId: 'outside' } },
          ],
          origin: 'authored',
        },
      ],
    };
    const enriched = { ...snapshot, facts };
    const back = toRegionSnapshot(regionFromSnapshot(enriched, new RNG('rehydrate')));
    expect(back.settlements.map(({ id }) => id)).toEqual(enriched.settlements.map(({ id }) => id));
    expect(back.facts).toEqual(enriched.facts);
    expect(() => structuredClone(back)).not.toThrow();
  });

  it('keeps the region’s own ruler', () => {
    expect(restored.authority.firstName).toEqual(region.authority.firstName);
    expect(restored.authority.species.name).toEqual(region.authority.species.name);
  });

  it('carries no functions into storage', () => {
    // A region reaches arms, name generators and species — three sources of closures the strip and
    // the vocabulary converters between them have to remove.
    expect(() => structuredClone(toRegionSnapshot(region))).not.toThrow();
  });

  it('stores the map as a graph and never as a picture', () => {
    // Decision 3 of docs/readiness-locations.md: a rendered map cannot be re-themed or re-rendered.
    expect(JSON.stringify(snapshot)).not.toContain('<svg');
  });
});

describe('a region whose culture came from an artifact', () => {
  it('stores no culture of its own, so the reference is the only record of it', () => {
    const snapshot = toRegionSnapshot(region, { cultureIsReferenced: true });
    expect(snapshot.dominantCulture).toBeNull();
  });

  it('reads back with a null culture rather than an empty object pretending to be one', () => {
    const snapshot = toRegionSnapshot(region, { cultureIsReferenced: true });
    expect(regionFromSnapshot(snapshot, new RNG('rehydrate')).dominantCulture).toBeNull();
  });
});

describe('a region with a referenced settlement', () => {
  it('leaves that settlement out of the payload', () => {
    expect(region.settlements[0]).toBeDefined();
    // Generated settlements can share a name; this fixture references exactly one settlement.
    const first = { ...region.settlements[0], name: 'Unique referenced settlement' };
    const fixture = { ...region, settlements: [first, ...region.settlements.slice(1)] };
    const snapshot = toRegionSnapshot(fixture, { referencedSettlementName: first.name });
    expect(snapshot.settlements.map((s) => s.snapshot.name)).not.toContain(first.name);
    expect(snapshot.settlements).toHaveLength(region.settlements.length - 1);
    expect(validateRegionSnapshot(snapshot).ok).toBe(true);
    expect(snapshot.facts.settlementRoles).toHaveLength(region.settlements.length - 1);
    expect(snapshot.map).toEqual(region.map);
    expect(snapshot.realms).toEqual(toRegionSnapshot(region).realms);
    const removedId = region.settlementIds![0];
    expect(
      snapshot.facts.routes.every((route) =>
        route.endpoints.every(
          (endpoint) =>
            endpoint.kind !== 'settlement' ||
            endpoint.settlement.kind !== 'embedded' ||
            endpoint.settlement.settlementId !== removedId,
        ),
      ),
    ).toBe(true);
    const restored = toRegionSnapshot(regionFromSnapshot(snapshot, new RNG('reference-read')));
    expect(restored.settlements).toEqual(snapshot.settlements);
    expect(restored.facts).toEqual(snapshot.facts);
    expect(snapshot.settlements.map((s) => s.snapshot.name)).toEqual(
      region.settlements.slice(1).map((s) => s.name),
    );
  });
});

describe('a realm type this build no longer has', () => {
  it('reads back as an inert stand-in rather than throwing', () => {
    // The same rule an unknown species gets: losing the label on one realm is a smaller loss than
    // losing the map.
    const placeholder = realmTypeFromStoredName('archduchy of nowhere');
    expect(placeholder.name).toEqual('archduchy of nowhere');
    expect(placeholder.parentType).toBeNull();
  });

  it('reads back a known one from the table', () => {
    const known = region.realms[0].realmType.name;
    expect(realmTypeFromStoredName(known).minTiles).toEqual(region.realms[0].realmType.minTiles);
  });
});

describe('saved ecological interactions', () => {
  it('retains authored names, relations and seasonal qualifications across JSON and reopening without another roll', () => {
    const saved = structuredClone(toRegionSnapshot(region));
    const habitatId = saved.facts.habitats[0].id;
    saved.facts.ecologyInhabitants.push(
      {
        id: 'inhabitant:authored-heron',
        name: 'Silver herons',
        description: 'Authored birds',
        origin: 'authored',
        category: 'fauna',
        roles: ['predator'],
        source: { kind: 'species', speciesName: 'heron' },
        habitatIds: [habitatId],
      },
      {
        id: 'inhabitant:authored-crayfish',
        name: 'Blue crayfish',
        description: 'Authored food',
        origin: 'authored',
        category: 'fauna',
        roles: ['scavenger'],
        source: { kind: 'species', speciesName: 'crayfish' },
        habitatIds: [habitatId],
      },
    );
    saved.facts.ecologyRelationships.push({
      id: 'ecology:authored-food',
      name: 'River-bank feeding',
      description: 'An authored seasonal qualification is authoritative.',
      origin: 'authored',
      subjectId: 'inhabitant:authored-heron',
      habitatIds: [habitatId],
      relation: { kind: 'feeds-on', targetId: 'inhabitant:authored-crayfish' },
    });
    const json = JSON.parse(JSON.stringify(saved));
    expect(validateRegionSnapshot(json).ok).toBe(true);
    const reopened = toRegionSnapshot(regionFromSnapshot(json, new RNG('different-opening-seed')));
    expect(reopened.facts).toEqual(saved.facts);
    expect(reopened.map).toEqual(saved.map);
    expect(reopened.description).toBe(saved.description);
  });
});

describe('geological snapshot durability', () => {
  it('preserves geological settings, deposits, raw inventory and authored text through JSON and another read seed', () => {
    const edited = JSON.parse(JSON.stringify(toRegionSnapshot(region))) as ReturnType<
      typeof toRegionSnapshot
    >;
    expect(edited.facts.geology.length).toBeGreaterThan(0);
    expect(edited.facts.resourceDeposits.length).toBeGreaterThan(0);
    edited.facts.geology[0].name = 'Authored formation';
    edited.facts.geology[0].origin = 'authored';
    edited.facts.resourceDeposits[0].description = 'Saved survey notes';
    edited.facts.resourceDeposits[0].origin = 'authored';
    edited.facts.resources[0].description = 'Saved gathering notes';
    edited.facts.resources[0].origin = 'authored';
    expect(validateRegionSnapshot(edited).ok).toBe(true);
    const restored = toRegionSnapshot(regionFromSnapshot(edited, new RNG('unrelated-read')));
    expect(restored.facts).toEqual(edited.facts);
    expect(restored.map).toEqual(edited.map);
    expect(restored.environment).toEqual(edited.environment);
  });
});

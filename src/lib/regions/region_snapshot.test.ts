import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';

import { rollRegion } from './region_roll';
import { regionFromSnapshot, realmTypeFromStoredName } from './region_rehydrate';
import { toRegionSnapshot } from './region_snapshot';

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
    const first = region.settlements[0];
    expect(first).toBeDefined();
    const snapshot = toRegionSnapshot(region, { referencedSettlementName: first.name });
    expect(snapshot.settlements.map((s) => s.name)).not.toContain(first.name);
    expect(snapshot.settlements).toHaveLength(region.settlements.length - 1);
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

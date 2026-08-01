import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import * as Characters from '$lib/characters';
import { generateOrganization } from './generate_organization';
import { getOrganizationKindsForRegistry } from './kind_registry';
import { leaderRoleIdFromHierarchy } from './member_mutations';

const KIND_IDS = getOrganizationKindsForRegistry(new RNG('kind-ids')).map((k) => ({
  id: k.id,
  genre: k.genre,
  typeLabel: k.typeLabel,
}));

function generate(kindId: string, seed: string) {
  return generateOrganization({
    rng: new RNG(seed),
    characterConfig: Characters.getDefaultCharacterGenerationConfig(`chars-${seed}`),
    kindId,
    genre: 'any',
  });
}

/**
 * Every kind reaches the generator here. Only the fantasy kinds had been exercised before, so
 * the science-fiction naming, role config, and title mutators had never run in a test.
 */
describe.each(KIND_IDS)('$typeLabel ($id)', ({ id, genre }) => {
  it('generates a complete organization', () => {
    const org = generate(id, `sweep-${id}`);

    expect(org.kindId).toBe(id);
    expect(org.genre).toBe(genre);
    expect(org.name.trim().length).toBeGreaterThan(0);
    expect(org.description.length).toBeGreaterThan(0);
    expect(org.visualIdentity.emblem).toBeDefined();
    expect(org.hierarchy.idToOrder.size).toBeGreaterThan(0);
  });

  it('sizes membership within the range the kind declares', () => {
    const kind = getOrganizationKindsForRegistry(new RNG('range')).find((k) => k.id === id)!;
    for (let i = 0; i < 5; i++) {
      const org = generate(id, `size-${id}-${i}`);
      expect(org.memberCount).toBeGreaterThanOrEqual(kind.defaultSizeRange.min);
      expect(org.memberCount).toBeLessThanOrEqual(kind.defaultSizeRange.max);
    }
  });

  it('titles its leader and every notable member', () => {
    const org = generate(id, `titles-${id}`);

    expect(org.leader.titles?.length).toBeGreaterThan(0);
    expect(org.leader.description).toContain(org.leader.firstName);
    for (const member of org.notableMembers) {
      expect(member.titles?.length).toBeGreaterThan(0);
    }
  });

  it('builds its leader from the top-ranking role', () => {
    const kind = getOrganizationKindsForRegistry(new RNG('leader-role')).find((k) => k.id === id)!;
    const topOrder = Math.max(...kind.hierarchy.idToOrder.values());
    const leaderRoleId = leaderRoleIdFromHierarchy(
      kind.hierarchy.childToParent,
      kind.hierarchy.idToOrder,
    );

    expect(leaderRoleId).not.toBeNull();
    expect(kind.hierarchy.idToOrder.get(leaderRoleId!)).toBe(topOrder);
    /* Whatever the mutator names the title, the leader must come from that role's mutator. */
    expect(kind.mutators.get(leaderRoleId!)).toBeTypeOf('function');
  });

  it('is deterministic for the same seed', () => {
    expect(generate(id, `determinism-${id}`)).toEqual(generate(id, `determinism-${id}`));
  });
});

describe('generateOrganization kind selection', () => {
  it('keeps a genre filter when picking a kind at random', () => {
    for (let i = 0; i < 12; i++) {
      const org = generateOrganization({
        rng: new RNG(`sf-any-${i}`),
        characterConfig: Characters.getDefaultCharacterGenerationConfig(`sf-chars-${i}`),
        genre: 'science_fiction',
        kindId: 'any',
      });
      expect(org.genre).toBe('science_fiction');
    }
  });

  it('throws when the requested kind is not in the filtered pool', () => {
    expect(() =>
      generateOrganization({
        rng: new RNG('mismatch'),
        characterConfig: Characters.getDefaultCharacterGenerationConfig('mismatch'),
        genre: 'fantasy',
        kindId: 'starship_squadron',
      }),
    ).toThrow(/Unknown organization kind: starship_squadron/);
  });

  it('falls back to the kind range when the requested size cannot be honoured', () => {
    const kind = getOrganizationKindsForRegistry(new RNG('clamp')).find(
      (k) => k.id === 'starship_squadron',
    )!;
    const org = generateOrganization({
      rng: new RNG('impossible-size'),
      characterConfig: Characters.getDefaultCharacterGenerationConfig('impossible-size'),
      kindId: 'starship_squadron',
      genre: 'science_fiction',
      size: { kind: 'range', min: 900000, max: 1000000 },
    });
    expect(org.memberCount).toBeGreaterThanOrEqual(kind.defaultSizeRange.min);
    expect(org.memberCount).toBeLessThanOrEqual(kind.defaultSizeRange.max);
  });

  it('narrows membership to the overlap between a size preset and the kind range', () => {
    const org = generateOrganization({
      rng: new RNG('preset-small'),
      characterConfig: Characters.getDefaultCharacterGenerationConfig('preset-small'),
      kindId: 'colonial_syndicate',
      genre: 'science_fiction',
      size: { kind: 'preset', value: 'small' },
    });
    /* colonial_syndicate is 20–5000; the small preset is 5–50, so the overlap is 20–50. */
    expect(org.memberCount).toBeGreaterThanOrEqual(20);
    expect(org.memberCount).toBeLessThanOrEqual(50);
  });
});

import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as Characters from '$lib/characters';
import { validateChildToParent, validateIdToOrder } from '$lib/hierarchy';
import {
  isHeraldryEmblem,
  isMerchantMarkEmblem,
  isPatternLatticeEmblem,
  isDiscEmblem,
} from '$lib/visual_identity/visual_identity';
import { generateOrganization } from './generate_organization';
import { lineChain } from './organization_hierarchy_builders';
import { assertValidOrganizationHierarchy } from './member_mutations';

describe('lineChain + assertValidOrganizationHierarchy', () => {
  it('builds a valid parent forest and unique orders', () => {
    const h = lineChain([
      { id: 'a', roleName: 'A', order: 1 },
      { id: 'b', roleName: 'B', order: 0 },
    ]);
    assertValidOrganizationHierarchy(h);
    expect(validateChildToParent(h.childToParent)).toEqual([]);
    expect(validateIdToOrder(h.idToOrder, { requireUniqueOrder: true })).toEqual([]);
  });
});

describe('generateOrganization', () => {
  it('holy order leaders are always adult or elderly (not teenagers)', () => {
    for (let i = 0; i < 40; i++) {
      const rng = new RNG(`holy-leader-age-${i}`);
      const org = generateOrganization({
        rng,
        characterConfig: Characters.getDefaultCharacterGenerationConfig('c'),
        kindId: 'holy_order',
        genre: 'fantasy',
      });
      expect(['adult', 'elderly']).toContain(org.leader.ageCategory.name);
    }
  });

  it('produces a trading company with a merchant mark emblem', () => {
    const rng = new RNG('unit-test-trading-merchant-mark');
    const org = generateOrganization({
      rng,
      characterConfig: Characters.getDefaultCharacterGenerationConfig('char-tc'),
      kindId: 'trading_company',
      genre: 'fantasy',
    });
    expect(org.kindId).toBe('trading_company');
    expect(isMerchantMarkEmblem(org.visualIdentity.emblem)).toBe(true);
  });

  it('produces weavers collective with a pattern lattice emblem', () => {
    const rng = new RNG('unit-test-weavers-lattice');
    const org = generateOrganization({
      rng,
      characterConfig: Characters.getDefaultCharacterGenerationConfig('char-wv'),
      kindId: 'weavers_collective',
      genre: 'fantasy',
    });
    expect(org.kindId).toBe('weavers_collective');
    expect(isPatternLatticeEmblem(org.visualIdentity.emblem)).toBe(true);
  });

  it('produces signet circle with a disc emblem', () => {
    const rng = new RNG('unit-test-signet-disc');
    const org = generateOrganization({
      rng,
      characterConfig: Characters.getDefaultCharacterGenerationConfig('char-sg'),
      kindId: 'signet_circle',
      genre: 'fantasy',
    });
    expect(org.kindId).toBe('signet_circle');
    expect(isDiscEmblem(org.visualIdentity.emblem)).toBe(true);
  });

  it('produces a mercenary org in range with heraldry and leader', () => {
    const rng = new RNG('unit-test-mercenary-alpha');
    const org = generateOrganization({
      rng,
      characterConfig: Characters.getDefaultCharacterGenerationConfig('char-a'),
      kindId: 'mercenary_company',
      genre: 'fantasy',
      size: { kind: 'range', min: 20, max: 25 },
    });
    expect(org.kindId).toBe('mercenary_company');
    expect(org.genre).toBe('fantasy');
    expect(org.memberCount).toBeGreaterThanOrEqual(20);
    expect(org.memberCount).toBeLessThanOrEqual(25);
    expect(isHeraldryEmblem(org.visualIdentity.emblem)).toBe(true);
    expect(org.leader.firstName.length).toBeGreaterThan(0);
    expect(org.hierarchy.childToParent.size).toBe(4);
  });

  it('embeds organization profile labels in the composed description', () => {
    const rng = new RNG('unit-test-profile-embed-001');
    const org = generateOrganization({
      rng,
      characterConfig: Characters.getDefaultCharacterGenerationConfig('pf'),
      kindId: 'trading_company',
      genre: 'fantasy',
    });
    expect(org.profile.personalityTraits.length).toBeGreaterThanOrEqual(2);
    expect(org.profile.personalityTraits.length).toBeLessThanOrEqual(3);
    expect(org.profile.goal.label.length).toBeGreaterThan(0);
    expect(org.profile.weakness.label.length).toBeGreaterThan(0);
    for (const t of org.profile.personalityTraits) {
      expect(org.description).toContain(t.label);
    }
    expect(org.description).toContain(org.profile.goal.label);
    expect(org.description).toContain(org.profile.weakness.label);
    expect(org.description).toContain(org.profile.publicStanding.label);
  });

  it('adds environment narrative from worldContext preset and matches the description', () => {
    const rng = new RNG('unit-test-env-preset-001');
    const org = generateOrganization({
      rng,
      characterConfig: Characters.getDefaultCharacterGenerationConfig('env'),
      kindId: 'trading_company',
      genre: 'fantasy',
      worldContext: { kind: 'preset', preset: 'desert_route' },
    });
    expect(org.profile.environmentNarrative?.id).toBe('desert_route');
    const label = org.profile.environmentNarrative!.shortLabel;
    expect(org.description).toContain(label);
  });
});

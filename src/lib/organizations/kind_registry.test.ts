import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { listFantasyKindDefinitions } from './fantasy';
import { getOrganizationTypeDefinitionByName, getTypeByName } from './generate_organization';
import {
  getKindsForGenerator,
  getOrganizationKindById,
  getOrganizationKindByIdOrLabel,
  getOrganizationKindsForRegistry,
} from './kind_registry';
import { assertValidOrganizationHierarchy } from './member_mutations';
import { listScienceFictionKindDefinitions } from './science_fiction';

describe('the organization kind registry', () => {
  it('registers every kind under a unique id', () => {
    const kinds = getOrganizationKindsForRegistry(new RNG('registry'));
    expect(kinds.length).toBeGreaterThan(0);
    const ids = kinds.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every kind a usable definition', () => {
    for (const kind of getOrganizationKindsForRegistry(new RNG('registry-shape'))) {
      expect(kind.typeLabel.length).toBeGreaterThan(0);
      expect(['fantasy', 'science_fiction']).toContain(kind.genre);
      expect(kind.defaultSizeRange.min).toBeGreaterThan(0);
      expect(kind.defaultSizeRange.max).toBeGreaterThanOrEqual(kind.defaultSizeRange.min);
      assertValidOrganizationHierarchy(kind.hierarchy);

      /* Every role in the hierarchy needs a mutator, or generation throws when it is picked. */
      for (const roleId of kind.hierarchy.idToOrder.keys()) {
        expect(kind.mutators.get(roleId)).toBeTypeOf('function');
      }
    }
  });

  it('offers the generator the same kinds it registers', () => {
    const rng = new RNG('same-pool');
    const registry = getOrganizationKindsForRegistry(rng).map((k) => k.id);
    const generator = getKindsForGenerator(new RNG('same-pool')).map((k) => k.id);
    expect(generator).toEqual(registry);
  });

  it('looks a kind up by id', () => {
    const kind = getOrganizationKindById('starship_squadron', new RNG('by-id'));
    expect(kind.id).toBe('starship_squadron');
    expect(kind.genre).toBe('science_fiction');
  });

  it('throws for an id that is not registered', () => {
    expect(() => getOrganizationKindById('sandwich_guild', new RNG('missing'))).toThrow(
      /Organization kind not found: sandwich_guild/,
    );
  });

  it('resolves a kind by id or by human label, ignoring case', () => {
    const rng = () => new RNG('by-label');
    expect(getOrganizationKindByIdOrLabel('thieves_guild', rng()).id).toBe('thieves_guild');

    const byLabel = getOrganizationKindByIdOrLabel('Colonial syndicate', rng());
    expect(byLabel.id).toBe('colonial_syndicate');
    expect(getOrganizationKindByIdOrLabel('COLONIAL SYNDICATE', rng()).id).toBe(byLabel.id);
  });

  it('throws when neither id nor label matches', () => {
    expect(() =>
      getOrganizationKindByIdOrLabel('Sandwich Guild', new RNG('missing-label')),
    ).toThrow(/Organization kind not found: Sandwich Guild/);
  });

  it('resolves the same kind through the public name lookup and its deprecated alias', () => {
    const byName = getOrganizationTypeDefinitionByName('Wizard school', new RNG('public'));
    expect(byName.id).toBe('wizard_school');
    expect(getTypeByName('Wizard school', new RNG('public')).id).toBe(byName.id);
  });
});

describe('kinds listed by genre', () => {
  it('splits the registry into fantasy and science fiction with nothing left over', () => {
    const seed = 'genre-split';
    const all = getOrganizationKindsForRegistry(new RNG(seed));
    const fantasy = listFantasyKindDefinitions(new RNG(seed));
    const scienceFiction = listScienceFictionKindDefinitions(new RNG(seed));

    expect(fantasy.length).toBeGreaterThan(0);
    expect(scienceFiction.length).toBeGreaterThan(0);
    expect(fantasy.every((k) => k.genre === 'fantasy')).toBe(true);
    expect(scienceFiction.every((k) => k.genre === 'science_fiction')).toBe(true);
    expect(fantasy.length + scienceFiction.length).toBe(all.length);
  });
});

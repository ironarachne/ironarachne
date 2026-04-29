import { describe, expect, it } from 'vitest';
import { buildTrueDragonSpecies } from './dragon_species_helpers';

describe('buildTrueDragonSpecies', () => {
  it('adds ability tags when omitted', () => {
    const species = buildTrueDragonSpecies({
      breedType: 'test_dragon',
      name: 'test dragon',
      pluralName: 'test dragons',
      adjective: 'test draconic',
      family: 'other',
      environments: ['mountain'],
      physicalTraitGeneratorConfigs: [],
      abilities: [
        {
          name: 'flight',
          description: 'flies',
          category: 'movement',
          threatLevel: 1,
        },
        {
          name: 'breath weapon: fire',
          description: 'fire',
          category: 'attack',
        },
        {
          name: 'custom',
          description: 'x',
          category: 'utility',
          tags: ['custom_tag'],
        },
      ],
      baseThreatLevel: 1,
      commonality: 1,
      tags: [],
    });

    expect(species.abilities[0]!.tags).toEqual(['movement', 'dragon']);
    expect(species.abilities[1]!.tags).toEqual(['attack', 'dragon', 'breath_weapon']);
    expect(species.abilities[2]!.tags).toEqual(['custom_tag']);
  });
});

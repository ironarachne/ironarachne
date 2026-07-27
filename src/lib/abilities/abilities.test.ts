import { expect, describe, it } from 'vitest';
import { getAbilityByName } from './abilities';
import type { Ability } from './ability_types';

describe('getAbilityByName', () => {
  const abilities: Ability[] = [
    { name: 'Flight', description: 'Can fly.', category: 'movement', tags: ['aerial'] },
    { name: 'Venom', description: 'Poisonous bite.', category: 'attack', tags: ['toxic'] },
    {
      name: 'Regeneration',
      description: 'Heals over time.',
      category: 'defense',
      tags: [],
      threatLevel: 3,
    },
  ];

  it('returns the ability matching the name', () => {
    expect(getAbilityByName('Venom', abilities)).toEqual(abilities[1]);
  });

  it('returns the ability including its optional threatLevel', () => {
    expect(getAbilityByName('Regeneration', abilities).threatLevel).toBe(3);
  });

  it('matches names case-sensitively', () => {
    expect(() => getAbilityByName('venom', abilities)).toThrow('Ability not found: venom');
  });

  it('throws when no ability matches', () => {
    expect(() => getAbilityByName('Telepathy', abilities)).toThrow('Ability not found: Telepathy');
  });

  it('throws when the ability list is empty', () => {
    expect(() => getAbilityByName('Flight', [])).toThrow('Ability not found: Flight');
  });

  it('returns the first match when names are duplicated', () => {
    const duplicated: Ability[] = [
      { name: 'Flight', description: 'first', category: 'movement', tags: [] },
      { name: 'Flight', description: 'second', category: 'movement', tags: [] },
    ];

    expect(getAbilityByName('Flight', duplicated).description).toBe('first');
  });
});

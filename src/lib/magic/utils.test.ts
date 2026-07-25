import { describe, it, expect } from 'vitest';
import type { Element, MagicComponent, Spell } from './types';
import { getSpellSummary, hasComponent, formatComponents } from './utils';

describe('Magic Utils', () => {
  const mockSpell: Spell = {
    id: 'test-spell',
    name: 'Fireball',
    description: 'A ball of fire.',
    elements: ['fire'],
    spheres: ['physical'],
    intent: 'destroy',
    magnitude: 50,
    difficulty: 40,
    costs: [{ type: 'mana', amount: 10 }],
    components: [
      { type: 'gesture', description: 'Point finger' },
      { type: 'incantation', description: 'Burn!' },
    ],
    castingTime: { unit: 'action', value: 1 },
    duration: { type: 'instantaneous' },
    range: { type: 'long', value: 120, unit: 'feet' },
    area: { shape: 'sphere', size: 20, unit: 'feet' },
    tags: ['fire', 'evocation'],
  };

  describe('getSpellSummary', () => {
    it('should return a correct summary string', () => {
      const summary = getSpellSummary(mockSpell);
      expect(summary).toBe('Fireball (Magnitude 50 destroy - fire)');
    });

    it('should handle multiple elements', () => {
      const multiElementSpell = { ...mockSpell, elements: ['fire', 'air'] as Element[] };
      const summary = getSpellSummary(multiElementSpell);
      expect(summary).toBe('Fireball (Magnitude 50 destroy - fire, air)');
    });
  });

  describe('hasComponent', () => {
    it('should return true if the spell has the component', () => {
      expect(hasComponent(mockSpell, 'gesture')).toBe(true);
      expect(hasComponent(mockSpell, 'incantation')).toBe(true);
    });

    it('should return false if the spell does not have the component', () => {
      expect(hasComponent(mockSpell, 'material')).toBe(false);
    });
  });

  describe('formatComponents', () => {
    it('should format components with descriptions', () => {
      const formatted = formatComponents(mockSpell);
      expect(formatted).toBe('gesture (Point finger), incantation (Burn!)');
    });

    it('should format components without descriptions', () => {
      const simpleSpell = {
        ...mockSpell,
        components: [{ type: 'thought', description: '' }] as MagicComponent[],
      };
      const formatted = formatComponents(simpleSpell);
      expect(formatted).toBe('thought');
    });
  });
});

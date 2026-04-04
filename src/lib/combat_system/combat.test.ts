import { describe, it, expect } from 'vitest';
import {
  convertToDnD5e,
  convertToDnDAbilityScore,
  convertToDnDArmorClass,
  convertPowerToDice,
} from './converter';
import type { CombatProfile } from './types';

describe('Combat System', () => {
  describe('D&D 5e Converter', () => {
    it('should convert average stats (50) to average D&D values', () => {
      const profile: CombatProfile = {
        attack: 50,
        defense: 50,
        power: 50,
        resilience: 50,
        speed: 50,
        health: 50,
      };

      const dnd = convertToDnD5e(profile);

      expect(convertToDnDAbilityScore(50)).toBe(14);
      expect(dnd.ac).toBe(15);
      expect(dnd.toHit).toBe(5);
      expect(dnd.initiative).toBe(3);
      expect(dnd.damageDice).toBe('3d8');
    });

    it('should convert high stats (80) to heroic D&D values', () => {
      const profile: CombatProfile = {
        attack: 80,
        defense: 80,
        power: 80,
        resilience: 80,
        speed: 80,
        health: 80,
      };

      const dnd = convertToDnD5e(profile);

      expect(convertToDnDAbilityScore(80)).toBe(20);
      expect(dnd.ac).toBe(18);
      expect(dnd.toHit).toBe(9);
      expect(dnd.initiative).toBe(7);
      expect(dnd.damageDice).toMatch(/\d+d\d+/);
    });

    it('should clamp values', () => {
      expect(convertToDnDAbilityScore(0)).toBe(3);
      expect(convertToDnDAbilityScore(200)).toBe(24);
    });

    it('should convert power to dice correctly', () => {
      expect(convertPowerToDice(1)).toBe('1d4');
      expect(convertPowerToDice(7)).toBe('1d6');
      expect(convertPowerToDice(10)).toBe('1d10');
      expect(convertPowerToDice(15)).toBe('1d12');
      expect(convertPowerToDice(20)).toBe('2d6');
      expect(convertPowerToDice(100)).toBe('4d8');
    });
  });
});

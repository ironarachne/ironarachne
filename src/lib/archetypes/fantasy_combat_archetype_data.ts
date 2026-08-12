import type { Archetype } from './archetype_types';
import { getArmorGenerationConfig, getWeaponGenerationConfig } from '$lib/equipment';

/**
 * The combat archetypes: what a fighting character of this kind carries and is good at.
 *
 * Shared and read-only. Encounter generation picks an archetype and reads its equipment configs
 * without writing to them.
 */
export const FANTASY_COMBAT_ARCHETYPES: Archetype[] = [
  {
    name: 'assassin',
    description: 'A stealthy killer who strikes from the shadows.',
    basePowerModifier: 10,
    abilities: [
      {
        name: 'shadow step',
        description: 'Move unseen through the shadows.',
        category: 'movement',
        tags: ['stealth', 'mobility'],
      },
      {
        name: 'disguise',
        description: 'Blend into crowds and avoid detection.',
        category: 'stealth',
        tags: ['stealth', 'deception'],
      },
    ],
    actions: [
      {
        name: 'backstab',
        description: 'A powerful attack from behind the target.',
        type: 'attack',
        attackType: 'melee',
        damageType: 'piercing',
        baseDamage: 8,
      },
    ],
    equipmentGenerationConfigs: [
      getWeaponGenerationConfig('dagger'),
      getArmorGenerationConfig('leather armor'),
    ],
    addedTags: ['stealthy', 'agile'],
    tags: ['assassin', 'stealth', 'martial', 'agile'],
  },
  {
    name: 'cleric',
    description: 'A holy warrior who channels divine power.',
    basePowerModifier: 12,
    abilities: [
      {
        name: 'turn undead',
        description: 'Repels undead creatures with divine energy.',
        category: 'divine',
        tags: ['divine', 'control'],
      },
      {
        name: 'divine spellcasting',
        description: 'Casts spells granted by a deity.',
        category: 'divine',
        tags: ['divine', 'magic'],
      },
    ],
    actions: [
      {
        name: 'smite',
        description: 'A powerful melee attack imbued with divine energy.',
        type: 'attack',
        attackType: 'melee',
        damageType: 'radiant',
        baseDamage: 10,
      },
    ],
    casterProfile: {
      allowedSpheres: ['divine'],
      maxMagnitude: 20,
      maxDifficulty: 20,
    },
    equipmentGenerationConfigs: [
      getWeaponGenerationConfig('mace'),
      getArmorGenerationConfig('chainmail'),
    ],
    addedTags: ['holy'],
    tags: ['cleric', 'divine'],
  },
  {
    name: 'cultist',
    description: 'A devoted follower of a dark cult.',
    basePowerModifier: 8,
    abilities: [
      {
        name: 'demonic spellcasting',
        description: 'Casts dark and forbidden spells.',
        category: 'demonic',
        tags: ['demonic', 'magic'],
      },
    ],
    actions: [],
    casterProfile: {
      allowedSpheres: ['infernal'],
      maxMagnitude: 15,
      maxDifficulty: 15,
    },
    equipmentGenerationConfigs: [
      getWeaponGenerationConfig('staff'),
      getArmorGenerationConfig('robe'),
    ],
    addedTags: ['unholy'],
    tags: ['cultist', 'demonic'],
  },
  {
    name: 'druid',
    description: 'A nature priest who commands the forces of the wild.',
    basePowerModifier: 11,
    abilities: [
      {
        name: 'nature spellcasting',
        description: 'Casts spells that manipulate nature.',
        category: 'nature',
        tags: ['nature', 'magic'],
      },
      {
        name: 'wild shape',
        description: 'Transform into animals to adapt to different situations.',
        category: 'transformation',
        tags: ['nature', 'transformation'],
      },
    ],
    actions: [],
    casterProfile: {
      allowedSpheres: ['nature'],
      maxMagnitude: 18,
      maxDifficulty: 18,
    },
    equipmentGenerationConfigs: [
      getWeaponGenerationConfig('quarterstaff'),
      getArmorGenerationConfig('leather armor'),
    ],
    addedTags: ['nature lover'],
    tags: ['druid', 'nature', 'magic'],
  },
  {
    name: 'fighter',
    description: 'A skilled warrior trained in various forms of combat.',
    basePowerModifier: 15,
    abilities: [],
    actions: [
      {
        name: 'power strike',
        description: 'A strong melee attack that deals extra damage.',
        type: 'attack',
        attackType: 'melee',
        damageType: 'slashing',
        baseDamage: 12,
      },
    ],
    equipmentGenerationConfigs: [getWeaponGenerationConfig(), getArmorGenerationConfig()],
    addedTags: ['martial', 'tough'],
    tags: ['martial', 'tough', 'fighter'],
  },
  {
    name: 'mage',
    description: 'A practitioner of arcane magic and spellcasting.',
    basePowerModifier: 14,
    abilities: [
      {
        name: 'arcane spellcasting',
        description: 'Casts powerful arcane spells.',
        category: 'arcane',
        tags: ['arcane', 'magic'],
      },
    ],
    actions: [],
    casterProfile: {
      allowedSpheres: ['arcane'],
      maxMagnitude: 25,
      maxDifficulty: 25,
    },
    equipmentGenerationConfigs: [
      getWeaponGenerationConfig('staff'),
      getArmorGenerationConfig('robe'),
    ],
    addedTags: ['arcane'],
    tags: ['mage', 'arcane', 'magic'],
  },
  {
    name: 'rogue',
    description: 'A cunning and agile character skilled in stealth and trickery.',
    basePowerModifier: 9,
    abilities: [
      {
        name: 'stealth',
        description: 'Move silently and avoid detection.',
        category: 'stealth',
        tags: ['stealth', 'agility'],
      },
      {
        name: 'lockpicking',
        description: 'Open locked doors and chests without keys.',
        category: 'thievery',
        tags: ['thievery', 'dexterity'],
      },
    ],
    actions: [
      {
        name: 'sneak attack',
        description: 'A precise attack that deals extra damage when undetected.',
        type: 'attack',
        attackType: 'melee',
        damageType: 'piercing',
        baseDamage: 7,
      },
    ],
    equipmentGenerationConfigs: [
      getWeaponGenerationConfig('shortsword'),
      getArmorGenerationConfig('leather armor'),
    ],
    addedTags: ['stealthy', 'dexterous'],
    tags: ['rogue', 'stealth', 'agile'],
  },
];

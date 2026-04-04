import * as RNG from '@ironarachne/rng';
import type Environment from '../../environment/environment.js';
import type { DungeonBlueprint, DungeonTheme } from './types';

/**
 * A registry of classic dungeon blueprints.
 * Tags should map natively to expected concepts in the external Encounter/Treasure generators.
 */
export const BLUEPRINTS: DungeonBlueprint[] = [
  {
    name: 'Tomb',
    description:
      'An ancient burial site, sealed against intruders and haunted by the restless dead.',
    tags: ['undead', 'tomb', 'ancient', 'trap', 'crypt'],
    allowedRoomStyles: ['rectangle', 'circle'], // Deliberate and structured architecture
    doorOptions: { doorDensity: 1.0, secretPercentage: 0.15, lockedPercentage: 0.25 }, // Highly secured
    targetDensity: 0.25,
    roomPurposes: [
      'Antechamber',
      'Crypt',
      'Burial Chamber',
      'Embalming Room',
      'Ritual Chamber',
      'Offering Room',
      'Ossuary',
      'False Tomb',
      'Vestibule',
    ],
  },
  {
    name: 'Stronghold',
    description: 'A fortified military complex, patrolled by organized defenders.',
    tags: ['humanoid', 'stronghold', 'military', 'guard', 'fortress'],
    allowedRoomStyles: ['rectangle', 'l-shape'], // Functional, strict
    doorOptions: { doorDensity: 0.9, secretPercentage: 0.05, lockedPercentage: 0.15 },
    targetDensity: 0.4, // Tightly packed rooms
    roomPurposes: [
      'Barracks',
      'Armory',
      'Mess Hall',
      'Kitchen',
      'Guard Post',
      'Prison',
      'Training Room',
      'Storeroom',
      'Latrine',
      'Commander Quarters',
      'War Room',
    ],
  },
  {
    name: 'Arcane Library',
    description: 'A repository of lost knowledge and rogue magic experiments.',
    tags: ['magic', 'construct', 'library', 'arcane', 'knowledge'],
    allowedRoomStyles: ['rectangle', 'circle', 'blob'], // Strange spatial warping
    doorOptions: { doorDensity: 0.7, secretPercentage: 0.25, lockedPercentage: 0.2 },
    targetDensity: 0.3,
    roomPurposes: [
      'Reading Room',
      'Scroll Storage',
      'Alchemy Lab',
      'Summoning Room',
      'Scriptorium',
      'Librarian Quarters',
      'Reliquary',
      'Observatory',
      'Component Pantry',
    ],
  },
  {
    name: 'Natural Caverns',
    description: 'An unworked geological formation spanning dark, treacherous depths.',
    tags: ['beast', 'monstrosity', 'cave', 'natural', 'underground'],
    allowedRoomStyles: ['blob'], // Organic and unstructured
    doorOptions: { doorDensity: 0.1, secretPercentage: 0.0, lockedPercentage: 0.0 }, // Very few actual doors
    targetDensity: 0.2,
    roomPurposes: [
      'Mushroom Grotto',
      'Underground Spring',
      'Bat Roost',
      'Chasm Edge',
      'Stalagmite Forest',
      'Bear Lair',
      'Glowing Cave',
      'Guano Pit',
      'Blind Fish Pool',
    ],
  },
];

/**
 * Fuses a Biome and a Blueprint into a cohesive cohesive working DungeonTheme object,
 * extracting combined metadata used to roll encounters and items.
 */
export function buildTheme(environment: Environment, blueprintName: string): DungeonTheme {
  const blueprint = BLUEPRINTS.find((b) => b.name === blueprintName);

  if (!blueprint) {
    throw new Error(`Unknown Dungeon Blueprint: ${blueprintName}`);
  }

  if (environment.biome.isAquatic) {
    throw new Error(`Cannot build a dungeon in an aquatic biome (${environment.biome.name})`);
  }

  // Capitalize environment biome string (e.g. desert -> Desert)
  const biomeName = environment.biome.name;
  const formattedBiomeName = biomeName.charAt(0).toUpperCase() + biomeName.slice(1);

  const themeName = `${formattedBiomeName} ${blueprint.name}`;

  // Mash the blueprint logical tags with the biome name for robust queries against external libraries.
  const encounterTags = [...blueprint.tags, biomeName.toLowerCase()];

  // Treasure tags often overlap with encounter tags but might rely distinctly on the blueprint type
  const treasureTags = [...blueprint.tags];

  return {
    name: themeName,
    environment,
    blueprint,
    encounterTags,
    treasureTags,
  };
}

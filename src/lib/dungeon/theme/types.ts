import type Environment from '../../environment/environment.js';
import type { DoorGenerationOptions } from '../interactive/doors';
import type { RoomStyle } from '../room/types';
import type { TaggedItem } from '../../tags/tag_types';

/**
 * A Blueprint defines the "architectural intent" of a dungeon.
 * E.g., "Tomb", "Stronghold", "Arcane Library", "Natural Caverns".
 */
export type DungeonBlueprint = TaggedItem & {
  name: string;
  description: string;

  // Layout parameters driven by blueprint flavor
  allowedRoomStyles: RoomStyle[];
  doorOptions: DoorGenerationOptions;

  // Density hints for architecture (e.g., caverns = lower density spread, stronghold = dense block)
  targetDensity: number;

  // Potential purposes for rooms in this type of dungeon
  roomPurposes: string[];
};

/**
 * A Dungeon Theme perfectly pairs an external Environment instance with an internal Blueprint.
 * E.g. (Environment Biome="Desert" + Blueprint="Tomb" = "Desert Tomb")
 */
export type DungeonTheme = {
  name: string;
  environment: Environment;
  blueprint: DungeonBlueprint;

  // Combined derived tags specifically used to query the Encounter and Treasure libraries
  encounterTags: string[];
  treasureTags: string[];
};

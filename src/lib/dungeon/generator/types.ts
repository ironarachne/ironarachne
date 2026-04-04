export type DungeonEntrance = {
  x: number;
  y: number;
  type: 'stairs' | 'door';
  roomId: string;
};
import type { DungeonTheme } from '../theme/types';
import type { DungeonLayout, PlacedRoom } from '../layout/types';
import type { Door, Key } from '../interactive/types';
import type { Encounter } from '../../encounters/encounter_types';
import type { Item } from '../../equipment';

export type PopulatedRoom = PlacedRoom & {
  id: string; // The numeric-based ID mapped for visual reference
  name: string; // E.g. "Armory", "Mossy Grotto"
  purpose: string; // The functional intent, e.g. "Armory"
  description: string;
  encounter?: Encounter;
  treasure?: Item[];
};

export type EngineeredDungeon = {
  name: string;
  theme: DungeonTheme;

  // Core structural layers (The blueprint)
  layout: DungeonLayout;
  rooms: PopulatedRoom[];

  // Interactive layers
  doors: Door[];
  keys: Key[];

  // Entrances (stairs down or exterior door)
  entrances: DungeonEntrance[];
};

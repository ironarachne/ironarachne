import { doorsOnRoomWalls } from './dungeon_room_doors';
import { RNG } from '@ironarachne/rng';
import {
  generateArchitectureState,
  instantiateArchitecture,
  architectureNarrativeSubject,
  architectureOperationSeed,
  UNKNOWN_ARCHITECTURAL_SITE,
  type ArchitectureContext,
  type ArchitecturalPurpose,
  type SubjectShape,
} from '$lib/architecture';
import { composeNarrative } from '$lib/narrative';
import type { EngineeredDungeon, DungeonArchitectureConfig } from './generator/types';

const BLUEPRINT_PURPOSES: Record<string, ArchitecturalPurpose> = {
  Tomb: 'funerary',
  Stronghold: 'defensive',
  'Arcane Library': 'scholarly',
  'Natural Caverns': 'natural',
};
const ROOM_PURPOSES: Record<string, ArchitecturalPurpose> = {
  Storeroom: 'storage',
  'Scroll Storage': 'storage',
  'Component Pantry': 'storage',
  'Ritual Chamber': 'religious',
  'Offering Room': 'religious',
  'Summoning Room': 'religious',
  'Alchemy Lab': 'industrial',
  Kitchen: 'industrial',
  Vestibule: 'circulation',
  Antechamber: 'circulation',
};
export function roomArchitecturalPurpose(
  purpose: string,
  fallback: ArchitecturalPurpose,
): ArchitecturalPurpose {
  return ROOM_PURPOSES[purpose] ?? fallback;
}
/** An explicit adapter policy: this generator builds a complex entered by stairs from the surface. */
export function defaultDungeonArchitectureContext(blueprint: string): ArchitectureContext {
  const natural = blueprint === 'Natural Caverns';
  return {
    id: 'complex',
    construction: natural ? 'natural' : 'built',
    exposure: 'buried',
    purpose: BLUEPRINT_PURPOSES[blueprint] ?? 'civic',
    density: null,
    exteriorWindowsAllowed: false,
  };
}
export function applyDungeonArchitecture(
  dungeon: EngineeredDungeon,
  seed: string,
  config?: DungeonArchitectureConfig,
  composeDescriptions = false,
): EngineeredDungeon {
  const architecture = generateArchitectureState({
    seed,
    biome: dungeon.theme.environment.biome,
    climate: dungeon.theme.environment.climate,
    site: config?.site ?? UNKNOWN_ARCHITECTURAL_SITE,
    resources: config?.resources ?? { knowledge: 'unknown', entries: [] },
    contexts: config?.contexts ?? [defaultDungeonArchitectureContext(dungeon.theme.blueprint.name)],
    culturalPreferences: config?.culturalPreferences ?? [],
  });
  if (!composeDescriptions)
    architecture.summary = dungeon.architecture.summary ?? architecture.summary;
  if (!architecture.style)
    return {
      ...dungeon,
      architecture,
      rooms: dungeon.rooms.map((room) => ({ ...room, architecture: null })),
    };
  const style = architecture.style;
  const rooms = dungeon.rooms.map((room) => {
    const profileId = config?.roomProfiles?.[room.id] ?? style.profiles[0]?.id ?? '';
    const profile = style.profiles.find((p) => p.id === profileId);
    const shape: SubjectShape =
      room.primitive.style === 'rectangle'
        ? 'rectangular'
        : room.primitive.style === 'circle'
          ? 'circular'
          : room.primitive.style === 'l-shape'
            ? 'angled'
            : 'irregular';
    const placedDoors = doorsOnRoomWalls(room, dungeon.doors)
      .map((e) => e.door)
      .filter((d) => d.type !== 'secret');
    const instance = instantiateArchitecture(
      style,
      {
        id: room.id,
        profileId,
        currentPurpose: roomArchitecturalPurpose(room.purpose, profile?.context.purpose ?? 'civic'),
        shape,
        widthDepthRatio: room.primitive.width / room.primitive.height,
        condition: 'unspecified',
        placedFeatureIds: [],
        connections: placedDoors.map((d) => ({ id: d.id, kind: 'door' })),
      },
      seed,
    );
    if (!instance.ok) {
      architecture.diagnostics.push(...instance.diagnostics);
      return { ...room, architecture: null };
    }
    const text = composeNarrative(
      architectureNarrativeSubject(style, instance.value, room.id),
      { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 0 },
      { recentSelections: [] },
      new RNG(architectureOperationSeed(seed, 'prose', room.id)),
    ).text;
    return {
      ...room,
      architecture: instance.value,
      description: composeDescriptions
        ? [room.description, text].filter(Boolean).join(' ')
        : room.description,
    };
  });
  return { ...dungeon, architecture, rooms };
}

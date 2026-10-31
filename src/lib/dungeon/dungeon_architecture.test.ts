import { describe, expect, it } from 'vitest';
import {
  architectureResourcesFromCatalog,
  legacyArchitectureState,
  type ArchitectureContext,
} from '$lib/architecture';
import { getBuildingMaterialResources } from '$lib/resources';
import { rollDungeon, readDungeonGeneratorConfig } from './dungeon_roll';
import { applyDungeonArchitecture } from './dungeon_architecture';
import { toDungeonSnapshot } from './dungeon_snapshot';
import { dungeonFromSnapshot } from './dungeon_rehydrate';
import { migrateDungeonSnapshot, validateDungeonSnapshot } from './dungeon_artifact_kind';
import { setRoomPurpose } from './dungeon_editing';
const base = {
  width: 20,
  height: 20,
  blueprintName: 'Tomb',
  biomeName: 'temperate deciduous forest',
  encounterChancePerRoom: 0,
  treasureChancePerRoom: 0,
};
const resources = architectureResourcesFromCatalog(getBuildingMaterialResources());
describe('dungeon architectural ownership', () => {
  it('preserves the layout, interactive graph, contents, and existing RNG contracts', () => {
    const plain = rollDungeon('architectural-tomb', base);
    const styled = rollDungeon('architectural-tomb', { ...base, architecture: { resources } });
    expect(styled.layout).toEqual(plain.layout);
    expect(styled.doors).toEqual(plain.doors);
    expect(styled.keys).toEqual(plain.keys);
    expect(styled.entrances).toEqual(plain.entrances);
    expect(styled.architecture.kind).toBe('generated');
    expect(styled.architecture.examples).toEqual([]);
    expect(styled.rooms.length).toBeGreaterThan(0);
    expect(styled.rooms.every((r) => r.architecture !== null)).toBe(true);
    expect(styled.rooms.map((r) => [r.name, r.encounter, r.treasure])).toEqual(
      plain.rooms.map((r) => [r.name, r.encounter, r.treasure]),
    );
    const stored = toDungeonSnapshot(styled);
    expect(validateDungeonSnapshot(stored).ok).toBe(true);
    expect(toDungeonSnapshot(dungeonFromSnapshot(JSON.parse(JSON.stringify(stored))))).toEqual(
      stored,
    );
    const edited = setRoomPurpose(stored, 0, 'Storeroom');
    expect(edited.rooms[0].architecture?.currentPurpose).toBe('storage');
    expect(edited.rooms[0].description).toEqual(stored.rooms[0].description);
  });
  it('supports rock-cut, natural, and explicitly assigned mixed profiles without exposing secret doors', () => {
    const selected = structuredClone(resources);
    const stone = selected.entries.find((e) => e.resource.major_type === 'stone')!;
    selected.entries.push({ ...stone, id: 'host', origin: 'native', form: 'native_rock' });
    const contexts: ArchitectureContext[] = [
      {
        id: 'carved',
        construction: 'rock_cut',
        exposure: 'buried',
        purpose: 'funerary',
        density: null,
        exteriorWindowsAllowed: false,
      },
      {
        id: 'cave',
        construction: 'natural',
        exposure: 'buried',
        purpose: 'natural',
        density: null,
        exteriorWindowsAllowed: false,
      },
    ];
    const architecture = { resources: selected, contexts, roomProfiles: { '0': 'cave' } };
    expect(readDungeonGeneratorConfig({ ...base, architecture }).architecture).toEqual(
      architecture,
    );
    const dungeon = rollDungeon('architectural-tomb', { ...base, architecture });
    expect(dungeon.rooms[0].architecture?.profileId).toBe('cave');
    for (const room of dungeon.rooms)
      for (const treatment of room.architecture?.connections ?? [])
        expect(dungeon.doors.find((d) => d.id === treatment.connectionId)?.type).not.toBe('secret');
    expect(validateDungeonSnapshot(toDungeonSnapshot(dungeon)).ok).toBe(true);
  });
  it('preserves user words on regeneration and clears references when a new style is unavailable', () => {
    const dungeon = rollDungeon('architectural-tomb', { ...base, architecture: { resources } });
    dungeon.rooms[0].description = 'The referee wrote this.';
    dungeon.architecture.summary = 'An authored summary.';
    const changed = applyDungeonArchitecture(dungeon, 'new', { resources });
    expect(changed.rooms[0].description).toBe('The referee wrote this.');
    expect(changed.architecture.summary).toBe('An authored summary.');
    const empty = applyDungeonArchitecture(changed, 'new', {
      resources: { knowledge: 'known', entries: [] },
    });
    expect(empty.rooms.every((r) => r.architecture === null)).toBe(true);
    expect(validateDungeonSnapshot(toDungeonSnapshot(empty)).ok).toBe(true);
    const { architecture: _architecture, ...old } = toDungeonSnapshot(dungeon);
    const migrated = migrateDungeonSnapshot(old, 2);
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) return;
    expect(migrated.value.architecture).toEqual(legacyArchitectureState());
    expect(migrated.value.rooms.every((r) => r.architecture === null)).toBe(true);
    expect(migrated.value.rooms[0].description).toBe('The referee wrote this.');
    const bad = toDungeonSnapshot(dungeon);
    delete (bad.rooms[0] as Partial<(typeof bad.rooms)[0]>).architecture;
    expect(validateDungeonSnapshot(bad).ok).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { generateLayout } from '../layout/architect';
import { connectRooms } from '../layout/corridors';
import { generateDoors } from './doors';
import type { DoorGenerationOptions } from './doors';

describe('Interactive Door Generation Subsystem', () => {
  it('should generate doors at viable chokepoints with correct statistics based on density params', () => {
    // Build a deterministic test dungeon
    const layout = generateLayout('door-test-seed', 30, 30, 0.2, ['rectangle']);
    connectRooms('door-corridor-seed', layout);

    const options: DoorGenerationOptions = {
      doorDensity: 1.0, // Try to place a door at every valid hallway chokepoint
      secretPercentage: 0.5, // roughly 50% should be secret
      lockedPercentage: 0.5, // roughly 50% should be locked
    };

    const doors = generateDoors('door-gen-seed', layout, options);

    // Given a 30x30 map with rooms + corridors, there should absolutely be some doors
    expect(doors.length).toBeGreaterThan(0);

    let secretCount = 0;
    let lockedCount = 0;

    for (const door of doors) {
      if (door.type === 'secret') secretCount++;
      if (door.state === 'locked') lockedCount++;

      // Logcial sanity check: A secret door is either locked or closed; it shouldn't randomly spawn "open"
      if (door.type === 'secret') {
        expect(door.state).not.toBe('open');
      }
    }

    const secretRatio = secretCount / doors.length;
    const lockedRatio = lockedCount / doors.length;

    // Since it's pseudo-random, we shouldn't strictly enforce 50.00% exact math,
    // but we can assert we're generating a mixed bag > 0 and < 1
    expect(secretRatio).toBeGreaterThan(0.0);
    expect(secretRatio).toBeLessThan(1.0);
    expect(lockedRatio).toBeGreaterThan(0.0);
    expect(lockedRatio).toBeLessThan(1.0);
  });
});

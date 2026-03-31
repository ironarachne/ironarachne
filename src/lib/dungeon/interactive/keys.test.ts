import { describe, it, expect } from 'vitest';
import { generateLayout } from '../layout/architect';
import { connectRooms } from '../layout/corridors';
import { generateDoors } from './doors';
import { distributeKeys } from './keys';

describe('Lock and Key Subsystem', () => {
  it('should generate a key for every reachable locked door', () => {
    // Build the deterministic graph puzzle mapping
    const layout = generateLayout('key-test-seed', 40, 40, 0.3, ['rectangle']);
    connectRooms('key-corridor-seed', layout);

    // Ensure lots of locked chokepoints
    const doors = generateDoors('key-door-seed', layout, {
      doorDensity: 1.0,
      secretPercentage: 0.1,
      lockedPercentage: 0.6, // Heavily locked ensuring graph blocking
    });

    const lockedDoors = doors.filter((d) => d.state === 'locked');

    // Assert we successfully instantiated standard lock objects
    expect(lockedDoors.length).toBeGreaterThan(0);

    const keys = distributeKeys('key-gen-seed', layout, doors);

    // Each reachable locked door should have successfully prompted a key instance being mapped via BFS!
    // Due to the 100% interconnected maze output from corridor logic, every locked door *MUST* be reachable eventually.
    expect(keys.length).toBe(lockedDoors.length);

    // Additionally, verify IDs hook up bi-directionally
    for (const locked of lockedDoors) {
      expect(locked.keyId).toBeDefined();
      const pairing = keys.find((k) => k.id === locked.keyId);
      expect(pairing).toBeDefined();
      expect(pairing?.doorId).toBe(locked.id);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { weatherRngFromPath } from './rng_streams';

describe('weatherRngFromPath', () => {
  it('is stable for same path', () => {
    const a = weatherRngFromPath('world-a', 'region', 3, 'dayBatch', 1);
    const b = weatherRngFromPath('world-a', 'region', 3, 'dayBatch', 1);
    expect(a.next()).toBe(b.next());
  });

  it('diverges for different path', () => {
    const a = weatherRngFromPath('seed', 'r1');
    const b = weatherRngFromPath('seed', 'r2');
    expect(a.next()).not.toBe(b.next());
  });
});

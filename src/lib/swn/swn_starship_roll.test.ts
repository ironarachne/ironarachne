import { describe, expect, it } from 'vitest';

import { rollSwnStarship, rollSwnStarshipSnapshot } from './swn_starship_roll';

describe('rollSwnStarship', () => {
  it('gives the same ship for the same seed', () => {
    // Requirement 2.2. The seed control was there and honoured; what was not reproducible was the
    // seed itself, because the page reseeded its own RNG from the field inside an `$effect` and
    // again inside `generate()`, so each press depended on the text of the previous one.
    for (let index = 0; index < 25; index += 1) {
      const seed = `roll-${index}`;

      expect(JSON.stringify(rollSwnStarshipSnapshot(seed))).toBe(
        JSON.stringify(rollSwnStarshipSnapshot(seed)),
      );
    }
  });

  it('gives a different ship for a different seed', () => {
    const seen = new Set(
      Array.from({ length: 25 }, (_value, index) =>
        JSON.stringify(rollSwnStarshipSnapshot(`vary-${index}`)),
      ),
    );

    expect(seen.size).toBeGreaterThan(1);
  });

  it('names every ship it rolls, so a vault listing can tell them apart', () => {
    // Requirement 3.5: an artifact nobody can pick out of a listing is one nobody keeps.
    for (let index = 0; index < 25; index += 1) {
      expect(rollSwnStarship(`named-${index}`).name.trim()).not.toBe('');
    }
  });

  it('rolls a snapshot that is the snapshot of the ship it rolled', () => {
    expect(rollSwnStarshipSnapshot('same-seed').name).toBe(rollSwnStarship('same-seed').name);
  });
});

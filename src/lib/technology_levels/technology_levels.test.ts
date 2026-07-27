import { expect, describe, it } from 'vitest';
import { getTechnologyLevelByLevel, getTechnologyLevels } from './technology_levels';

describe('getTechnologyLevels', () => {
  const levels = getTechnologyLevels();

  it('covers levels 0 through 10 with no gaps', () => {
    expect(levels.map((tech) => tech.level)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('gives every level a name and description', () => {
    for (const tech of levels) {
      expect(tech.name).toBeTruthy();
      expect(tech.description).toBeTruthy();
    }
  });

  it('gives every level a positive commonality', () => {
    for (const tech of levels) {
      expect(tech.commonality).toBeGreaterThan(0);
    }
  });

  it('uses unique names', () => {
    const names = levels.map((tech) => tech.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('returns a fresh array each call so callers cannot mutate the source', () => {
    const first = getTechnologyLevels();
    first[0].name = 'mutated';

    expect(getTechnologyLevels()[0].name).toBe('Stone Age');
  });
});

describe('getTechnologyLevelByLevel', () => {
  it('returns the lowest level', () => {
    expect(getTechnologyLevelByLevel(0).name).toBe('Stone Age');
  });

  it('returns the highest level', () => {
    expect(getTechnologyLevelByLevel(10).name).toBe('Energy Age');
  });

  it('returns a level from the middle of the range', () => {
    expect(getTechnologyLevelByLevel(6).name).toBe('Computer Age');
  });

  it('throws below the range', () => {
    expect(() => getTechnologyLevelByLevel(-1)).toThrow(
      'Technology level with level -1 not found.',
    );
  });

  it('throws above the range', () => {
    expect(() => getTechnologyLevelByLevel(11)).toThrow(
      'Technology level with level 11 not found.',
    );
  });

  it('throws for a non-integer level', () => {
    expect(() => getTechnologyLevelByLevel(2.5)).toThrow(
      'Technology level with level 2.5 not found.',
    );
  });
});

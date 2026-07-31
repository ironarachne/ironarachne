import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  describeMusicStyle,
  generateMusicStyle,
  randomBeat,
  randomDynamic,
  randomHarmony,
  randomKey,
  randomMelody,
  randomPitch,
  randomRhythm,
  randomTimbre,
} from './music_styles';
import type { MusicStyle } from './music_styles';

const RANDOM_TRAITS = {
  randomBeat,
  randomDynamic,
  randomHarmony,
  randomKey,
  randomMelody,
  randomPitch,
  randomRhythm,
  randomTimbre,
};

describe('generateMusicStyle', () => {
  it('is deterministic for a given seed', () => {
    expect(generateMusicStyle(new RNG('bard'))).toEqual(generateMusicStyle(new RNG('bard')));
  });

  it('fills in every trait', () => {
    const style = generateMusicStyle(new RNG('folk'));

    for (const value of Object.values(style)) {
      expect(value).toBeTruthy();
    }
  });

  it('describes the style it generated', () => {
    const style = generateMusicStyle(new RNG('opera'));

    expect(style.description).toContain(style.harmony);
    expect(style.description).toContain(style.melody);
    expect(style.description).toContain(style.key);
  });

  it('produces different styles for different seeds', () => {
    const descriptions = new Set(
      Array.from(
        { length: 10 },
        (_, index) => generateMusicStyle(new RNG(`s${index}`)).description,
      ),
    );

    expect(descriptions.size).toBeGreaterThan(1);
  });
});

describe('describeMusicStyle', () => {
  const style: MusicStyle = {
    beat: 'steady',
    description: '',
    dynamic: 'loud',
    harmony: 'close harmony',
    key: 'minor',
    melody: 'soaring',
    pitch: 'high',
    rhythm: 'a single rhythm',
    timbre: 'bright',
  };

  it('opens with the standard lead-in', () => {
    expect(describeMusicStyle(style, new RNG('a'))).toMatch(/^This style of music has /);
  });

  it('ends with the timbre sentence', () => {
    expect(describeMusicStyle(style, new RNG('a'))).toMatch(/timbre\.$/);
  });

  it('mentions every trait of the style', () => {
    const description = describeMusicStyle(style, new RNG('a'));

    for (const trait of [
      'beat',
      'dynamic',
      'harmony',
      'key',
      'melody',
      'pitch',
      'timbre',
    ] as const) {
      expect(description).toContain(style[trait]);
    }
  });

  it('uses the singular "melody" for a single rhythm', () => {
    const description = describeMusicStyle(style, new RNG('a'));

    expect(description).toContain('melody');
    expect(description).not.toContain('melodies');
  });

  it('uses the plural "melodies" for multiple rhythms', () => {
    const description = describeMusicStyle({ ...style, rhythm: 'several rhythms' }, new RNG('a'));

    expect(description).toContain('melodies');
  });

  it('is deterministic for a given style and seed', () => {
    expect(describeMusicStyle(style, new RNG('x'))).toBe(describeMusicStyle(style, new RNG('x')));
  });

  it('varies its frequency adverb across seeds', () => {
    const adverbs = new Set(
      Array.from({ length: 20 }, (_, index) => {
        const description = describeMusicStyle(style, new RNG(`adverb-${index}`));
        return /It (often|commonly|usually|frequently) has/.exec(description)?.[1];
      }),
    );

    expect(adverbs.size).toBeGreaterThan(1);
    expect(adverbs.has(undefined)).toBe(false);
  });
});

describe.each(Object.entries(RANDOM_TRAITS))('%s', (_name, randomTrait) => {
  it('is deterministic for a given seed', () => {
    expect(randomTrait(new RNG('seed'))).toBe(randomTrait(new RNG('seed')));
  });

  it('returns a non-empty string', () => {
    expect(randomTrait(new RNG('seed'))).toBeTruthy();
    expect(typeof randomTrait(new RNG('seed'))).toBe('string');
  });

  it('returns more than one distinct value across seeds', () => {
    const values = new Set(
      Array.from({ length: 30 }, (_, index) => randomTrait(new RNG(`v${index}`))),
    );

    expect(values.size).toBeGreaterThan(1);
  });
});

import { describe, expect, it } from 'vitest';
import type { Duration } from '$lib/magic/types';
import { describeDurationShort, describeEffect, describePotion } from './potion_descriptor';
import type {
  Potion,
  PotionEffect,
  PotionEffectParameters,
  PotionForm,
  PotionSensoryProfile,
} from './potion_types';

function effect(overrides: Partial<PotionEffect> = {}): PotionEffect {
  return {
    id: 'healing',
    name: 'Potion of Healing',
    description: 'The drinker regains hit points.',
    duration: { type: 'instantaneous' },
    intent: 'restore',
    magnitude: 20,
    ...overrides,
  };
}

const SENSORY: PotionSensoryProfile = {
  appearance: 'a swirling red liquid',
  viscosity: 'thin',
  flavor: 'of iron',
  scent: 'copper',
};

function potion(overrides: Partial<Potion> = {}): Potion {
  const e = overrides.effect ?? effect();
  return {
    displayName: 'Potion of Healing',
    sensory: SENSORY,
    effect: e,
    modifications: [],
    container: {
      id: 'container-1',
      name: 'glass vial',
      description: 'a small stoppered vial',
    } as Potion['container'],
    liquid: { value: 5000 } as Potion['liquid'],
    ...overrides,
  };
}

describe('describeEffect', () => {
  describe('durations', () => {
    const cases: [label: string, duration: Duration, expected: string][] = [
      ['instantaneous', { type: 'instantaneous' }, 'The effect is instantaneous.'],
      ['permanent', { type: 'permanent' }, 'The effect is permanent.'],
      ['sustained', { type: 'sustained' }, 'The effect is sustained while active.'],
      [
        'timed with a value',
        { type: 'timed', value: 10, unit: 'minute' },
        'The effect lasts for 10 minute(s).',
      ],
      ['timed without a value', { type: 'timed' }, 'The effect lasts for a limited time.'],
      [
        'conditional with a value',
        { type: 'conditional', value: 1, unit: 'hour' },
        'The effect lasts up to 1 hour(s), unless its condition ends it sooner.',
      ],
      [
        'conditional without a value',
        { type: 'conditional' },
        'The effect lasts until a specific condition ends it.',
      ],
    ];

    it.each(cases)('describes a %s duration', (_label, duration, expected) => {
      expect(describeEffect(effect({ duration }))).toContain(expected);
    });

    it('prefers an explicit description over the derived one', () => {
      const text = describeEffect(
        effect({
          duration: { type: 'timed', value: 10, unit: 'minute', description: 'One scene.' },
        }),
      );
      expect(text).toContain('One scene.');
      expect(text).not.toContain('10 minute(s)');
    });
  });

  describe('effect parameters', () => {
    const cases: [parameters: PotionEffectParameters, expected: string][] = [
      [{ kind: 'healing', dice: '2d4+2' }, 'It restores or inflicts 2d4+2.'],
      [{ kind: 'strength', score: 21, giantType: 'fire' }, 'It sets Strength to 21 (fire giant).'],
      [{ kind: 'resistance', damageType: 'fire' }, 'It grants resistance to fire damage.'],
      [{ kind: 'spell', spellName: 'invisibility' }, 'It mimics the invisibility spell.'],
      [
        { kind: 'spell', spellName: 'charm person', saveDc: 13 },
        'It mimics charm person (save DC 13).',
      ],
      [
        { kind: 'bonus', description: 'It grants advantage on saves' },
        'It grants advantage on saves.',
      ],
    ];

    it.each(cases)('describes %o', (parameters, expected) => {
      expect(describeEffect(effect({ parameters }))).toContain(expected);
    });

    it('adds nothing for homebrew parameters', () => {
      const withHomebrew = describeEffect(effect({ parameters: { kind: 'homebrew', tier: 2 } }));
      expect(withHomebrew).toBe(describeEffect(effect()));
    });

    it('adds nothing when there are no parameters at all', () => {
      expect(describeEffect(effect())).toBe(
        'The drinker regains hit points. The effect is instantaneous.',
      );
    });
  });
});

describe('describePotion', () => {
  it('describes a drink as a potion that is drunk', () => {
    const text = describePotion(potion());
    expect(text).toContain('Potion of Healing is a magical potion.');
    expect(text).toContain('When drunk,');
    expect(text).toContain('It appears as a swirling red liquid.');
    expect(text).toContain('The liquid is thin, tastes of iron, and smells of copper.');
    expect(text).toContain('It is contained in a glass vial (a small stoppered vial).');
  });

  it('lowercases the first letter of the effect sentence when splicing it in', () => {
    expect(describePotion(potion())).toContain('When drunk, the drinker regains hit points.');
  });

  describe('forms', () => {
    const cases: [form: PotionForm, noun: string, verb: string][] = [
      ['drink', 'a magical potion', 'When drunk,'],
      ['oil', 'a magical oil', 'When applied,'],
      ['ointment', 'a magical ointment', 'When applied topically,'],
    ];

    it.each(cases)('describes the %s form', (form, noun, verb) => {
      const text = describePotion(potion(), form);
      expect(text).toContain(noun);
      expect(text).toContain(verb);
    });
  });

  it('states what the liquid alone is worth', () => {
    expect(describePotion(potion())).toMatch(/The liquid alone is worth .+\./);
  });
});

describe('describeDurationShort', () => {
  const cases: [duration: Duration, expected: string][] = [
    [{ type: 'instantaneous' }, 'Instantaneous'],
    [{ type: 'permanent' }, 'Permanent'],
    [{ type: 'conditional', value: 1, unit: 'hour' }, 'Conditional (1 hour)'],
    [{ type: 'conditional' }, 'Conditional'],
    [{ type: 'timed', value: 10, unit: 'minute' }, '10 minute(s)'],
    /* A timed duration missing its value falls back to the bare type. */
    [{ type: 'timed' }, 'timed'],
    [{ type: 'sustained' }, 'sustained'],
    [{ type: 'timed', value: 1, unit: 'day', description: 'Until dawn' }, 'Until dawn'],
  ];

  it.each(cases)('%o → %s', (duration, expected) => {
    expect(describeDurationShort(duration)).toBe(expected);
  });
});

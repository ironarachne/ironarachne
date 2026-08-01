import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import type { PotionEffect, PotionEffectTemplate, PotionModification } from './potion_types';
import {
  applyPotionModifications,
  buildDisplayNameFromModifications,
  classifyPotencyTier,
  potencyTierFromMagnitude,
} from './potion_naming';

describe('buildDisplayNameFromModifications', () => {
  it('returns the canonical name when there are no modifications', () => {
    const rng = new RNG('no-mod-name');
    const name = buildDisplayNameFromModifications(rng, {
      canonicalName: 'Potion of Healing',
      form: 'drink',
      intent: 'restore',
      magnitude: 20,
      modifications: [],
      isHomebrew: false,
    });

    expect(name).toBe('Potion of Healing');
  });

  it('prefixes the canonical name only for potency modifications', () => {
    const rng = new RNG('potency-mod-name');
    const name = buildDisplayNameFromModifications(rng, {
      canonicalName: 'Potion of Healing',
      form: 'drink',
      intent: 'restore',
      magnitude: 38,
      modifications: [{ kind: 'potency', tier: 'heightened', magnitudeDelta: 12 }],
      isHomebrew: false,
    });

    expect(name).toMatch(/^(Greater|Potent|Concentrated|Strong) Potion of Healing$/);
  });

  it('builds homebrew names from actual effect traits', () => {
    const rng = new RNG('homebrew-name');
    const name = buildDisplayNameFromModifications(rng, {
      canonicalName: 'Homebrew Concoction',
      form: 'drink',
      intent: 'restore',
      magnitude: 60,
      modifications: [{ kind: 'homebrew' }],
      isHomebrew: true,
    });

    expect(name).toMatch(
      /^(Greater|Potent|Concentrated|Strong|Sovereign|Mythic|Grand|Supreme) (Draught|Elixir|Philter|Tincture|Brew|Potion|Concoction|Infusion) of (Restoration|Renewal|Mending|Revival)$/,
    );
  });

  describe('prefixes by modification kind', () => {
    const cases: [label: string, modification: PotionModification, pattern: RegExp][] = [
      [
        'an extended duration',
        { kind: 'duration', change: 'extended' },
        /^(Enduring|Long-lasting|Persistent) Potion of Healing$/,
      ],
      [
        'a shortened duration',
        { kind: 'duration', change: 'shortened' },
        /^(Fleeting|Brief|Momentary) Potion of Healing$/,
      ],
      [
        'a permanent duration',
        { kind: 'duration', change: 'permanent' },
        /^(Everlasting|Eternal|Perpetual) Potion of Healing$/,
      ],
      [
        'tainting',
        { kind: 'tainted' },
        /^(Tainted|Adulterated|Corrupted|Impure) Potion of Healing$/,
      ],
      [
        'a weakened potency',
        { kind: 'potency', tier: 'weakened', magnitudeDelta: -10 },
        /^(Diluted|Weak|Lesser|Faint) Potion of Healing$/,
      ],
      [
        'a supreme potency',
        { kind: 'potency', tier: 'supreme', magnitudeDelta: 25 },
        /^(Sovereign|Mythic|Grand|Supreme) Potion of Healing$/,
      ],
    ];

    it.each(cases)('names %s', (_label, modification, pattern) => {
      const name = buildDisplayNameFromModifications(new RNG('prefix-seed'), {
        canonicalName: 'Potion of Healing',
        form: 'drink',
        intent: 'restore',
        magnitude: 30,
        modifications: [modification],
        isHomebrew: false,
      });
      expect(name).toMatch(pattern);
    });
  });

  it('stacks a prefix for each modification', () => {
    const name = buildDisplayNameFromModifications(new RNG('stacked-seed'), {
      canonicalName: 'Potion of Healing',
      form: 'drink',
      intent: 'restore',
      magnitude: 30,
      modifications: [
        { kind: 'potency', tier: 'heightened', magnitudeDelta: 12 },
        { kind: 'tainted' },
      ],
      isHomebrew: false,
    });
    expect(name).toMatch(
      /^(Greater|Potent|Concentrated|Strong) (Tainted|Adulterated|Corrupted|Impure) Potion of Healing$/,
    );
  });

  it('falls back to the canonical name when no modification contributes a prefix', () => {
    const name = buildDisplayNameFromModifications(new RNG('no-prefix-seed'), {
      canonicalName: 'Potion of Healing',
      form: 'drink',
      intent: 'restore',
      magnitude: 30,
      /* A homebrew marker on a non-homebrew potion yields no prefix of its own. */
      modifications: [{ kind: 'homebrew' }],
      isHomebrew: false,
    });
    expect(name).toBe('Potion of Healing');
  });

  it('names a harmful homebrew potion as tainted rather than potent', () => {
    for (const intent of ['destroy', 'drain'] as const) {
      const name = buildDisplayNameFromModifications(new RNG(`harmful-${intent}`), {
        canonicalName: 'Homebrew Concoction',
        form: 'oil',
        intent,
        magnitude: 60,
        modifications: [{ kind: 'homebrew' }],
        isHomebrew: true,
      });
      expect(name).toMatch(
        /^(Tainted|Adulterated|Corrupted|Impure) (Oil|Unguent|Anointing Oil) of \w+$/,
      );
    }
  });

  it('draws homebrew base nouns from the potion’s own form', () => {
    const name = buildDisplayNameFromModifications(new RNG('ointment-form'), {
      canonicalName: 'Homebrew Salve',
      form: 'ointment',
      intent: 'protect',
      magnitude: 20,
      modifications: [{ kind: 'homebrew' }],
      isHomebrew: true,
    });
    expect(name).toMatch(/(Salve|Ointment|Balm|Poultice)/);
  });
});

describe('potencyTierFromMagnitude', () => {
  const cases: [magnitude: number, tier: string][] = [
    [0, 'weakened'],
    [44, 'weakened'],
    [45, 'heightened'],
    [74, 'heightened'],
    [75, 'supreme'],
    [200, 'supreme'],
  ];

  it.each(cases)('%d → %s', (magnitude, tier) => {
    expect(potencyTierFromMagnitude(magnitude)).toBe(tier);
  });
});

describe('applyPotionModifications', () => {
  const template = {
    description: 'The drinker regains 2d4+2 hit points.',
    duration: { type: 'instantaneous' as const },
    intent: 'restore' as const,
    magnitude: 20,
  };

  const baseEffect = {
    id: 'healing',
    name: 'Potion of Healing',
    description: template.description,
    duration: template.duration,
    intent: template.intent,
    magnitude: 20,
  };

  it('does not modify standard catalog potions without variations enabled', () => {
    const rng = new RNG('no-variation');
    const result = applyPotionModifications(rng, baseEffect, template, false, false, false);

    expect(result.modifications).toEqual([]);
    expect(result.effect.magnitude).toBe(20);
  });

  it('applies a tracked modification when variations are enabled', () => {
    let foundModification = false;

    for (let i = 0; i < 50; i++) {
      const rng = new RNG(`variation-${i}`);
      const result = applyPotionModifications(rng, baseEffect, template, true, false, false);
      if (result.modifications.length > 0) {
        foundModification = true;
        expect(result.effect.magnitude).not.toBe(20);
        break;
      }
    }

    expect(foundModification).toBe(true);
  });

  it('skips optional variations when a catalog variant is already selected', () => {
    const rng = new RNG('variant-skip');
    const result = applyPotionModifications(rng, baseEffect, template, true, false, true);

    expect(result.modifications).toEqual([]);
  });

  it('marks a homebrew potion as homebrew and nothing else', () => {
    const result = applyPotionModifications(
      new RNG('homebrew'),
      baseEffect,
      template,
      true,
      true,
      false,
    );
    expect(result.modifications).toEqual([{ kind: 'homebrew' }]);
  });

  it('copies stat offsets rather than mutating the effect it was given', () => {
    const withOffsets: PotionEffect = { ...baseEffect, statOffsets: { health: 5 } };
    const result = applyPotionModifications(
      new RNG('offset-copy'),
      withOffsets,
      template,
      false,
      false,
      false,
    );
    expect(result.effect.statOffsets).not.toBe(withOffsets.statOffsets);
    expect(withOffsets.statOffsets).toEqual({ health: 5 });
  });

  describe('on a timed potion', () => {
    const timedTemplate: PotionEffectTemplate = {
      ...template,
      duration: { type: 'timed', value: 10, unit: 'minute' },
    };

    function timedEffect(): PotionEffect {
      return { ...baseEffect, duration: { type: 'timed', value: 10, unit: 'minute' } };
    }

    /** Every variation the generator can roll, gathered across a fixed span of seeds. */
    const results = Array.from({ length: 200 }, (_, i) =>
      applyPotionModifications(
        new RNG(`timed-${i}`),
        timedEffect(),
        timedTemplate,
        true,
        false,
        false,
      ),
    ).filter((r) => r.modifications.length > 0);

    it('eventually rolls each kind of variation', () => {
      const kinds = new Set(results.map((r) => r.modifications[0].kind));
      expect(kinds).toEqual(new Set(['potency', 'duration', 'tainted']));
    });

    it('doubles the duration when extending it', () => {
      const extended = results.filter(
        (r) => r.modifications[0].kind === 'duration' && r.effect.duration.value === 20,
      );
      expect(extended.length).toBeGreaterThan(0);
      for (const r of extended) {
        expect(r.effect.duration.description).toContain('twice the usual duration');
      }
    });

    it('halves the duration when shortening it', () => {
      const shortened = results.filter(
        (r) => r.modifications[0].kind === 'duration' && r.effect.duration.value === 5,
      );
      expect(shortened.length).toBeGreaterThan(0);
      for (const r of shortened) {
        expect(r.effect.duration.description).toContain('half the usual duration');
      }
    });

    it('subtracts health when tainting', () => {
      const tainted = results.filter((r) => r.modifications[0].kind === 'tainted');
      expect(tainted.length).toBeGreaterThan(0);
      for (const r of tainted) {
        expect(r.effect.statOffsets?.health).toBeLessThan(0);
      }
    });

    it('records the potency tier that matches the new magnitude', () => {
      const potency = results.filter((r) => r.modifications[0].kind === 'potency');
      expect(potency.length).toBeGreaterThan(0);
      for (const r of potency) {
        const modification = r.modifications[0];
        if (modification.kind !== 'potency') {
          continue;
        }
        expect(classifyPotencyTier(r.effect.magnitude, timedTemplate.magnitude)).toBe(
          modification.tier,
        );
      }
    });

    it('never drops magnitude below one', () => {
      for (const r of results) {
        expect(r.effect.magnitude).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it('records no duration change on a potion that has no duration to change', () => {
    /* An instantaneous effect cannot be extended or shortened, so those rolls leave no trace. */
    const results = Array.from({ length: 200 }, (_, i) =>
      applyPotionModifications(new RNG(`instant-${i}`), baseEffect, template, true, false, false),
    );
    const durationMods = results.flatMap((r) =>
      r.modifications.filter((m: PotionModification) => m.kind === 'duration'),
    );
    expect(durationMods).toEqual([]);
    expect(results.every((r) => r.effect.duration.type === 'instantaneous')).toBe(true);
  });
});

describe('classifyPotencyTier', () => {
  it('classifies magnitude shifts relative to baseline', () => {
    expect(classifyPotencyTier(12, 20)).toBe('weakened');
    expect(classifyPotencyTier(30, 20)).toBe('heightened');
    expect(classifyPotencyTier(45, 20)).toBe('supreme');
    expect(classifyPotencyTier(21, 20)).toBe('standard');
  });
});

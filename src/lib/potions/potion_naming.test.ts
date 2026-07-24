import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import {
  applyPotionModifications,
  buildDisplayNameFromModifications,
  classifyPotencyTier,
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
});

describe('classifyPotencyTier', () => {
  it('classifies magnitude shifts relative to baseline', () => {
    expect(classifyPotencyTier(12, 20)).toBe('weakened');
    expect(classifyPotencyTier(30, 20)).toBe('heightened');
    expect(classifyPotencyTier(45, 20)).toBe('supreme');
    expect(classifyPotencyTier(21, 20)).toBe('standard');
  });
});

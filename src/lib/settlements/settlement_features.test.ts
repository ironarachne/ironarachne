import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { SETTLEMENT_FEATURE_RULES, describeSettlementFeatures } from './settlement_features';
import type { Settlement } from './settlement_types';

describe('regional settlement feature meanings', () => {
  it('provides several independent nonmaterial choices for every category', () => {
    for (const category of ['hamlet', 'village', 'town', 'borough', 'city', 'metropolis']) {
      const rules = SETTLEMENT_FEATURE_RULES.filter(
        (rule) => !rule.requirements.length && rule.categoryNames.includes(category),
      );
      expect(rules.length).toBeGreaterThanOrEqual(4);
      const settlement = { name: 'Home', category: { name: category } } as Settlement;
      const texts = new Set(
        Array.from(
          { length: 12 },
          (_, index) =>
            describeSettlementFeatures(
              settlement,
              rules.map((rule) => rule.id),
              new RNG(String(index)),
            ).text,
        ),
      );
      expect(texts.size).toBeGreaterThan(2);
    }
  });
  it('only composes caller-authorized meanings and repeats from the seed', () => {
    const settlement = { name: 'Home', category: { name: 'village' } } as Settlement;
    expect(describeSettlementFeatures(settlement, [], new RNG('empty')).text).toBe('');
    const eligible = ['craft-linen:v1', 'evening-stories:v1'];
    const first = describeSettlementFeatures(settlement, eligible, new RNG('words'));
    expect(first).toEqual(describeSettlementFeatures(settlement, eligible, new RNG('words')));
    expect(first.text).toContain('weave linen');
    expect(first.ruleIds).toEqual(expect.arrayContaining(eligible));
    expect(first.text).not.toMatch(/farms|raccoons|mats/i);
  });
});

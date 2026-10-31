import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { composeSettlementPortrait, settlementPortraitSubject } from './settlement_reading';
import { generate, getDefaultConfig } from './settlements';
import { settlementToMarkdown } from './settlement_presentation';

const base = generate(getDefaultConfig(new RNG('449-settlement')));
describe('focused settlement portraits', () => {
  it('keeps concrete character and a mixed social profile without a statistics checklist or unchecked biome features', () => {
    const settlement = {
      ...base,
      lawAndOrder: 9,
      prosperity: 12,
      foodSecurity: 1,
      publicHealth: 1,
    };
    const text = composeSettlementPortrait(
      settlementPortraitSubject(settlement),
      new RNG('portrait'),
    ).text;
    expect(text).toMatch(/courtyard|lane|stories|storytelling|meeting|celebration|doorway|rhythm/);
    expect(text).toMatch(/orderly|Orderly/);
    expect(text).not.toMatch(
      /population|prosperous|have more|plentiful|guard|magistrate|safe|healthy|well-fed/,
    );
    expect(text.match(/[.!?]/g)!.length).toBeLessThanOrEqual(3);
  });
  it('requires explicit eligibility for material features', () => {
    const ordinary = settlementPortraitSubject(base);
    expect(ordinary.candidates.some((candidate) => candidate.id === 'craft-linen:v1')).toBe(false);
    const supplied = settlementPortraitSubject(base, 'subject', ['craft-linen:v1']);
    expect(supplied.candidates.some((candidate) => candidate.id === 'craft-linen:v1')).toBe(true);
  });
  it('allows genuinely sparse subjects and explicit repetition context', () => {
    const sparse = { ...base, category: { ...base.category, name: 'unknown' }, lawAndOrder: 5 };
    expect(
      composeSettlementPortrait(settlementPortraitSubject(sparse), new RNG('sparse')).text,
    ).toBe('');
    const subject = settlementPortraitSubject(base);
    const first = composeSettlementPortrait(subject, new RNG('first'));
    const again = composeSettlementPortrait(subject, new RNG('first'));
    expect(first).toEqual(again);
    expect(
      composeSettlementPortrait(subject, new RNG('second'), first.nextContext).text,
    ).toBeTruthy();
  });
  it('reuses saved and authored descriptions, including intentional blanks, in exports', () => {
    const authored = 'The referee’s own portrait.';
    expect(settlementToMarkdown({ ...base, description: authored })).toContain(authored);
    expect(settlementToMarkdown({ ...base, description: '' })).not.toContain(base.description);
  });
  it('preserves the five legacy habitation draws when regional description is deferred', () => {
    const rng = new RNG('habitation');
    const config = getDefaultConfig(rng);
    generate({ ...config, nameGenerator: null, deferDescription: true });
    const expected = new RNG('habitation');
    getDefaultConfig(expected);
    for (let i = 0; i < 9; i++) expected.next();
    expect(rng.next()).toBe(expected.next());
  });
});

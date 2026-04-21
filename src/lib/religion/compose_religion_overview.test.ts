import { describe, expect, it } from 'vitest';
import { polytheism } from './categories';
import { composeReligionOverviewDescription } from './compose_religion_narrative';
import { generateReligionDimensions } from './comparative_dimension_generation';

describe('composeReligionOverviewDescription', () => {
  it('stays short: two sentences and no pantheon-sized paste', () => {
    const dimensions = generateReligionDimensions('ov1', { category: polytheism });
    const text = composeReligionOverviewDescription(
      'ov1',
      polytheism,
      dimensions,
      'Between mortals and the highest powers, tradition also counts radiant messengers and outcast powers as real players.',
      null,
      'hierarchical',
    );
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    expect(sentences.length).toBeLessThanOrEqual(3);
    expect(text.toLowerCase()).toMatch(
      /one thread worth tracing|a knot worth untangling|something interesting is that/,
    );
    expect(text.length).toBeLessThan(1200);
  });
});

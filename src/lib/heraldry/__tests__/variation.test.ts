import { describe, expect, test } from 'vitest';
import { renderBlazon, type Variation } from '$lib/heraldry/variation.js';
import * as Tinctures from '$lib/heraldry/tinctures.js';

describe('heraldry/variation', () => {
  test('renderBlazon replaces every tincture placeholder', () => {
    const variation: Variation = {
      name: 'test',
      tinctureCount: 2,
      blazon: 'tincture1 and tincture1 with tincture2',
      pattern: '',
      supportsFurs: true,
      commonality: 1,
      tinctures: [Tinctures.byName('gules'), Tinctures.byName('azure')],
    };
    expect(renderBlazon(variation)).toBe('gules and gules with azure');
  });
});

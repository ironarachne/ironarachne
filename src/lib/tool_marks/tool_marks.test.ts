import { describe, expect, it } from 'vitest';

import { DOMAINS } from '$lib/tools';

import { DOMAIN_MARKS, toolMarksCoverDomains } from './tool_marks';

describe('the domain marks', () => {
  it('covers every domain, and marks nothing that is not one', () => {
    // docs/visual-design.md, "The domain marks". The map is hand-written because a computed import
    // specifier cannot be statically analysed — a lookup that resolved `set2/${domain}.svg` would
    // bundle all 455 icons into any page that showed one, which is the trap `TOOL_PANELS`
    // documents. This is what keeps a hand-written map honest: a sixth domain cannot be added
    // without a mark, and a mark cannot outlive the domain it classifies.
    expect(Object.keys(DOMAIN_MARKS).sort()).toEqual([...DOMAINS].sort());
    expect(toolMarksCoverDomains()).toBe(true);
  });

  it('draws every mark from one sheet, so the family reads as one hand', () => {
    // Five icons that happened to be available look like five icons that happened to be available.
    // All five come from `set2`, the pack's fantasy sheet, which is also the argument for showing
    // them at all: this is a suite of generators for tabletop games.
    for (const [domain, markup] of Object.entries(DOMAIN_MARKS)) {
      expect(markup, `${domain} has no mark`).toContain('<svg');
      expect(markup, `${domain}'s mark is not a masked icon`).toContain('<mask');
    }
  });

  it('gives each domain a mark of its own', () => {
    // Two domains wearing the same glyph is a classifier that does not classify.
    expect(new Set(Object.values(DOMAIN_MARKS)).size).toBe(Object.keys(DOMAIN_MARKS).length);
  });
});

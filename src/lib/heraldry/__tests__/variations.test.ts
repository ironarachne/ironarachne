import { describe, it, expect } from 'vitest';
import { all, byName, isIncludedIn, removeFromSet } from '../variations';
import { renderBlazon, renderSVGPattern } from '../variation';

describe('variations.all', () => {
  it('returns an array of variations', () => {
    const variations = all();
    expect(Array.isArray(variations)).toBe(true);
    expect(variations.length).toBeGreaterThan(0);
  });
  it('each variation has required properties', () => {
    for (const v of all()) {
      expect(v).toHaveProperty('name');
      expect(v).toHaveProperty('tinctureCount');
      expect(v).toHaveProperty('blazon');
      expect(v).toHaveProperty('pattern');
      expect(v).toHaveProperty('supportsFurs');
      expect(v).toHaveProperty('commonality');
      expect(v).toHaveProperty('tinctures');
    }
  });
});

describe('variations.byName', () => {
  it('returns the correct variation by name', () => {
    const v = byName('plain');
    expect(v.name).toBe('plain');
  });
  it('throws for unknown name', () => {
    expect(() => byName('not-a-variation')).toThrow();
  });
});

describe('variations.isIncludedIn', () => {
  it('returns true if variation is in set', () => {
    const allVars = all();
    expect(isIncludedIn(allVars[0], allVars)).toBe(true);
  });
  it('returns false if variation is not in set', () => {
    const allVars = all();
    const fake = { ...allVars[0], name: 'fake' };
    expect(isIncludedIn(fake, allVars)).toBe(false);
  });
});

describe('variations.removeFromSet', () => {
  it('removes a variation from a set', () => {
    const allVars = all();
    const result = removeFromSet(allVars[0], allVars);
    expect(result).not.toContainEqual(allVars[0]);
  });
});

describe('variation renderBlazon', () => {
  it('renders blazon with tinctures', () => {
    const v = { ...byName('barry'), tinctures: [ { name: 'azure' }, { name: 'or' } ] };
    const blazon = renderBlazon(v as any);
    expect(blazon).toContain('azure');
    expect(blazon).toContain('or');
  });
});

describe('variation renderSVGPattern', () => {
  it('renders SVG pattern with tincture names', () => {
    const v = { ...byName('barry'), tinctures: [ { name: 'azure' }, { name: 'or' } ] };
    const svg = renderSVGPattern(v as any);
    expect(svg).toContain('url(#azure)');
    expect(svg).toContain('url(#or)');
  });
});

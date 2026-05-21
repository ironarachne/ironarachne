import { describe, it, expect } from 'vitest';
import { all, byName } from '../fields';

describe('fields', () => {
  it('all() returns an array of Field objects', () => {
    const fields = all();
    expect(Array.isArray(fields)).toBe(true);
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      expect(field).toHaveProperty('name');
      expect(field).toHaveProperty('blazon');
      expect(field).toHaveProperty('variationCount');
      expect(field).toHaveProperty('pattern');
      expect(field).toHaveProperty('commonality');
      expect(field).toHaveProperty('variations');
      expect(Array.isArray(field.variations)).toBe(true);
    }
  });

  it('each field has a valid variationCount', () => {
    for (const field of all()) {
      expect(typeof field.variationCount).toBe('number');
      expect(field.variationCount).toBeGreaterThan(0);
    }
  });

  it('byName() returns each catalog field', () => {
    for (const field of all()) {
      expect(byName(field.name).name).toBe(field.name);
    }
  });

  it('byName() throws for unknown names', () => {
    expect(() => byName('not-a-field')).toThrowError();
  });
});

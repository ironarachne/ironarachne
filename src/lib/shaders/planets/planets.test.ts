import { expect, describe, it } from 'vitest';
import { getFragmentShaderByName } from './planets';

const PLANET_NAMES = [
  'arid planet',
  'barren planet',
  'garden planet',
  'gas giant planet',
  'ice planet',
  'jungle planet',
  'ocean planet',
  'swamp planet',
  'toxic planet',
  'volcanic planet',
];

describe('getFragmentShaderByName', () => {
  it.each(PLANET_NAMES)('returns GLSL source for %s', (name) => {
    const source = getFragmentShaderByName(name);

    expect(source).toContain('void main');
  });

  it('returns a distinct shader for every planet name', () => {
    const sources = PLANET_NAMES.map(getFragmentShaderByName);

    expect(new Set(sources).size).toBe(PLANET_NAMES.length);
  });

  it('returns an empty string for an unknown name', () => {
    expect(getFragmentShaderByName('ringworld')).toBe('');
  });

  it('matches names case-sensitively', () => {
    expect(getFragmentShaderByName('Arid Planet')).toBe('');
  });

  it('does not match on a partial name', () => {
    expect(getFragmentShaderByName('arid')).toBe('');
  });

  it('returns an empty string for an empty name', () => {
    expect(getFragmentShaderByName('')).toBe('');
  });
});

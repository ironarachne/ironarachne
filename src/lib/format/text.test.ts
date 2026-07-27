import { expect, describe, it } from 'vitest';
import { header, list } from './text';

describe('list', () => {
  it('renders each item as a markdown bullet', () => {
    expect(list(['apples', 'pears'])).toBe('- apples\n- pears\n\n');
  });

  it('renders a single item', () => {
    expect(list(['apples'])).toBe('- apples\n\n');
  });

  it('returns nothing at all for an empty list', () => {
    expect(list([])).toBe('');
  });

  it('adds no vertical space when following a header with no items', () => {
    expect(header('Weapons') + list([])).toBe('\nWeapons\n\n');
  });

  it('preserves items verbatim, including empty strings', () => {
    expect(list(['', 'a b'])).toBe('- \n- a b\n\n');
  });
});

describe('header', () => {
  it('surrounds the text with a leading newline and a blank line', () => {
    expect(header('Overview')).toBe('\nOverview\n\n');
  });

  it('handles empty text', () => {
    expect(header('')).toBe('\n\n\n');
  });
});

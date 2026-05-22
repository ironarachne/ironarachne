import { describe, expect, it } from 'vitest';
import * as Fields from './fields.js';
import { renderFieldBlazon } from './field.js';
import * as Tinctures from './tinctures.js';
import * as Variations from './variations.js';

describe('renderFieldBlazon', () => {
  it('renders per pall with three variation placeholders', () => {
    const field = {
      ...Fields.byName('pall'),
      variations: [
        { ...Variations.byName('plain'), tinctures: [Tinctures.byName('gules')] },
        { ...Variations.byName('plain'), tinctures: [Tinctures.byName('Or')] },
        { ...Variations.byName('plain'), tinctures: [Tinctures.byName('azure')] },
      ],
    };
    expect(renderFieldBlazon(field)).toBe('per pall gules, Or and azure');
  });
});

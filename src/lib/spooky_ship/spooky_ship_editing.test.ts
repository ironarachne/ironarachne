import { describe, expect, it } from 'vitest';

import { setSpookyShipText } from './spooky_ship_editing';
import { rollSpookyShipSnapshot } from './spooky_ship_roll';

const SHIP = rollSpookyShipSnapshot('editing-seed');

describe('setSpookyShipText', () => {
  it('rewrites the paragraph, which is the whole of requirement 4.1 here', () => {
    const edited = setSpookyShipText(SHIP, 'The hull is warm to the touch.');

    expect(edited.text).toBe('The hull is warm to the touch.');
    expect(SHIP.text).not.toBe('The hull is warm to the touch.');
  });

  it('accepts an emptied paragraph on the way to writing another', () => {
    expect(setSpookyShipText(SHIP, '').text).toBe('');
  });
});

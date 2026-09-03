import { describe, expect, it } from 'vitest';

import { rollSpookyShip, rollSpookyShipSnapshot } from './spooky_ship_roll';
import { spookyShipFromSnapshot, toSpookyShipSnapshot } from './spooky_ship_snapshot';

const SHIP = rollSpookyShip('snapshot-seed');

describe('toSpookyShipSnapshot', () => {
  it('keeps the paragraph, which is the whole of it', () => {
    expect(toSpookyShipSnapshot(SHIP)).toEqual({ text: SHIP.text });
  });

  it('copies rather than handing the same object back', () => {
    expect(toSpookyShipSnapshot(SHIP)).not.toBe(SHIP);
  });
});

describe('spookyShipFromSnapshot', () => {
  it('round-trips everything that matters', () => {
    // Requirement 7.2.
    expect(spookyShipFromSnapshot(toSpookyShipSnapshot(SHIP))).toEqual(SHIP);
  });

  it('survives a trip through JSON, which is what storage is', () => {
    const stored = JSON.parse(JSON.stringify(toSpookyShipSnapshot(SHIP)));

    expect(spookyShipFromSnapshot(stored)).toEqual(SHIP);
  });

  it('recomputes nothing on read', () => {
    // 4.2: the paragraph comes back as it was stored, however far a referee has rewritten it.
    expect(spookyShipFromSnapshot({ text: 'A judge wrote this by hand.' }).text).toBe(
      'A judge wrote this by hand.',
    );
  });

  it('keeps an emptied paragraph, which is an editing decision rather than a fault', () => {
    expect(spookyShipFromSnapshot({ text: '' }).text).toBe('');
  });
});

describe('rollSpookyShipSnapshot', () => {
  it('is the roller a re-roll takes, and matches the page', () => {
    expect(rollSpookyShipSnapshot('seed')).toEqual(toSpookyShipSnapshot(rollSpookyShip('seed')));
  });
});

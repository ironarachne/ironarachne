import { describe, expect, it } from 'vitest';
import { ringBackHalfIsHalfZero, ringSemicircleAngles } from './ring_geometry';

describe('ringSemicircleAngles', () => {
  it('splits a wide ellipse at the horizontal vertices', () => {
    expect(ringSemicircleAngles(100, 20, true)).toEqual({ startAngle: 0, endAngle: Math.PI });
    expect(ringSemicircleAngles(100, 20, false)).toEqual({
      startAngle: Math.PI,
      endAngle: 2 * Math.PI,
    });
  });

  it('splits a tall ellipse at the vertical vertices', () => {
    expect(ringSemicircleAngles(20, 100, true)).toEqual({
      startAngle: Math.PI / 2,
      endAngle: (3 * Math.PI) / 2,
    });
    expect(ringSemicircleAngles(20, 100, false)).toEqual({
      startAngle: (3 * Math.PI) / 2,
      endAngle: Math.PI / 2 + 2 * Math.PI,
    });
  });

  it('treats a circle as wide, so the split stays horizontal', () => {
    expect(ringSemicircleAngles(50, 50, true)).toEqual({ startAngle: 0, endAngle: Math.PI });
  });

  it('always spans exactly half a turn', () => {
    const cases: Array<[number, number, boolean]> = [
      [100, 20, true],
      [100, 20, false],
      [20, 100, true],
      [20, 100, false],
    ];
    for (const [rx, ry, useFirstHalf] of cases) {
      const { startAngle, endAngle } = ringSemicircleAngles(rx, ry, useFirstHalf);
      expect(endAngle - startAngle).toBeCloseTo(Math.PI, 12);
    }
  });
});

describe('ringBackHalfIsHalfZero', () => {
  it('picks the upper bulge of an unrotated wide ellipse', () => {
    // Unrotated, half 0 sits at oy + ry (lower on screen) and half 1 at oy - ry, so half 1 is
    // the higher of the two and half 0 is not the back half.
    expect(ringBackHalfIsHalfZero(100, 20, -5, 0)).toBe(false);
  });

  it('swaps halves when the ring is rotated half a turn', () => {
    expect(ringBackHalfIsHalfZero(100, 20, -5, Math.PI)).toBe(true);
  });

  it('is decided by the horizontal vertices when the ellipse is taller than it is wide', () => {
    // rx < ry puts the comparison points at (-rx, oy) and (rx, oy). A quarter turn swings the
    // first to the top of the canvas and the second to the bottom; the higher one is the back
    // half, so half 0 is behind. Reversing the rotation reverses the answer.
    expect(ringBackHalfIsHalfZero(20, 100, -5, Math.PI / 2)).toBe(true);
    expect(ringBackHalfIsHalfZero(20, 100, -5, -Math.PI / 2)).toBe(false);
  });

  it('resolves a tie in favour of half 0', () => {
    // Unrotated and taller than wide, both comparison points sit at screen-y `oy`.
    expect(ringBackHalfIsHalfZero(20, 100, -5, 0)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { clipPolygonToRect } from './polygon_clipping';

describe('clipPolygonToRect', () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };

  it('returns an empty list for an empty polygon', () => {
    expect(clipPolygonToRect([], rect)).toEqual([]);
  });

  it('returns the polygon unchanged when entirely inside the rectangle', () => {
    const vertices = [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 8 },
      { x: 2, y: 8 },
    ];
    expect(clipPolygonToRect(vertices, rect)).toEqual(vertices);
  });

  it('returns an empty list when the polygon is entirely outside the rectangle', () => {
    const vertices = [
      { x: 20, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 30 },
      { x: 20, y: 30 },
    ];
    expect(clipPolygonToRect(vertices, rect)).toEqual([]);
  });

  it('clips a polygon partially inside the rectangle', () => {
    // A square that extends beyond the right and top edges
    const vertices = [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 15, y: 15 },
      { x: 5, y: 15 },
    ];
    const clipped = clipPolygonToRect(vertices, rect);
    // Should be clipped to (5,5), (10,5), (10,10), (5,10)
    expect(clipped).toHaveLength(4);
    expect(clipped).toContainEqual({ x: 5, y: 5 });
    expect(clipped).toContainEqual({ x: 10, y: 5 });
    expect(clipped).toContainEqual({ x: 10, y: 10 });
    expect(clipped).toContainEqual({ x: 5, y: 10 });
  });

  it('handles a polygon with a vertex exactly on the rectangle boundary', () => {
    const vertices = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const clipped = clipPolygonToRect(vertices, rect);
    expect(clipped).toEqual(vertices);
  });

  it('handles a polygon with an edge parallel to and coincident with a rectangle edge', () => {
    // A triangle with one edge along the bottom of the rectangle
    const vertices = [
      { x: 2, y: 0 },
      { x: 8, y: 0 },
      { x: 5, y: 5 },
    ];
    const clipped = clipPolygonToRect(vertices, rect);
    // The clipping may reorder vertices, so check the set
    expect(clipped).toHaveLength(3);
    expect(clipped).toContainEqual({ x: 2, y: 0 });
    expect(clipped).toContainEqual({ x: 8, y: 0 });
    expect(clipped).toContainEqual({ x: 5, y: 5 });
  });

  it('clips a polygon that extends beyond all four edges', () => {
    // A large square centered on the rectangle
    const vertices = [
      { x: -5, y: -5 },
      { x: 15, y: -5 },
      { x: 15, y: 15 },
      { x: -5, y: 15 },
    ];
    const clipped = clipPolygonToRect(vertices, rect);
    // Should be clipped to the rectangle itself
    expect(clipped).toHaveLength(4);
    expect(clipped).toContainEqual({ x: 0, y: 0 });
    expect(clipped).toContainEqual({ x: 10, y: 0 });
    expect(clipped).toContainEqual({ x: 10, y: 10 });
    expect(clipped).toContainEqual({ x: 0, y: 10 });
  });

  it('handles a non-origin rectangle', () => {
    const offsetRect = { x: 5, y: 5, width: 10, height: 10 };
    const vertices = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 20 },
      { x: 0, y: 20 },
    ];
    const clipped = clipPolygonToRect(vertices, offsetRect);
    // Should be clipped to the offset rectangle
    expect(clipped).toHaveLength(4);
    expect(clipped).toContainEqual({ x: 5, y: 5 });
    expect(clipped).toContainEqual({ x: 15, y: 5 });
    expect(clipped).toContainEqual({ x: 15, y: 15 });
    expect(clipped).toContainEqual({ x: 5, y: 15 });
  });
});

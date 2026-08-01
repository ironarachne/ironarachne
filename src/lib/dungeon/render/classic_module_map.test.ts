import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderClassicModuleMapToCanvas } from './classic_module_map';
import type { EngineeredDungeon, PopulatedRoom } from '../generator/types';
import type { Door } from '../interactive/types';

/**
 * A 2D context that records what was drawn, and the fill/stroke state in force at the time.
 * The renderer only ever calls context methods and assigns style properties, so recording both
 * is enough to assert on the drawing without a DOM.
 */
type DrawCall = {
  op: string;
  args: number[];
  text?: string;
  fillStyle: string;
  strokeStyle: string;
};

function recordingCanvas(clientWidth = 200, clientHeight = 200) {
  const calls: DrawCall[] = [];
  const state = { fillStyle: '', strokeStyle: '', font: '', lineWidth: 0 };

  const record = (op: string, args: unknown[]) => {
    const text = typeof args[0] === 'string' ? args[0] : undefined;
    calls.push({
      op,
      args: args.filter((a): a is number => typeof a === 'number'),
      text,
      fillStyle: state.fillStyle,
      strokeStyle: state.strokeStyle,
    });
  };

  const ctx = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (prop in state) {
        return state[prop as keyof typeof state];
      }
      return (...args: unknown[]) => record(prop, args);
    },
    set(_target, prop: string, value: unknown) {
      if (prop in state) {
        (state as Record<string, unknown>)[prop] = value;
      }
      record(`set:${prop}`, [value]);
      return true;
    },
  });

  const canvas = {
    width: 0,
    height: 0,
    clientWidth,
    clientHeight,
    getContext: () => ctx,
  };

  return { canvas: canvas as unknown as HTMLCanvasElement, calls, state };
}

/** Builds a grid from rows of `#` (floor) and `.` (rock), so fixtures read as maps. */
function gridFromRows(rows: string[]) {
  const height = rows.length;
  const width = rows[0].length;
  const data: boolean[] = [];
  for (const row of rows) {
    for (const cell of row) {
      data.push(cell === '#');
    }
  }
  return { width, height, data };
}

function room(id: string, x: number, y: number): PopulatedRoom {
  return {
    id,
    name: 'Chamber',
    purpose: 'chamber',
    description: '',
    x,
    y,
    primitive: { width: 1, height: 1 },
  } as unknown as PopulatedRoom;
}

function dungeonFrom(
  rows: string[],
  extras: Partial<Pick<EngineeredDungeon, 'rooms' | 'doors' | 'entrances'>> = {},
): EngineeredDungeon {
  const grid = gridFromRows(rows);
  return {
    name: 'Test Dungeon',
    theme: {} as EngineeredDungeon['theme'],
    layout: { width: grid.width, height: grid.height, grid, rooms: [] },
    rooms: extras.rooms ?? [],
    doors: extras.doors ?? [],
    keys: [],
    entrances: extras.entrances ?? [],
  } as EngineeredDungeon;
}

function door(x: number, y: number, overrides: Partial<Door> = {}): Door {
  return {
    id: `door-${x}-${y}`,
    x,
    y,
    type: 'regular',
    state: 'closed',
    description: '',
    ...overrides,
  };
}

/* A three-cell east-west corridor across the middle of a 5x3 map. */
const CORRIDOR = ['.....', '.###.', '.....'];

/*
 * Geometry these fixtures produce, derived from the renderer's own rules and asserted below:
 * pad 12, so cellSize = floor(min((200-24)/5, (200-24)/3)) = 35; map 175x105;
 * offset (12.5, 47.5); inset = max(1, floor(35 * 0.055)) = 1.
 */
const CELL = 35;
const OFFSET_X = 12.5;
const OFFSET_Y = 47.5;

function cellCenter(x: number, y: number): [number, number] {
  return [OFFSET_X + x * CELL + CELL / 2, OFFSET_Y + y * CELL + CELL / 2];
}

function opsOf(calls: DrawCall[], op: string): DrawCall[] {
  return calls.filter((c) => c.op === op);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('canvas setup', () => {
  it('sizes the backing store from the element’s CSS size', () => {
    const { canvas, calls } = recordingCanvas(200, 200);
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas);

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(200);
    expect(opsOf(calls, 'setTransform')[0].args).toEqual([1, 0, 0, 1, 0, 0]);
  });

  it('scales the backing store by the device pixel ratio', () => {
    vi.stubGlobal('window', { devicePixelRatio: 2 });
    const { canvas, calls } = recordingCanvas(200, 200);
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas);

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(400);
    expect(opsOf(calls, 'setTransform')[0].args).toEqual([2, 0, 0, 2, 0, 0]);
  });

  it('falls back to a default size when the element reports none', () => {
    const { canvas } = recordingCanvas(0, 0);
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas);

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it('does nothing when a 2D context cannot be obtained', () => {
    const canvas = {
      width: 0,
      height: 0,
      clientWidth: 200,
      clientHeight: 200,
      getContext: () => null,
    } as unknown as HTMLCanvasElement;

    expect(() => renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas)).not.toThrow();
  });
});

describe('the map body', () => {
  it('lays rock down across the whole map before anything else', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas);

    const first = opsOf(calls, 'fillRect')[0];
    expect(first.fillStyle).toBe('#4a8fc4');
    expect(first.args).toEqual([OFFSET_X, OFFSET_Y, CELL * 5, CELL * 3]);
  });

  it('paints one full gutter cell under every floor tile', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas);

    const gutters = opsOf(calls, 'fillRect').filter((c) => c.fillStyle === '#a8d8f2');
    expect(gutters).toHaveLength(3);
    expect(gutters[0].args).toEqual([OFFSET_X + CELL, OFFSET_Y + CELL, CELL, CELL]);
  });

  it('paints no floor at all for a dungeon with no floor cells', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(dungeonFrom(['.....', '.....', '.....']), canvas);

    const white = opsOf(calls, 'fillRect').filter((c) => c.fillStyle === '#ffffff');
    expect(white).toHaveLength(0);
  });

  describe('floor tile insets', () => {
    it('insets a tile only on the sides where it meets another floor tile', () => {
      const { canvas, calls } = recordingCanvas();
      renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas);

      const floors = opsOf(calls, 'fillRect').filter((c) => c.fillStyle === '#ffffff');
      expect(floors).toHaveLength(3);

      /* West end: open to rock on three sides, inset only where it meets its eastern neighbour. */
      expect(floors[0].args).toEqual([OFFSET_X + CELL, OFFSET_Y + CELL, CELL - 1, CELL]);
      /* Middle: inset on both sides that touch floor, full height against rock. */
      expect(floors[1].args).toEqual([OFFSET_X + 2 * CELL + 1, OFFSET_Y + CELL, CELL - 2, CELL]);
      /* East end: mirror of the west end. */
      expect(floors[2].args).toEqual([OFFSET_X + 3 * CELL + 1, OFFSET_Y + CELL, CELL - 1, CELL]);
    });

    it('leaves an isolated tile uninset on every side', () => {
      const { canvas, calls } = recordingCanvas();
      renderClassicModuleMapToCanvas(dungeonFrom(['.....', '..#..', '.....']), canvas);

      const floors = opsOf(calls, 'fillRect').filter((c) => c.fillStyle === '#ffffff');
      expect(floors).toHaveLength(1);
      expect(floors[0].args).toEqual([OFFSET_X + 2 * CELL, OFFSET_Y + CELL, CELL, CELL]);
    });

    it('insets vertically for a north-south run', () => {
      const { canvas, calls } = recordingCanvas();
      renderClassicModuleMapToCanvas(dungeonFrom(['..#..', '..#..', '..#..']), canvas);

      const floors = opsOf(calls, 'fillRect').filter((c) => c.fillStyle === '#ffffff');
      const middle = floors[1];
      /* Full width against rock either side, inset top and bottom where it meets floor. */
      expect(middle.args[2]).toBe(CELL);
      expect(middle.args[3]).toBe(CELL - 2);
    });
  });

  it('honours style overrides', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR), canvas, {
      paperColor: '#000000',
      gridGutterColor: '#111111',
      floorColor: '#222222',
    });

    const rects = opsOf(calls, 'fillRect');
    expect(rects[0].fillStyle).toBe('#000000');
    expect(rects.some((c) => c.fillStyle === '#111111')).toBe(true);
    expect(rects.some((c) => c.fillStyle === '#222222')).toBe(true);
  });
});

describe('doors', () => {
  const [doorCx, doorCy] = cellCenter(2, 1);
  const thickness = Math.max(2.5, CELL * 0.14);
  const span = CELL * 0.78;

  function doorBars(calls: DrawCall[]): DrawCall[] {
    /* Door bars are the blue rects drawn after the floor pass. */
    return opsOf(calls, 'fillRect')
      .filter((c) => c.fillStyle === '#4a8fc4')
      .slice(1);
  }

  it('draws a closed door as one solid bar across the corridor', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR, { doors: [door(2, 1)] }), canvas);

    const bars = doorBars(calls);
    expect(bars).toHaveLength(1);
    /* An east-west corridor gets a bar that is thin across and tall along the doorway. */
    expect(bars[0].args[0]).toBeCloseTo(doorCx - thickness / 2, 5);
    expect(bars[0].args[1]).toBeCloseTo(doorCy - span / 2, 5);
    expect(bars[0].args[2]).toBeCloseTo(thickness, 5);
    expect(bars[0].args[3]).toBeCloseTo(span, 5);
  });

  it('draws an open door as two pieces with a gap between them', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { doors: [door(2, 1, { state: 'open' })] }),
      canvas,
    );

    const bars = doorBars(calls);
    expect(bars).toHaveLength(2);
    const piece = span * 0.38;
    expect(bars[0].args[3]).toBeCloseTo(piece, 5);
    expect(bars[1].args[3]).toBeCloseTo(piece, 5);
    expect(bars[1].args[1]).toBeCloseTo(doorCy - span / 2 + span - piece, 5);
  });

  it('adds a keyhole box below a locked door', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { doors: [door(2, 1, { state: 'locked' })] }),
      canvas,
    );

    expect(doorBars(calls)).toHaveLength(1);
    const box = opsOf(calls, 'strokeRect');
    expect(box).toHaveLength(1);
    const size = Math.max(3, CELL * 0.16);
    expect(box[0].args[0]).toBeCloseTo(doorCx - size / 2, 5);
    expect(box[0].args[1]).toBeCloseTo(doorCy + CELL * 0.12, 5);
  });

  it('leaves a closed door unlocked-looking when it is merely closed', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR, { doors: [door(2, 1)] }), canvas);

    expect(opsOf(calls, 'strokeRect')).toHaveLength(0);
  });

  it('marks a secret door with an S, rotated to sit along the corridor', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { doors: [door(2, 1, { type: 'secret' })] }),
      canvas,
    );

    expect(opsOf(calls, 'save')).toHaveLength(1);
    expect(opsOf(calls, 'restore')).toHaveLength(1);
    expect(opsOf(calls, 'translate')[0].args).toEqual([doorCx, doorCy]);
    expect(opsOf(calls, 'rotate')[0].args[0]).toBeCloseTo(-Math.PI / 2, 5);
    expect(opsOf(calls, 'strokeText')[0].text).toBe('S');
    expect(opsOf(calls, 'fillText')[0].text).toBe('S');
  });

  it('does not rotate the S in a north-south corridor', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(['..#..', '..#..', '..#..'], { doors: [door(2, 1, { type: 'secret' })] }),
      canvas,
    );

    expect(opsOf(calls, 'rotate')).toHaveLength(0);
    expect(opsOf(calls, 'fillText')[0].text).toBe('S');
  });
});

describe('entrances', () => {
  it('draws stairs as a run of tapering treads', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { entrances: [{ x: 2, y: 1, type: 'stairs', roomId: 'r1' }] }),
      canvas,
    );

    expect(opsOf(calls, 'stroke')).toHaveLength(6);
    const treads = opsOf(calls, 'moveTo');
    expect(treads).toHaveLength(6);

    /* Each tread is shorter than the one before it, which is what makes the taper. */
    const lengths = treads.map((t, i) => opsOf(calls, 'lineTo')[i].args[0] - t.args[0]);
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i]).toBeLessThan(lengths[i - 1]);
    }
  });

  it('draws a door entrance as a solid bar', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { entrances: [{ x: 2, y: 1, type: 'door', roomId: 'r1' }] }),
      canvas,
    );

    const bars = opsOf(calls, 'fillRect')
      .filter((c) => c.fillStyle === '#4a8fc4')
      .slice(1);
    expect(bars).toHaveLength(1);
    expect(opsOf(calls, 'stroke')).toHaveLength(0);
  });

  it('lets an entrance win over a door on the same cell', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, {
        doors: [door(2, 1, { state: 'locked' })],
        entrances: [{ x: 2, y: 1, type: 'stairs', roomId: 'r1' }],
      }),
      canvas,
    );

    /* Stairs drawn, and the locked door's keyhole never reached. */
    expect(opsOf(calls, 'stroke')).toHaveLength(6);
    expect(opsOf(calls, 'strokeRect')).toHaveLength(0);
  });
});

describe('room labels', () => {
  it('labels a room centre with the last two characters of its id', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { rooms: [room('room-07', 2, 1)] }),
      canvas,
    );

    const labels = opsOf(calls, 'fillText');
    expect(labels).toHaveLength(1);
    expect(labels[0].text).toBe('07');
    const [cx, cy] = cellCenter(2, 1);
    expect(labels[0].args).toEqual([cx, cy]);
  });

  it('uses a short id whole rather than slicing it', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(dungeonFrom(CORRIDOR, { rooms: [room('7', 2, 1)] }), canvas);

    expect(opsOf(calls, 'fillText')[0].text).toBe('7');
  });

  it('does not label a room whose centre is not on a floor tile', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { rooms: [room('room-07', 0, 0)] }),
      canvas,
    );

    expect(opsOf(calls, 'fillText')).toHaveLength(0);
  });

  it('gives way to a door on the same cell', () => {
    const { canvas, calls } = recordingCanvas();
    renderClassicModuleMapToCanvas(
      dungeonFrom(CORRIDOR, { rooms: [room('room-07', 2, 1)], doors: [door(2, 1)] }),
      canvas,
    );

    expect(opsOf(calls, 'fillText')).toHaveLength(0);
  });
});

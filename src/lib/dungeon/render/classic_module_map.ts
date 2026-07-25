import type { EngineeredDungeon } from '../generator/types';
import { getTile } from '../grid/grid';
import type { Grid } from '../grid/types';
import type { Door } from '../interactive/types';

export type ClassicModuleMapStyle = {
  /** Solid rock / void around the dungeon (darker blue). */
  paperColor: string;
  /** 10′ grid gutters between white floor tiles inside rooms and corridors (lighter than `paperColor`). */
  gridGutterColor: string;
  floorColor: string;
  /**
   * Gap between adjacent floor tiles reveals `gridGutterColor` as the grid;
   * sides bordering rock use inset 0 so white meets `paperColor`.
   */
  floorInsetMin: number;
  floorInsetRatio: number;
  showFeatureMarkers: boolean;
};

const defaultClassicModuleMapStyle: ClassicModuleMapStyle = {
  paperColor: '#4a8fc4',
  gridGutterColor: '#a8d8f2',
  floorColor: '#ffffff',
  floorInsetMin: 1,
  floorInsetRatio: 0.055,
  showFeatureMarkers: true,
};

function mergeStyle(overrides?: Partial<ClassicModuleMapStyle>): ClassicModuleMapStyle {
  return { ...defaultClassicModuleMapStyle, ...overrides };
}

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

function isFloorCell(grid: Grid<boolean>, x: number, y: number): boolean {
  return getTile(grid, x, y) === true;
}

function doorCorridorOrientation(grid: Grid<boolean>, x: number, y: number): 'ns' | 'ew' | null {
  const n = isFloorCell(grid, x, y - 1);
  const s = isFloorCell(grid, x, y + 1);
  const e = isFloorCell(grid, x + 1, y);
  const w = isFloorCell(grid, x - 1, y);
  if (n && s && !e && !w) {
    return 'ns';
  }
  if (e && w && !n && !s) {
    return 'ew';
  }
  if ((n || s) && (e || w)) {
    return n || s ? 'ns' : 'ew';
  }
  return null;
}

/** Classic module: thick blue bar across the doorway (not a swing arc). */
function drawDoorBar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  corridor: 'ns' | 'ew',
  blue: string,
  options: { gapInMiddle: boolean },
): void {
  ctx.fillStyle = blue;
  const thickness = Math.max(2.5, cellSize * 0.14);
  const span = cellSize * 0.78;
  if (corridor === 'ns') {
    const h = thickness;
    const w = span;
    const left = cx - w / 2;
    const top = cy - h / 2;
    if (options.gapInMiddle) {
      const piece = w * 0.38;
      ctx.fillRect(left, top, piece, h);
      ctx.fillRect(left + w - piece, top, piece, h);
    } else {
      ctx.fillRect(left, top, w, h);
    }
  } else {
    const w = thickness;
    const h = span;
    const left = cx - w / 2;
    const top = cy - h / 2;
    if (options.gapInMiddle) {
      const piece = h * 0.38;
      ctx.fillRect(left, top, w, piece);
      ctx.fillRect(left, top + h - piece, w, piece);
    } else {
      ctx.fillRect(left, top, w, h);
    }
  }
}

/** Tapered treads (plan approximation of classic module stairs). */
function drawStairsTapered(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  blue: string,
): void {
  ctx.strokeStyle = blue;
  ctx.lineWidth = Math.max(1.25, cellSize * 0.075);
  ctx.lineCap = 'square';
  const h = cellSize * 0.62;
  const top = cy - h / 2;
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const len = cellSize * (0.72 - t * 0.38);
    const y = top + t * h;
    ctx.beginPath();
    ctx.moveTo(cx - len / 2, y);
    ctx.lineTo(cx + len / 2, y);
    ctx.stroke();
  }
}

function drawRoomLabelBlue(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  cellSize: number,
  blue: string,
): void {
  const fontPx = Math.max(9, Math.floor(cellSize * 0.44));
  ctx.font = `600 ${fontPx}px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  ctx.fillStyle = blue;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}

/**
 * Classic B-style “blue map”: white cut-out on darker rock blue; floor grid uses a lighter blue;
 * labels and symbols use the rock blue on white.
 */
export function renderClassicModuleMapToCanvas(
  dungeon: EngineeredDungeon,
  canvas: HTMLCanvasElement,
  styleOverrides?: Partial<ClassicModuleMapStyle>,
): void {
  const style = mergeStyle(styleOverrides);
  const rockBlue = style.paperColor;
  const glyphBlue = style.paperColor;
  const { width: gw, height: gh, grid } = dungeon.layout;

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const cssW = Math.max(1, canvas.clientWidth || canvas.width / dpr || 800);
  const cssH = Math.max(1, canvas.clientHeight || canvas.height / dpr || 600);

  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pad = 12;
  const cellSize = Math.floor(Math.min((cssW - 2 * pad) / gw, (cssH - 2 * pad) / gh));
  const mapW = cellSize * gw;
  const mapH = cellSize * gh;
  const offsetX = (cssW - mapW) / 2;
  const offsetY = (cssH - mapH) / 2;

  ctx.fillStyle = rockBlue;
  ctx.fillRect(offsetX, offsetY, mapW, mapH);

  const inset = Math.max(style.floorInsetMin, Math.floor(cellSize * style.floorInsetRatio));

  const floorNeighbor = (fx: number, fy: number): boolean => {
    if (fx < 0 || fx >= gw || fy < 0 || fy >= gh) {
      return false;
    }
    return isFloorCell(grid, fx, fy);
  };

  ctx.fillStyle = style.gridGutterColor;
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      if (!isFloorCell(grid, x, y)) {
        continue;
      }
      const px0 = offsetX + x * cellSize;
      const py0 = offsetY + y * cellSize;
      ctx.fillRect(px0, py0, cellSize, cellSize);
    }
  }

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      if (!isFloorCell(grid, x, y)) {
        continue;
      }
      let insetTop = inset;
      let insetBottom = inset;
      let insetLeft = inset;
      let insetRight = inset;
      if (floorNeighbor(x, y - 1)) {
        insetTop = inset;
      } else {
        insetTop = 0;
      }
      if (floorNeighbor(x, y + 1)) {
        insetBottom = inset;
      } else {
        insetBottom = 0;
      }
      if (floorNeighbor(x - 1, y)) {
        insetLeft = inset;
      } else {
        insetLeft = 0;
      }
      if (floorNeighbor(x + 1, y)) {
        insetRight = inset;
      } else {
        insetRight = 0;
      }

      const px = offsetX + x * cellSize + insetLeft;
      const py = offsetY + y * cellSize + insetTop;
      const w = cellSize - insetLeft - insetRight;
      const h = cellSize - insetTop - insetBottom;
      if (w > 0 && h > 0) {
        ctx.fillStyle = style.floorColor;
        ctx.fillRect(px, py, w, h);
      }
    }
  }

  const doorAt = new Map<string, Door>();
  for (const door of dungeon.doors) {
    doorAt.set(cellKey(door.x, door.y), door);
  }
  const entranceAt = new Map<string, { type: 'stairs' | 'door' }>();
  for (const e of dungeon.entrances) {
    entranceAt.set(cellKey(e.x, e.y), { type: e.type });
  }

  const roomCenters = new Map<string, { label: string; treasure: boolean; encounter: boolean }>();
  for (const room of dungeon.rooms) {
    const cx = Math.floor(room.x + room.primitive.width / 2);
    const cy = Math.floor(room.y + room.primitive.height / 2);
    const id = room.id;
    const label = id.length > 2 ? id.slice(-2) : id;
    roomCenters.set(cellKey(cx, cy), {
      label,
      treasure: (room.treasure?.length ?? 0) > 0,
      encounter: room.encounter != null,
    });
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      if (!isFloorCell(grid, x, y)) {
        continue;
      }

      const coordKey = cellKey(x, y);
      const cx = offsetX + x * cellSize + cellSize / 2;
      const cyPix = offsetY + y * cellSize + cellSize / 2;

      const entrance = entranceAt.get(coordKey);
      if (entrance) {
        if (entrance.type === 'stairs') {
          drawStairsTapered(ctx, cx, cyPix, cellSize, glyphBlue);
        } else {
          drawDoorBar(
            ctx,
            cx,
            cyPix,
            cellSize,
            doorCorridorOrientation(grid, x, y) ?? 'ew',
            glyphBlue,
            { gapInMiddle: false },
          );
        }
        continue;
      }

      const door = doorAt.get(coordKey);
      if (door) {
        const co = doorCorridorOrientation(grid, x, y) ?? 'ew';
        if (door.state === 'open') {
          drawDoorBar(ctx, cx, cyPix, cellSize, co, glyphBlue, { gapInMiddle: true });
        } else {
          drawDoorBar(ctx, cx, cyPix, cellSize, co, glyphBlue, { gapInMiddle: false });
          if (door.state === 'locked') {
            const s = Math.max(3, cellSize * 0.16);
            ctx.strokeStyle = glyphBlue;
            ctx.lineWidth = Math.max(1, cellSize * 0.06);
            ctx.strokeRect(cx - s / 2, cyPix + cellSize * 0.12, s, s * 0.85);
          }
        }

        if (door.type === 'secret') {
          ctx.save();
          ctx.translate(cx, cyPix);
          // Rotate if vertical door (corridor ew)
          if (co === 'ew') {
            ctx.rotate(-Math.PI / 2);
          }
          ctx.font = `700 ${Math.max(10, Math.floor(cellSize * 0.5))}px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
          ctx.fillStyle = glyphBlue;
          ctx.strokeStyle = style.floorColor;
          ctx.lineWidth = Math.max(2, cellSize * 0.06);
          ctx.strokeText('S', 0, 0);
          ctx.fillText('S', 0, 0);
          ctx.restore();
        }
        continue;
      }

      const roomInfo = roomCenters.get(coordKey);
      if (!roomInfo) {
        continue;
      }

      const label = roomInfo.label;

      drawRoomLabelBlue(ctx, cx, cyPix, label, cellSize, glyphBlue);
    }
  }
}

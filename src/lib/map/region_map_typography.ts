import type { Vertex } from '$lib/geometry';
import type { MapNode, RegionMap } from './map_graph';
import type { TextBox } from './terrain_glyph_types';
import type {
  MapArcBaseline,
  MapLabelReach,
  MapScrollLayout,
  MapTextStyle,
  MapTextRun,
  PlacedMapInscription,
} from './region_map_typography_types';

export const mapTextStyle = (
  fontSize: number,
  changes: Partial<MapTextStyle> = {},
): MapTextStyle => ({
  letterCase: 'normal',
  italic: false,
  fontSize: Number(fontSize.toFixed(3)),
  trackingEms: 0,
  haloEms: 0.34,
  clearanceEms: 0.2,
  ...changes,
});
export function escapeMapText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
const n = (value: number) => Number(value.toFixed(3)).toString();

/** Explicit small caps work in SVG exporters without OpenType small-cap support. */
export function mapTextRuns(text: string, style: MapTextStyle): MapTextRun[] {
  const runs: MapTextRun[] = [];
  for (const { segment: character } of new Intl.Segmenter('en', {
    granularity: 'grapheme',
  }).segment(text)) {
    const lower = style.letterCase === 'smallCaps' && character.toUpperCase() !== character;
    const fontSize = Number((style.fontSize * (lower ? 0.8 : 1)).toFixed(3));
    const transformed = lower ? character.toUpperCase() : character;
    if (runs.at(-1)?.fontSize === fontSize) runs.at(-1)!.text += transformed;
    else runs.push({ text: transformed, fontSize });
  }
  return runs;
}

/** Conservative serif advance bounds; measured runs are also the runs emitted into SVG. */
export function mapTextWidth(text: string, style: MapTextStyle): number {
  let width = 0,
    count = 0;
  for (const run of mapTextRuns(text, style)) {
    for (const ch of run.text.normalize('NFD')) {
      if (/\p{Mark}/u.test(ch)) continue;
      const ems = /\s/.test(ch)
        ? style.letterCase === 'smallCaps'
          ? 0.46
          : 0.34
        : /[ijlIt.,;:'!|]/.test(ch)
          ? 0.4
          : /[mwMW@%]/.test(ch)
            ? 1.05
            : /[A-Z]/.test(ch)
              ? 0.8
              : /[a-z0-9]/.test(ch)
                ? 0.6
                : 1.1;
      width += ems * run.fontSize;
      count++;
    }
  }
  return width + Math.max(0, count - 1) * style.trackingEms * style.fontSize;
}
export const textClearance = (style: MapTextStyle) =>
  0.12 +
  style.fontSize * (style.clearanceEms + style.haloEms / 2 + (style.italic ? 0.18 : 0)) +
  0.005;

export function inscriptionBounds(
  text: string,
  style: MapTextStyle,
  baseline: PlacedMapInscription['baseline'],
): TextBox {
  const padding = textClearance(style);
  if (baseline.kind === 'straight') {
    const width = mapTextWidth(text, style);
    const left =
      baseline.origin.x -
      (baseline.anchor === 'middle' ? width / 2 : baseline.anchor === 'end' ? width : 0);
    return {
      minX: left - padding,
      maxX: left + width + padding,
      minY: baseline.origin.y - style.fontSize - padding,
      maxY: baseline.origin.y + style.fontSize * 0.35 + padding,
    };
  }
  // The convex hull contains the entire curve. Expanding by a glyph diagonal bounds every
  // rotated glyph, including between samples, and avoids relying on platform font metrics.
  const reach = style.fontSize * 1.5 + padding;
  const points = [baseline.start, baseline.control, baseline.end];
  return {
    minX: Math.min(...points.map((p) => p.x)) - reach,
    maxX: Math.max(...points.map((p) => p.x)) + reach,
    minY: Math.min(...points.map((p) => p.y)) - reach,
    maxY: Math.max(...points.map((p) => p.y)) + reach,
  };
}
export function mapInscription(
  id: string,
  text: string,
  style: MapTextStyle,
  baseline: PlacedMapInscription['baseline'],
): PlacedMapInscription {
  return {
    id,
    originalText: text,
    style,
    baseline,
    runs: mapTextRuns(text, style),
    bounds: inscriptionBounds(text, style, baseline),
  };
}
export function arcPoint(arc: MapArcBaseline, t: number): Vertex {
  return {
    x: (1 - t) ** 2 * arc.start.x + 2 * (1 - t) * t * arc.control.x + t * t * arc.end.x,
    y: (1 - t) ** 2 * arc.start.y + 2 * (1 - t) * t * arc.control.y + t * t * arc.end.y,
  };
}
export function boxesIntersect(a: TextBox, b: TextBox): boolean {
  return a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;
}
export function inscriptionFits(box: TextBox, map: RegionMap, obstacles: TextBox[]): boolean {
  return (
    box.minX >= 0 &&
    box.minY >= 0 &&
    box.maxX <= map.width &&
    box.maxY <= map.height &&
    obstacles.every((other) => !boxesIntersect(box, other))
  );
}

/** Stable connected components prevent labels from spanning disjoint patches. */
export function labelAreaNodes(map: RegionMap, ids: number[]): MapNode[] {
  const nodes = new Map(
    map.nodes
      .filter((node) => ids.includes(node.id) && !node.isWater && !node.isOcean)
      .map((node) => [node.id, node]),
  );
  const remaining = new Set([...nodes.keys()].sort((a, b) => a - b));
  const groups: MapNode[][] = [];
  while (remaining.size) {
    const queue = [remaining.values().next().value!];
    remaining.delete(queue[0]);
    const group: MapNode[] = [];
    for (let i = 0; i < queue.length; i++) {
      const node = nodes.get(queue[i])!;
      group.push(node);
      for (const id of [...node.neighbors].sort((a, b) => a - b)) {
        if (remaining.delete(id)) queue.push(id);
      }
    }
    groups.push(group);
  }
  return groups.sort((a, b) => b.length - a.length || a[0].id - b[0].id)[0] ?? [];
}
export function pointInLabelArea(point: Vertex, nodes: MapNode[]): boolean {
  return nodes.some((node) => {
    const vertices = node.polygon.vertices;
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const a = vertices[i],
        b = vertices[j];
      if (
        a.y > point.y !== b.y > point.y &&
        point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
      )
        inside = !inside;
    }
    return inside;
  });
}

/** Principal axis uses sorted cells so input ordering cannot perturb floating-point sums. */
export function areaLabelSections(nodes: MapNode[]): Vertex[][] {
  if (!nodes.length) return [];
  const ordered = [...nodes].sort((a, b) => a.id - b.id);
  const center = {
    x: ordered.reduce((v, p) => v + p.center.x, 0) / nodes.length,
    y: ordered.reduce((v, p) => v + p.center.y, 0) / nodes.length,
  };
  let xx = 0,
    yy = 0,
    xy = 0;
  for (const { center: p } of ordered) {
    xx += (p.x - center.x) ** 2;
    yy += (p.y - center.y) ** 2;
    xy += (p.x - center.x) * (p.y - center.y);
  }
  const angle =
    Math.hypot(xx - yy, 2 * xy) < (xx + yy) * 0.15 ? 0 : Math.atan2(2 * xy, xx - yy) / 2;
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const projections = ordered.flatMap((node) =>
    node.polygon.vertices.map(
      (p) => (p.x - center.x) * direction.x + (p.y - center.y) * direction.y,
    ),
  );
  const half = (Math.max(...projections) - Math.min(...projections)) * 0.4;
  return [-0.5, 0, 0.5].map((shift) => {
    const origin = {
      x: center.x - direction.y * half * shift,
      y: center.y + direction.x * half * shift,
    };
    return [
      { x: origin.x - direction.x * half, y: origin.y - direction.y * half },
      { x: origin.x + direction.x * half, y: origin.y + direction.y * half },
    ];
  });
}

/** At most three sections, two bows and three offsets. No generation RNG is consumed. */
export function placeArcInscription(
  id: string,
  text: string,
  style: MapTextStyle,
  sections: Vertex[][],
  map: RegionMap,
  obstacles: TextBox[],
  accepts: (arc: MapArcBaseline, bounds: TextBox) => boolean = () => true,
  offsetEms = 0,
): PlacedMapInscription | null {
  const width = mapTextWidth(text, style);
  for (const section of sections.slice(0, 3)) {
    const middle = section[Math.floor(section.length / 2)];
    let a = section[0],
      b = section.at(-1)!;
    if (!a || !b || !middle) continue;
    if (a.x > b.x || (a.x === b.x && a.y > b.y)) [a, b] = [b, a];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length < width + style.fontSize || !Number.isFinite(length)) continue;
    const dx = (b.x - a.x) / length,
      dy = (b.y - a.y) / length;
    if (Math.abs(dx) < 0.5) continue;
    const center = section.length > 2 ? middle : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const half = (width + style.fontSize * 0.5) / 2;
    for (const sign of [-1, 1])
      for (const offset of [0, -1, 1]) {
        const distance = sign * (offsetEms + offset) * style.fontSize;
        const origin = { x: center.x - dy * distance, y: center.y + dx * distance };
        const arc: MapArcBaseline = {
          kind: 'arc',
          start: { x: origin.x - dx * half, y: origin.y - dy * half },
          end: { x: origin.x + dx * half, y: origin.y + dy * half },
          control: { x: origin.x - dy * half * 0.25 * sign, y: origin.y + dx * half * 0.25 * sign },
        };
        const inscription = mapInscription(id, text, style, arc);
        if (inscriptionFits(inscription.bounds, map, obstacles) && accepts(arc, inscription.bounds))
          return inscription;
      }
  }
  return null;
}

export function serializeMapInscription(
  inscription: PlacedMapInscription,
  font: string,
  ink: string,
  parchment: string,
): { box: TextBox; halo: string; ink: string } {
  const { style, baseline, bounds } = inscription;
  // Encode UTF-16 units to avoid ambiguous IDs, XML whitespace, and collisions after escaping.
  const pathId =
    'map-label-' +
    Array.from({ length: inscription.id.length }, (_, i) =>
      inscription.id.charCodeAt(i).toString(16).padStart(4, '0'),
    ).join('');
  const content =
    style.letterCase === 'normal'
      ? escapeMapText(inscription.originalText)
      : inscription.runs
          .map(
            (run) =>
              `<tspan font-size="${n(run.fontSize)}">${escapeMapText(run.text).replace(/ /g, '&#160;')}</tspan>`,
          )
          .join('');
  const location =
    baseline.kind === 'straight' ? `x="${n(baseline.origin.x)}" y="${n(baseline.origin.y)}"` : '';
  const shared = `${location} font-family="${font}" font-size="${style.fontSize.toFixed(3)}" text-anchor="${baseline.kind === 'straight' ? baseline.anchor : 'middle'}"`;
  const attributes = `xml:space="preserve" word-spacing="${n(style.letterCase === 'smallCaps' ? style.fontSize * 0.1 : 0)}" font-style="${style.italic ? 'italic' : 'normal'}" letter-spacing="${n(style.trackingEms * style.fontSize)}" aria-label="${escapeMapText(inscription.originalText)}" data-map-name="${escapeMapText(inscription.originalText)}" data-map-case="${style.letterCase}"`;
  const definition =
    baseline.kind === 'arc'
      ? `<defs><path id="${pathId}" d="M ${n(baseline.start.x)} ${n(baseline.start.y)} Q ${n(baseline.control.x)} ${n(baseline.control.y)} ${n(baseline.end.x)} ${n(baseline.end.y)}"/></defs>`
      : '';
  const text = baseline.kind === 'arc' ? curvedGlyphs(inscription, baseline) : content;
  const box = [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY].map(n).join(' ');
  return {
    box: bounds,
    halo: `${definition}<text ${shared} ${attributes} fill="none" stroke="${parchment}" stroke-width="${n(style.fontSize * style.haloEms)}" stroke-linejoin="round">${text}</text>`,
    ink: `<text ${shared} data-text-box="${box}" fill="${ink}" ${attributes}>${text}</text>`,
  };
}

/** Explicit glyph positions export reliably in librsvg as well as browser SVG and canvas. */
function curvedGlyphs(inscription: PlacedMapInscription, arc: MapArcBaseline): string {
  const { style } = inscription;
  const samples = Array.from({ length: 65 }, (_, i) => arcPoint(arc, i / 64));
  const lengths = [0];
  for (let i = 1; i < samples.length; i++)
    lengths.push(
      lengths[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y),
    );
  const total = lengths.at(-1)!;
  let distance = (total - mapTextWidth(inscription.originalText, style)) / 2;
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return inscription.runs
    .flatMap((run) =>
      [...segmenter.segment(run.text)].map(({ segment }) => {
        const advance = mapTextWidth(segment, { ...style, fontSize: run.fontSize, trackingEms: 0 });
        const target = distance + advance / 2;
        distance += advance + style.trackingEms * style.fontSize;
        let i = 1;
        while (i < 64 && lengths[i] < target) i++;
        const fraction = (target - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1);
        const t = (i - 1 + fraction) / 64;
        const point = arcPoint(arc, t);
        const dx = 2 * ((1 - t) * (arc.control.x - arc.start.x) + t * (arc.end.x - arc.control.x));
        const dy = 2 * ((1 - t) * (arc.control.y - arc.start.y) + t * (arc.end.y - arc.control.y));
        const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
        return `<tspan x="${n(point.x)}" y="${n(point.y)}" rotate="${n(rotation)}" font-size="${n(run.fontSize)}" letter-spacing="0">${escapeMapText(segment)}</tspan>`;
      }),
    )
    .join('');
}

/** Longest continuous local section first, then the first and last thirds. */
export function labelPolylineSections(points: Vertex[]): Vertex[][] {
  if (points.length < 2) return [];
  if (points.length < 6) return [points];
  const third = Math.ceil(points.length / 3);
  return [points, points.slice(0, third + 1), points.slice(-third - 1)];
}

/** Do not join across a confluence or fork, even when only one branch is named. */
export function riverLabelSections(reaches: MapLabelReach[], edgeIds: number[]): Vertex[][] {
  const incoming = new Map<string, number>(),
    outgoing = new Map<string, number>();
  for (const reach of reaches) {
    incoming.set(reach.to, (incoming.get(reach.to) ?? 0) + 1);
    outgoing.set(reach.from, (outgoing.get(reach.from) ?? 0) + 1);
  }
  const selected = reaches
    .filter((reach) => edgeIds.includes(reach.edgeId))
    .sort((a, b) => a.id.localeCompare(b.id));
  const remaining = new Set(selected);
  const chains: { id: string; points: Vertex[]; length: number }[] = [];
  while (remaining.size) {
    let start =
      [...remaining].find(
        (reach) =>
          !selected.some(
            (other) =>
              remaining.has(other) &&
              other.to === reach.from &&
              incoming.get(reach.from) === 1 &&
              outgoing.get(reach.from) === 1,
          ),
      ) ?? remaining.values().next().value!;
    const id = start.id;
    const points: Vertex[] = [];
    while (remaining.delete(start)) {
      points.push(...start.points.slice(points.length ? 1 : 0));
      const next = selected.find(
        (reach) =>
          remaining.has(reach) &&
          reach.from === start.to &&
          incoming.get(start.to) === 1 &&
          outgoing.get(start.to) === 1,
      );
      if (!next) break;
      start = next;
    }
    const length = points
      .slice(1)
      .reduce((sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.y - points[i].y), 0);
    chains.push({ id, points, length });
  }
  return chains
    .sort((a, b) => b.length - a.length || a.id.localeCompare(b.id))
    .flatMap((chain) => labelPolylineSections(chain.points))
    .slice(0, 3);
}

/** Waved parchment with small cuts and cylinders extending beyond opposite long edges. */
export function mapScrollLayout(
  title: string,
  mapWidth: number,
  fontSize: number,
  minY: number,
): MapScrollLayout {
  const padding = fontSize * 0.32,
    curl = fontSize * 0.7,
    extension = fontSize * 0.36,
    wave = fontSize * 0.14;
  const label = inscriptionBounds(title, mapTextStyle(fontSize, { haloEms: 0.1 }), {
    kind: 'straight',
    origin: { x: mapWidth / 2, y: 0 },
    anchor: 'middle',
  });
  const width = label.maxX - label.minX + padding * 2 + curl * 2;
  const bodyHeight = label.maxY - label.minY + padding * 2;
  const height = bodyHeight + extension * 2 + wave * 2;
  const minX = (mapWidth - width) / 2,
    inset = fontSize * 0.025;
  const rollSlack = curl * 0.22 + inset;
  const left = minX + inset,
    right = minX + width - inset;
  const start = left + curl,
    end = right - curl,
    top = minY + rollSlack + extension + wave,
    bottom = top + bodyHeight;
  const at = (t: number, y: number) => ({
    x: start + (end - start) * t,
    y: y + wave * Math.sin(t * Math.PI * 2),
  });
  const edge = (y: number, reverse: boolean) => {
    let cursor = reverse ? 1 : 0;
    const first = at(cursor, y);
    const commands = [`M ${n(first.x)} ${n(first.y)}`];
    const curve = (to: number) => {
      const a = at(cursor, y),
        b = at(to, y),
        dt = to - cursor;
      const slope = (t: number) => wave * Math.PI * 2 * Math.cos(t * Math.PI * 2);
      commands.push(
        `C ${n(a.x + (b.x - a.x) / 3)} ${n(a.y + (slope(cursor) * dt) / 3)} ${n(b.x - (b.x - a.x) / 3)} ${n(b.y - (slope(to) * dt) / 3)} ${n(b.x)} ${n(b.y)}`,
      );
      cursor = to;
    };
    const cuts = reverse ? [0.81, 0.54, 0.24] : [0.17, 0.43, 0.72, 0.9];
    const half = (fontSize * 0.07) / (end - start);
    for (const [index, t] of cuts.entries()) {
      curve(t + (reverse ? half : -half));
      const tip = at(t, y),
        exit = at(t + (reverse ? -half : half), y);
      commands.push(
        `L ${n(tip.x + fontSize * 0.02)} ${n(tip.y + (reverse ? -1 : 1) * fontSize * (index % 2 ? 0.14 : 0.1))} L ${n(exit.x)} ${n(exit.y)}`,
      );
      cursor = t + (reverse ? -half : half);
    }
    curve(reverse ? 0 : 1);
    return commands.join(' ');
  };
  const topEdge = edge(top, false),
    bottomEdge = edge(bottom, true).replace(/^M /, 'L ');
  const writingSurface = `${topEdge} L ${n(end)} ${n(bottom)} ${bottomEdge} Z`;
  const leftTop = top - extension,
    leftBottom = bottom + extension * 0.1;
  const rightTop = top - extension * 0.1,
    rightBottom = bottom + extension;
  const cylinder = (outer: number, inner: number, a: number, b: number) => {
    const center = (outer + inner) / 2,
      radius = Math.abs(inner - outer) * 0.22;
    return `M ${n(inner)} ${n(a)} C ${n(center)} ${n(a - radius)} ${n(outer)} ${n(a - radius)} ${n(outer)} ${n(a + radius)} L ${n(outer)} ${n(b - radius)} C ${n(outer)} ${n(b + radius)} ${n(center)} ${n(b + radius)} ${n(inner)} ${n(b)} Z`;
  };
  const leftRoll = cylinder(left, start, leftTop, leftBottom);
  const rightRoll = cylinder(right, end, rightTop, rightBottom);
  const leftFold = `M ${n(start)} ${n(leftTop)} C ${n(left + curl * 0.18)} ${n(leftTop - fontSize * 0.03)} ${n(left + curl * 0.2)} ${n(leftTop + curl * 0.44)} ${n(start)} ${n(leftTop + curl * 0.38)} L ${n(start)} ${n(leftBottom)} L ${n(start - curl * 0.13)} ${n(leftBottom - curl * 0.06)} L ${n(start - curl * 0.13)} ${n(leftTop + curl * 0.35)} Z`;
  const rightFold = `M ${n(end)} ${n(rightBottom)} C ${n(right - curl * 0.18)} ${n(rightBottom + fontSize * 0.03)} ${n(right - curl * 0.2)} ${n(rightBottom - curl * 0.44)} ${n(end)} ${n(rightBottom - curl * 0.38)} L ${n(end)} ${n(rightTop)} L ${n(end + curl * 0.13)} ${n(rightTop + curl * 0.06)} L ${n(end + curl * 0.13)} ${n(rightBottom - curl * 0.35)} Z`;
  // Include ellipse control extrema and the stroke, rather than reserving only the writing surface.
  const bounds = { minX, maxX: minX + width, minY, maxY: minY + height + rollSlack * 2 };
  return {
    bodyPath: `${writingSurface} ${leftRoll} ${rightRoll}`,
    foldPaths: [leftFold, rightFold],
    bounds,
    title: mapInscription('title', title, mapTextStyle(fontSize, { haloEms: 0.1 }), {
      kind: 'straight',
      origin: { x: mapWidth / 2, y: top + padding - label.minY },
      anchor: 'middle',
    }),
  };
}

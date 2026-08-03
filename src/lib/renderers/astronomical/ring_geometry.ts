/**
 * Geometry for a planet's ring, independent of any drawing surface.
 *
 * A ring is drawn in two passes (back → planet → front) so the planet occludes the half of the
 * ellipse that runs behind it. Deciding *which* half is behind is arithmetic on the projected
 * ellipse, not a canvas operation, so it lives here rather than inside a context-taking draw call.
 */

/**
 * Major-axis split: the two semicircles meet at the endpoints of the long diameter (or the long
 * vertical, when the ellipse is taller than it is wide).
 */
export function ringSemicircleAngles(
  rx: number,
  ry: number,
  useFirstHalf: boolean,
): { startAngle: number; endAngle: number } {
  if (rx >= ry) {
    if (useFirstHalf) {
      return { startAngle: 0, endAngle: Math.PI };
    }
    return { startAngle: Math.PI, endAngle: 2 * Math.PI };
  }
  if (useFirstHalf) {
    return { startAngle: Math.PI / 2, endAngle: (3 * Math.PI) / 2 };
  }
  return { startAngle: (3 * Math.PI) / 2, endAngle: Math.PI / 2 + 2 * Math.PI };
}

/**
 * Which semicircle (half 0 vs half 1) is depth-behind the other: compare arc midpoints at the
 * ends of the **minor** diameter (when rx ≥ ry: top vs bottom bulges), after in-plane rotation.
 * Smaller screen-y (higher on canvas) → treat as back for typical Saturn-like orientation.
 */
export function ringBackHalfIsHalfZero(
  rx: number,
  ry: number,
  oy: number,
  angleRad: number,
): boolean {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  let lx0: number;
  let ly0: number;
  let lx1: number;
  let ly1: number;

  if (rx >= ry) {
    lx0 = 0;
    ly0 = oy + ry;
    lx1 = 0;
    ly1 = oy - ry;
  } else {
    lx0 = -rx;
    ly0 = oy;
    lx1 = rx;
    ly1 = oy;
  }

  const y0 = lx0 * sin + ly0 * cos;
  const y1 = lx1 * sin + ly1 * cos;
  return y0 <= y1;
}

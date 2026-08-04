// One background star per vertex, drawn as a point sprite.
//
// The scene carries every star's position, radius and alpha, so nothing here is generated: the
// attributes are read straight off the scene, which is what lets the two backends put the same
// stars in the same places. `position` and the matrices come from three.

attribute float star_radius;
attribute float star_alpha;

varying float vStarAlpha;

void main() {
  vStarAlpha = star_alpha;
  // A radius below half a pixel would round away to nothing on some drivers, and the scene's
  // smallest stars are 0.35px. Canvas2D antialiases them into a faint dot; the floor here is the
  // nearest equivalent.
  gl_PointSize = max(1.0, star_radius * 2.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

#ifdef GL_ES
precision highp float;
#endif

uniform vec3 star_color;

varying float vStarAlpha;

void main() {
  // Point sprites are square; discard the corners so a star reads as the round dot the Canvas2D
  // backend fills with `arc`.
  vec2 offset = gl_PointCoord - vec2(0.5);
  if (dot(offset, offset) > 0.25) {
    discard;
  }

  gl_FragColor = vec4(star_color, vStarAlpha);
}

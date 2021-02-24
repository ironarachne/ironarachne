export default `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
  vec2 position = gl_FragCoord.xy/u_resolution.xy;
  position.x *= u_resolution.x/u_resolution.y;

  float opacity = length(abs(position) - 0.5);

  gl_FragColor = vec4(0.0, 0.7, 1.0, opacity);
}`;

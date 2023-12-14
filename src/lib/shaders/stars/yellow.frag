#ifdef GL_ES
precision mediump float;
#endif

uniform float seed;
uniform float star_radius;
uniform vec2 resolution;
uniform vec3 corona_color;
uniform vec3 star_color;

#include ../simplex-noise.glsl;
#include star_noise.glsl;

void main(void) {
  vec2 p = gl_FragCoord.xy;

  float height = 0.5;

  float star_on = step(distance(resolution/2.0, p), star_radius);

  vec3 color = mix(star_color, corona_color, height);

  gl_FragColor = vec4((color + 0.63 * star_color) * star_on, 1.0);
}

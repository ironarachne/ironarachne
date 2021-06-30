"use strict";

const random = require("random");

export function generate() {
  const seed = random.float(0.0, 100.0);

  return `uniform vec2 resolution;
  uniform float time;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 239.0)) * 239.0;
  }

  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 x, float seed) {
    return mod289(((x*34.0)+1.0) * x * seed);
  }

  float snoise(vec2 v, float seed) {

    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
  // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ), seed)
      + i.x + vec3(0.0, i1.x, 1.0 ), seed);

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 150.0 * dot(m, g);
  }

  float star(vec2 p, float seed) {
    return step(0.49, smoothstep(0.80, 1.0, snoise(p, seed)));
  }

  void main(void) {

    vec2 p = gl_FragCoord.xy ;
      vec2 o = cameraPosition.xy * 2.0;

      // star layers
      float s1 = star(p + floor(o * 1.1), ${seed});
      float s2 = star(p + floor(o * 0.75) + vec2(-20.0, 10.0), ${seed});
      float s3 = star(p + floor(o * 0.5) + vec2(-75.0, 25.0), ${seed});

      // flickering
      vec2 p2 = resolution.xy - p * 0.25;
      vec2 pl = -1.0 + 2.0 * p2;
      float len = length(pl);
      vec2 uv = p2 + (pl / len) * cos(len * 20.0 - time * 1.079)*0.8537;

      float g = smoothstep(0.10, 1.0,snoise(uv, ${seed}));
      if (s1 > 0.0) {
          s1 -= g * 0.25;
      }
      if (s2 > 0.0) {
          s2 += g * 0.75;
      }

      if (s3 > 0.0) {
          s3 += g * 0.5;
      }

      // final color
      float val = (s1 * 1.0 + s2 * 0.50 + s3 * 0.25) * 0.85;
      gl_FragColor = vec4(val, val, val, 1);

  }`;
}

import * as ShaderTools from "../shadertools.js";

const random = require("random");

export function generateVertexShader() {
  return `varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;
}

export function generateFragmentShader() {
  let noiseFunction = ShaderTools.simplexNoise();

  let seed = random.float(0.0, 100.0);

  let shader = `#ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;
  varying vec2 vUv;

  ${noiseFunction}

  vec4 biome(float height, float moisture, float temperature) {
    if (height < 0.5) {
      return vec4(0.0, 0.0, 0.6, 1.0);
    } else if (height < 0.6 && moisture < 0.5) {
      return vec4(0.55, 0.55, 0.35, 1.0);
    } else if (height < 0.8 && moisture > 0.4) {
      return vec4(0.10, 0.35, 0.18, 1.0);
    } else if (height < 0.9) {
      return vec4(0.10, 0.45, 0.20, 1.0);
    } else {
      return vec4(0.5, 0.5, 0.4, 1.0);
    }
  }

  void main(void) {
    float x = vUv.x;
    float y = vUv.y;

    float height = 1.0 * snoise(vec3(x * 4.0, y * 4.0, 1.0), ${seed});
    height += 0.55 * snoise(vec3(x * 8.0, y * 8.0, 1.0), ${seed});
    height += 0.15 * snoise(vec3(x * 24.0, y * 24.0, 1.0), ${seed});
    height += 0.05 * snoise(vec3(x * 48.0, y * 48.0, 1.0), ${seed});

    float moisture = 1.0 * snoise(vec3(x * 4.0, y * 4.0, 1.0), ${seed} * 3.0);
    moisture += 0.55 * snoise(vec3(x * 8.0, y * 8.0, 1.0), ${seed} * 3.0);
    moisture += 0.15 * snoise(vec3(x * 24.0, y * 24.0, 1.0), ${seed} * 3.0);

    float t = y/u_resolution.y;
    float temperature = abs(u_resolution.y / distance(vec2(0.0, t), vec2(0.0, u_resolution.y/2.0)));

    vec4 color = biome(height, moisture, temperature);

    gl_FragColor = color;
  }`;

  return shader;
}

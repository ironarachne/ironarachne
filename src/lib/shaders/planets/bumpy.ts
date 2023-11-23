import random from "random";
import SimplexNoise from "../simplex-noise.glsl";

export function generate() {
  const noiseFunction = SimplexNoise;

  const seed = random.float(0.0, 100.0);

  const shader = `varying vec3 vertPos;
  varying vec2 vUv;
  varying vec3 v_Normal;

  ${noiseFunction}

  void main() {
    vUv = uv;
    vec4 vertPos4 = modelViewMatrix * vec4(position, 1.0);
    vertPos = vec3(vertPos4) / vertPos4.w;

    float x = vUv.x;
    float y = vUv.y;

    float height = 1.0 * snoise(vec3(x * 38.0, y * 38.0, 1.0), ${seed});
    height += 0.55 * snoise(vec3(x * 8.0, y * 8.0, 1.0), ${seed});
    height += 0.15 * snoise(vec3(x * 24.0, y * 24.0, 1.0), ${seed});
    height += 0.05 * snoise(vec3(x * 48.0, y * 48.0, 1.0), ${seed});

    float bumpScale = 0.25;

    vec3 newPosition = position + normal * bumpScale * height;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    v_Normal = (modelViewMatrix * vec4(normal * bumpScale * height, 0.0)).xyz;
  }`;

  return shader;
}

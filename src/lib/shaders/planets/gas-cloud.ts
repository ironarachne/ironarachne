import random from "random";
import SimplexNoise from "../simplex-noise.glsl";

export function generate(): string {
  const noiseFunction = SimplexNoise;

  const seed = random.float(0.0, 200.0);

  const shader = `#ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;

  varying vec2 vUv;
  varying vec3 vertPos;
  varying vec3 v_Normal;

  ${noiseFunction}

  void main(void) {
    vec3 lightPos = vec3(-15.0, 15.0, 2.0);
    vec3 N = normalize(v_Normal);
    vec3 L = normalize(lightPos - vertPos);

    float x = vUv.x;
    float y = vUv.y;

    // Lambert's cosine law
    float lambertian = max(dot(N, L), 0.0);
    float specular = 0.0;
    if(lambertian > 0.0) {
      vec3 R = reflect(-L, N);      // Reflected light vector
      vec3 V = normalize(-vertPos); // Vector to viewer
      // Compute the specular term
      float specAngle = max(dot(R, V), 0.0);
      specular = pow(specAngle, 39.0);
    }

    float density = 1.0 * snoise(vec3(x * 6.0, y * 6.0, 1.0), ${seed});
    density += 0.35 * snoise(vec3(x * 32.0, y * 32.0, 1.0), ${seed});
    density += 0.15 * snoise(vec3(x * 48.0, y * 48.0, 1.0), ${seed});
    //density += 0.05 * snoise(vec3(x * 128.0, y * 128.0, 1.0), ${seed});
    density *= 0.8;

    float opacity = mix(0.2, 1.0, density);

    if (density < 0.5) {
      opacity = 0.0;
    }

    vec3 ambientColor = vec3(0.0, 0.0, 0.0);
    vec3 specularColor = vec3(1.0, 1.0, 0.3);

    gl_FragColor = vec4(1.0 * ambientColor +
      1.0 * lambertian * vec3(1.0, 1.0, 1.0) +
      0.12 * specular * specularColor, opacity);
  }`;

  return shader;
}

import random from "random";
import GoldNoise from "../gold-noise.glsl";
import SimplexNoise from "../simplex-noise.glsl";

export function generate(): string {
  const noiseFunction = SimplexNoise;
  const goldNoiseFunction = GoldNoise;

  const seed = random.float(0.0, 100.0);

  const colors = [];
  for (let i = 0; i < 6; i++) {
    colors.push(random.float(0.0, 1.0));
  }

  const shader = `#ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;

  varying vec2 vUv;
  varying vec3 vertPos;
  varying vec3 v_Normal;

  ${noiseFunction}
  ${goldNoiseFunction}

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

    float height = 1.0 * snoise(vec3(x * 0.0, y * 8.0, 1.0), ${seed});
    //height += 0.8 * snoise(vec3(x * 0.0, y * 128.0, 1.0), ${seed});
    height += 0.15 * snoise(vec3(x * 3.0, y * 64.0, 1.0), ${seed});
    //height += 0.05 * snoise(vec3(x * 0.0, y * 128.0, 1.0), ${seed});

    height = round(height * 18.0)/18.0;

    vec3 ambientColor = vec3(0.0, 0.0, 0.0);
    vec3 specularColor = vec3(1.0, 1.0, 0.3);

    float specularI = 0.02;
    float diffuseI = 1.0;

    float clampedHeight = clamp(height, 0.3, 0.6);

    vec3 bandColor = vec3(${colors[0]}, ${colors[1]}, ${colors[2]});
    vec3 baseColor = vec3(${colors[3]}, ${colors[4]}, ${colors[5]});

    vec3 diffuseColor = mix(baseColor, bandColor, clampedHeight);

    gl_FragColor = vec4(1.0 * ambientColor +
      diffuseI * lambertian * diffuseColor +
      specularI * specular * specularColor, 1.0);
  }`;

  return shader;
}

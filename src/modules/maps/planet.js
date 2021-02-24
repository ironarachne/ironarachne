import * as ShaderTools from "../shadertools.js";
import VertexShader from "../shaders/planet-vertex.glsl.js";
import AtmosphereShader from "../shaders/planet-atmosphere.glsl.js";

const random = require("random");

export function generate() {
  let planetMap = {};

  planetMap.vertexShader = generateVertexShader();
  planetMap.baseFragmentShader = generateFragmentShader();
  planetMap.cloudShader = generateCloudShader();
  planetMap.atmosphereShader = AtmosphereShader;

  return planetMap;
}

export function generateVertexShader() {
  return VertexShader;
}

export function generateCloudShader() {
  let noiseFunction = ShaderTools.simplexNoise();

  let seed = random.float(0.0, 200.0);

  let shader = `#ifdef GL_ES
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

export function generateFragmentShader() {
  let noiseFunction = ShaderTools.simplexNoise();

  let seed = random.float(0.0, 100.0);

  let shader = `#ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;

  varying vec2 vUv;
  varying vec3 vertPos;
  varying vec3 v_Normal;

  ${noiseFunction}

  vec3 biome(float height, float moisture, float temperature) {
    vec3 OCEAN = vec3(0.0, 0.0, 0.6);
    vec3 COAST = vec3(0.0, 0.1, 0.6);
    vec3 PLAINS = vec3(0.1, 0.45, 0.2);
    vec3 DESERT = vec3(0.55, 0.55, 0.35);
    vec3 MOUNTAINS = vec3(0.5, 0.5, 0.4);
    vec3 FOREST = vec3(0.1, 0.35, 0.18);

    if (height < 0.45) {
      return OCEAN;
    } else if (height < 0.5) {
      return COAST;
    } else if (height < 0.6) {
      return mix(PLAINS, DESERT, moisture);
    } else if (height < 0.8) {
      return mix(PLAINS, FOREST, moisture);
    } else if (height < 0.9) {
      return mix(FOREST, MOUNTAINS, height);
    } else {
      return MOUNTAINS;
    }
  }

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

    float height = 1.0 * snoise(vec3(x * 4.0, y * 4.0, 1.0), ${seed});
    height += 0.55 * snoise(vec3(x * 8.0, y * 8.0, 1.0), ${seed});
    height += 0.15 * snoise(vec3(x * 24.0, y * 24.0, 1.0), ${seed});
    height += 0.05 * snoise(vec3(x * 48.0, y * 48.0, 1.0), ${seed});

    float moisture = 1.0 * snoise(vec3(x * 4.0, y * 4.0, 1.0), ${seed} * 3.0);
    moisture += 0.55 * snoise(vec3(x * 8.0, y * 8.0, 1.0), ${seed} * 3.0);
    moisture += 0.15 * snoise(vec3(x * 24.0, y * 24.0, 1.0), ${seed} * 3.0);

    float t = y/u_resolution.y;
    float temperature = abs(u_resolution.y / distance(vec2(0.0, t), vec2(0.0, u_resolution.y/2.0)));

    vec3 biomeColor = biome(height, moisture, temperature);

    vec3 ambientColor = vec3(0.0, 0.0, 0.0);
    vec3 specularColor = vec3(1.0, 1.0, 0.3);

    float specularI = 0.12;
    float diffuseI = 1.0;

    if (height < 0.5) {
      specularI = 0.6;
      diffuseI = 1.1;
    }

    gl_FragColor = vec4(1.0 * ambientColor +
      diffuseI * lambertian * biomeColor +
      specularI * specular * specularColor, 1.0);
  }`;

  return shader;
}

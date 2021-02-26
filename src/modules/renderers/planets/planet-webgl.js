import * as ShaderTools from "../../shadertools.js";

const random = require("random");

export function translateDiameterToModelSize(diameter) {
  let size = Math.floor(diameter / 2000) + 1;

  if (diameter > 19000) {
    size = 10;
  }

  return size;
}

export function getFragmentShader(planet) {
  let shaderData = getFragmentShaderByClassification(planet.classification);

  let shader = shaderData.generateFragmentShader();

  return shader;
}

export function getCloudShader() {
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

function getFragmentShaderByClassification(classification) {
  let options = [
    {
      name: "arid",
      generateFragmentShader: function () {
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

        vec3 biome(float height) {
          vec3 LOWLANDS = vec3(0.8, 0.6, 0.4);
          vec3 DESERT = vec3(0.7, 0.5, 0.35);
          vec3 HILLS = vec3(0.6, 0.5, 0.3);
          vec3 MOUNTAINS = vec3(0.55, 0.45, 0.2);

          if (height < 0.5) {
            return LOWLANDS;
          } else if (height < 0.8) {
            return DESERT;
          } else if (height < 0.9) {
            return HILLS;
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

          vec3 biomeColor = biome(height);

          vec3 ambientColor = vec3(0.0, 0.0, 0.0);
          vec3 specularColor = vec3(1.0, 1.0, 0.3);

          float specularI = 0.12;
          float diffuseI = 1.0;

          gl_FragColor = vec4(1.0 * ambientColor +
            diffuseI * lambertian * biomeColor +
            specularI * specular * specularColor, 1.0);
        }`;

        return shader;
      },
    },
    {
      name: "barren",
      generateFragmentShader: function () {
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

        vec3 biome(float height) {
          vec3 LOWLANDS = vec3(0.8, 0.6, 0.4);
          vec3 DESERT = vec3(0.7, 0.5, 0.35);
          vec3 HILLS = vec3(0.6, 0.5, 0.3);
          vec3 MOUNTAINS = vec3(0.55, 0.45, 0.2);

          if (height < 0.5) {
            return LOWLANDS;
          } else if (height < 0.8) {
            return DESERT;
          } else if (height < 0.9) {
            return HILLS;
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

          vec3 biomeColor = biome(height);

          vec3 ambientColor = vec3(0.0, 0.0, 0.0);
          vec3 specularColor = vec3(1.0, 1.0, 0.3);

          float specularI = 0.12;
          float diffuseI = 1.0;

          gl_FragColor = vec4(1.0 * ambientColor +
            diffuseI * lambertian * biomeColor +
            specularI * specular * specularColor, 1.0);
        }`;

        return shader;
      },
    },
    {
      name: "garden",
      generateFragmentShader: function () {
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
      },
    },
    {
      name: "gas giant",
      generateFragmentShader: function () {
        let noiseFunction = ShaderTools.simplexNoise();
        let goldNoiseFunction = ShaderTools.goldNoise();

        let seed = random.float(0.0, 100.0);

        let colors = [];
        for (let i=0;i<6;i++) {
          colors.push(random.float(0.0, 1.0));
        }

        let shader = `#ifdef GL_ES
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
      },
    },
    {
      name: "ice",
      generateFragmentShader: function () {
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

        vec3 biome(float height) {
          vec3 BLUE_ICE = vec3(0.7, 0.9, 0.95);
          vec3 DEEP_ICE = vec3(0.9, 0.95, 0.95);
          vec3 ICE_PLAIN = vec3(0.95, 1.0, 1.0);
          vec3 ICE_MOUNTAIN = vec3(1.0, 1.0, 1.0);

          if (height < 0.5) {
            return BLUE_ICE;
          } else if (height < 0.6) {
            return DEEP_ICE;
          } else if (height < 0.8) {
            return ICE_PLAIN;
          } else {
            return ICE_MOUNTAIN;
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

          vec3 biomeColor = biome(height);

          vec3 ambientColor = vec3(0.0, 0.0, 0.0);
          vec3 specularColor = vec3(1.0, 1.0, 0.3);

          float specularI = 0.6;
          float diffuseI = 1.1;

          gl_FragColor = vec4(1.0 * ambientColor +
            diffuseI * lambertian * biomeColor +
            specularI * specular * specularColor, 1.0);
        }`;

        return shader;
      },
    },
    {
      name: "jungle",
      generateFragmentShader: function () {
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
      },
    },
    {
      name: "ocean",
      generateFragmentShader: function () {
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

        vec3 biome(float height) {
          vec3 OCEAN = vec3(0.0, 0.0, 0.6);
          vec3 COAST = vec3(0.0, 0.1, 0.6);
          vec3 CORAL = vec3(0.0, 0.15, 0.65);

          if (height < 0.9) {
            return OCEAN;
          } else if (height < 1.0) {
            return COAST;
          } else {
            return CORAL;
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

          vec3 biomeColor = biome(height);

          vec3 ambientColor = vec3(0.0, 0.0, 0.0);
          vec3 specularColor = vec3(1.0, 1.0, 0.3);

          float specularI = 0.6;
          float diffuseI = 1.1;

          gl_FragColor = vec4(1.0 * ambientColor +
            diffuseI * lambertian * biomeColor +
            specularI * specular * specularColor, 1.0);
        }`;

        return shader;
      },
    },
    {
      name: "swamp",
      generateFragmentShader: function () {
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
      },
    },
    {
      name: "toxic",
      generateFragmentShader: function () {
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
      },
    },
    {
      name: "volcanic",
      generateFragmentShader: function () {
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

        vec3 biome(float height) {
          vec3 LAVA = vec3(1.0, 0.3, 0.0);
          vec3 COASTAL_LAVA = vec3(1.0, 0.95, 0.1);
          vec3 BLACK_SAND = vec3(0.1, 0.1, 0.1);
          vec3 MOUNTAINS = vec3(0.35, 0.35, 0.3);

          if (height < 0.5) {
            return mix(LAVA, COASTAL_LAVA, height);
          } else if (height < 0.8) {
            return BLACK_SAND;
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

          vec3 biomeColor = biome(height);

          vec3 ambientColor = vec3(0.0, 0.0, 0.0);
          vec3 specularColor = vec3(1.0, 1.0, 0.3);

          float specularI = 0.12;
          float diffuseI = 1.0;

          if (height > 0.5) {
            gl_FragColor = vec4(1.0 * ambientColor +
              diffuseI * lambertian * biomeColor +
              specularI * specular * specularColor, 1.0);
          } else {
            gl_FragColor = vec4(biomeColor, 1.0);
          }

        }`;

        return shader;
      },
    },
  ];

  for (let i=0;i<options.length;i++) {
    if (options[i].name == classification) {
      return options[i];
    }
  }
}

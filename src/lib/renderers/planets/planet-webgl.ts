import BasicVertexShader from "../../shaders/basic-vertex.glsl.js";
import CloudShader from "../../shaders/clouds.glsl.js";
import GoldNoise from "../../shaders/gold-noise.glsl.js";
import AridShader from "../../shaders/planets/arid.glsl.js";
import BarrenShader from "../../shaders/planets/barren.glsl.js";
import GardenShader from "../../shaders/planets/garden.glsl.js";
import IceShader from "../../shaders/planets/ice.glsl.js";
import JungleShader from "../../shaders/planets/jungle.glsl.js";
import OceanShader from "../../shaders/planets/ocean.glsl.js";
import SwampShader from "../../shaders/planets/swamp.glsl.js";
import ToxicShader from "../../shaders/planets/toxic.glsl.js";
import VolcanicShader from "../../shaders/planets/volcanic.glsl.js";
import SimplexNoise from "../../shaders/simplex-noise.glsl.js";

import random from "random";

export function translateDiameterToModelSize(diameter: number): number {
  let size = Math.floor(diameter / 2000) + 1;

  if (diameter > 19000) {
    size = 10;
  }

  return size;
}

export function getShaderData(classification: string) {
  const options = {
    arid: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return AridShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    barren: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return BarrenShader;
      },
      generateVertexShader: function() {
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
      },
    },
    garden: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return GardenShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    "gas giant": {
      generateCloudShader: function() {
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
      },
      generateFragmentShader: function() {
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
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    ice: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return IceShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    jungle: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return JungleShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    ocean: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return OceanShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    swamp: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return SwampShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    toxic: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return ToxicShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
    volcanic: {
      generateCloudShader: function() {
        return CloudShader;
      },
      generateFragmentShader: function() {
        return VolcanicShader;
      },
      generateVertexShader: function() {
        return BasicVertexShader;
      },
    },
  };

  // @ts-ignore
  return Reflect.get(options, classification);
}

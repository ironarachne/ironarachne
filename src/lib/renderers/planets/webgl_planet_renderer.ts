import random from "random";
import * as THREE from "three";
import * as PlanetShaders from "$lib/shaders/planets/planets";
import SimpleVertexShader from "$lib/shaders/simple.vert";
import type Planet from "$lib/planets/planet";

export function render(planet: Planet, width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
  camera.position.set(0, 0, 1);

  if (canvas === null) {
    throw new Error("Canvas not found");
  }

  const planetShader = PlanetShaders.getFragmentShaderByName(
    planet.classification.name,
  );

  const colors = getRandomGasGiantColorSet();

  const uniforms = {
    light_direction: {
      value: new THREE.Vector3(random.float(0.3, 0.6), 1.0, 0.5),
    },
    planet_radius: {
      value: translateRadiusToImageSize(
        planet.diameter / 2.0,
        Math.min(height, width),
      ),
    },
    main_color: { value: colors[0] },
    band_color_1: { value: colors[1] },
    band_color_2: { value: colors[2] },
    resolution: { value: new THREE.Vector2(width, height) },
    seed: { value: random.float(0.0, 100.0) },
  };

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: planetShader,
    vertexShader: SimpleVertexShader,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0.5, 0.5, 0);
  scene.add(plane);

  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL("image/png");

  material.dispose();
  geometry.dispose();
  renderer.dispose();
  canvas.remove();

  return data;
}

function getRandomGasGiantColorSet(): [
  THREE.Vector3,
  THREE.Vector3,
  THREE.Vector3,
] {
  const color1 = new THREE.Vector3(
    random.float(0.1, 0.8),
    random.float(0.1, 0.8),
    random.float(0.1, 0.8),
  );
  const color2 = new THREE.Vector3(
    random.float(0.1, 0.8),
    random.float(0.1, 0.8),
    random.float(0.1, 0.8),
  );
  const color3 = new THREE.Vector3(
    random.float(0.1, 0.8),
    random.float(0.1, 0.8),
    random.float(0.1, 0.8),
  );

  return [color1, color2, color3];
}

function translateRadiusToImageSize(radius: number, imageSize: number): number {
  const radiusRelativeToEarth = radius / 6371;

  const earthSizeInPixels = imageSize / 4;
  const maxPlanetSizeInPixels = imageSize / 2.5;
  const sizeInPixels = radiusRelativeToEarth * earthSizeInPixels;

  return Math.min(maxPlanetSizeInPixels, sizeInPixels);
}

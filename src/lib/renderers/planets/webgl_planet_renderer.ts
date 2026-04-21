import * as THREE from 'three';
import * as PlanetShaders from '$lib/shaders/planets/planets';
import { RNG } from '@ironarachne/rng';
import SimpleVertexShader from '$lib/shaders/simple.vert';
import { getRandomGasGiantRgbTriplet } from '$lib/renderers/astronomical/gas_giant_palette';
import { planetRadiusKmToPreviewPixels } from '$lib/renderers/astronomical/image_body_scale';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import type RGBColor from '$lib/graphics/rgb_color';

export function render(
  document: Document,
  planet: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
): string {
  const rng = new RNG(seed);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
  camera.position.set(0, 0, 1);

  if (canvas === null) {
    throw new Error('Canvas not found');
  }

  const planetShader = PlanetShaders.getFragmentShaderByName(planet.classification);
  const colors = vectorTripletFromRgbTriplet(getRandomGasGiantRgbTriplet(rng.randomString(13)));

  const uniforms = {
    light_direction: {
      value: new THREE.Vector3(rng.float(0.3, 0.6), 1.0, 0.5),
    },
    planet_radius: {
      value: planetRadiusKmToPreviewPixels(planet.radius, Math.min(height, width)),
    },
    main_color: { value: colors[0] },
    band_color_1: { value: colors[1] },
    band_color_2: { value: colors[2] },
    cloud_coverage: { value: rng.float(0.5, 0.75) },
    storm_activity: { value: rng.float(0.2, 0.6) },
    resolution: { value: new THREE.Vector2(width, height) },
    seed: { value: rng.float(0, 100.0) },
    render_background: { value: 1.0 },
    has_rings: { value: planet.has_ring_system ? 1.0 : 0.0 },
    ring_angle: { value: rng.float(0, Math.PI) },
    ring_tilt: { value: rng.float(0.1, 0.4) },
    ring_color: {
      value: new THREE.Vector3(rng.float(0.6, 0.9), rng.float(0.6, 0.9), rng.float(0.6, 0.9)),
    },
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
  const data = renderer.domElement.toDataURL('image/png');

  material.dispose();
  geometry.dispose();
  renderer.dispose();
  canvas.remove();

  return data;
}

function vectorTripletFromRgbTriplet(
  colors: [RGBColor, RGBColor, RGBColor],
): [THREE.Vector3, THREE.Vector3, THREE.Vector3] {
  return [
    new THREE.Vector3(colors[0].r, colors[0].g, colors[0].b),
    new THREE.Vector3(colors[1].r, colors[1].g, colors[1].b),
    new THREE.Vector3(colors[2].r, colors[2].g, colors[2].b),
  ];
}

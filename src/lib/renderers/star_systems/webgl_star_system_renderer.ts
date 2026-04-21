import * as THREE from 'three';
import * as PlanetShaders from '$lib/shaders/planets/planets';
import StarShader from '$lib/shaders/stars/star.frag';
import SimpleVertexShader from '$lib/shaders/simple.vert';
import { RNG } from '@ironarachne/rng';
import { getRandomGasGiantRgbTriplet } from '$lib/renderers/astronomical/gas_giant_palette';
import { computeStarSystemLayout } from '$lib/renderers/astronomical/star_system_layout';
import { getRgbColorsFromStarSurfaceTemperature } from '$lib/renderers/astronomical/star_surface_colors';
import { starCoronaWidthPixelsFromDiskRadius } from '$lib/renderers/astronomical/image_body_scale';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';
import type RGBColor from '$lib/graphics/rgb_color';

export function render(
  document: Document,
  system: StarSystem,
  width: number,
  height: number,
  seed: string,
): string {
  const layout = computeStarSystemLayout(system, width, height);
  if (layout.totalUnits === 0) return '';

  const rng = new RNG(seed);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, width, height, 0, 0.1, 1000);
  camera.position.set(0, 0, 10);

  if (canvas === null) {
    throw new Error('Canvas not found');
  }

  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  const bgUniforms = {
    seed: { value: rng.float(0.0, 100.0) },
    resolution: { value: new THREE.Vector2(width, height) },
    corona_width: { value: 1.0 },
    glow_color: { value: new THREE.Vector3() },
    corona_color: { value: new THREE.Vector3() },
    star_color: { value: new THREE.Vector3() },
    star_radius: { value: 1.0 },
    render_background: { value: 1.0 },
  };
  const bgGeo = new THREE.PlaneGeometry(width, height);
  const bgMat = new THREE.ShaderMaterial({
    uniforms: bgUniforms,
    fragmentShader: StarShader,
    vertexShader: SimpleVertexShader,
    depthWrite: false,
  });
  const bgPlane = new THREE.Mesh(bgGeo, bgMat);
  bgPlane.position.set(width / 2, height / 2, -100);
  scene.add(bgPlane);
  geometries.push(bgGeo);
  materials.push(bgMat);

  for (const item of layout.items) {
    if (item.kind === 'star') {
      const star = item.body;
      const bodySizePixels = item.bodySizePixels;
      const color_set = getRgbColorsFromStarSurfaceTemperature(star.surface_temperature);
      const planeSize = bodySizePixels * 4.0;

      const uniforms = {
        seed: { value: rng.float(0, 100.0) },
        render_background: { value: 0.0 },
        resolution: { value: new THREE.Vector2(planeSize, planeSize) },
        corona_width: { value: starCoronaWidthPixelsFromDiskRadius(bodySizePixels / 2.0) },
        glow_color: { value: rgbColorToVector3(color_set[2]) },
        corona_color: { value: rgbColorToVector3(color_set[1]) },
        star_color: { value: rgbColorToVector3(color_set[0]) },
        star_radius: { value: bodySizePixels / 2.0 },
      };

      const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: StarShader,
        vertexShader: SimpleVertexShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });

      geometries.push(geometry);
      materials.push(material);

      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(item.centerX, height / 2, 0);
      scene.add(plane);
    } else {
      const planet = item.body;
      const bodySizePixels = item.bodySizePixels;
      const planetShader = PlanetShaders.getFragmentShaderByName(planet.classification);
      const colors = rgbTripletToVectorTriplet(getRandomGasGiantRgbTriplet(rng.randomString(13)));

      const planeSize = bodySizePixels * 4.0;

      const uniforms = {
        light_direction: { value: new THREE.Vector3(1.0, 0.0, 0.5) },
        planet_radius: { value: bodySizePixels / 2.0 },
        main_color: { value: colors[0] },
        band_color_1: { value: colors[1] },
        band_color_2: { value: colors[2] },
        cloud_coverage: { value: rng.float(0.5, 0.75) },
        storm_activity: { value: rng.float(0.2, 0.6) },
        resolution: { value: new THREE.Vector2(planeSize, planeSize) },
        seed: { value: rng.float(0, 100.0) },
        render_background: { value: 0.0 },
        has_rings: { value: planet.has_ring_system ? 1.0 : 0.0 },
        ring_angle: { value: rng.float(0, Math.PI) },
        ring_tilt: { value: rng.float(0.1, 0.4) },
        ring_color: {
          value: new THREE.Vector3(rng.float(0.6, 0.9), rng.float(0.6, 0.9), rng.float(0.6, 0.9)),
        },
      };

      const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
      const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: planetShader,
        vertexShader: SimpleVertexShader,
        transparent: true,
      });

      geometries.push(geometry);
      materials.push(material);

      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(item.centerX, height / 2, 0);
      scene.add(plane);
    }
  }

  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL('image/png');

  for (const mat of materials) mat.dispose();
  for (const geo of geometries) geo.dispose();
  renderer.dispose();
  canvas.remove();

  return data;
}

function rgbColorToVector3(color: RGBColor): THREE.Vector3 {
  return new THREE.Vector3(color.r, color.g, color.b);
}

function rgbTripletToVectorTriplet(
  colors: [RGBColor, RGBColor, RGBColor],
): [THREE.Vector3, THREE.Vector3, THREE.Vector3] {
  return [
    rgbColorToVector3(colors[0]),
    rgbColorToVector3(colors[1]),
    rgbColorToVector3(colors[2]),
  ];
}

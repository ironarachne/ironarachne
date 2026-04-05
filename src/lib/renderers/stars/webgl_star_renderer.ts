import StarShader from '$lib/shaders/stars/star.frag';
import * as THREE from 'three';
import { RNG } from '@ironarachne/rng';
import SimpleVertexShader from '$lib/shaders/simple.vert';
import type RGBColor from '$lib/graphics/rgb_color';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';

export function render(
  document: Document,
  star: AstronomicalBody,
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

  const color_set = getColorSetFromTemperature(star.surface_temperature);

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      seed: { value: rng.float(0, 100.0) },
    render_background: { value: 1.0 },
      resolution: { value: new THREE.Vector2(width, height) },
      corona_width: {
        value: calculateCoronaSize(
          translateRadiusToImageSize(star.radius, Math.min(height, width)),
        ),
      },
      glow_color: { value: translateColorToVec3(color_set[2]) },
      corona_color: { value: translateColorToVec3(color_set[1]) },
      star_color: { value: translateColorToVec3(color_set[0]) },
      star_radius: {
        value: translateRadiusToImageSize(star.radius, Math.min(height, width)),
      },
    },
    fragmentShader: StarShader,
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

function getColorSetFromTemperature(temperature: number): RGBColor[] {
  if (temperature < 3700) {
    return [
      { r: 1.0, g: 0.0, b: 0.0 },
      { r: 0.5, g: 0.0, b: 0.0 },
      { r: 1.0, g: 0.0, b: 0.0 },
    ];
  }

  if (temperature < 5200) {
    return [
      { r: 1.0, g: 0.39, b: 0.0 },
      { r: 0.7, g: 0.13, b: 0.0 },
      { r: 1.0, g: 1.0, b: 0.0 },
    ];
  }

  if (temperature < 6000) {
    return [
      { r: 1.0, g: 1.0, b: 0.0 },
      { r: 0.55, g: 0.35, b: 0.0 },
      { r: 1.0, g: 1.0, b: 0.5 },
    ];
  }

  if (temperature < 7500) {
    return [
      { r: 1.0, g: 1.0, b: 0.9 },
      { r: 0.95, g: 0.95, b: 0.7 },
      { r: 1.0, g: 1.0, b: 1.0 },
    ];
  }

  if (temperature < 10000) {
    return [
      { r: 1.0, g: 1.0, b: 1.0 },
      { r: 0.95, g: 0.95, b: 0.95 },
      { r: 1.0, g: 1.0, b: 1.0 },
    ];
  }

  if (temperature < 30000) {
    return [
      { r: 0.85, g: 0.9, b: 1.0 },
      { r: 0.7, g: 0.75, b: 0.95 },
      { r: 1.0, g: 1.0, b: 1.0 },
    ];
  }

  return [
    { r: 0.0, g: 0.0, b: 1.0 },
    { r: 0.0, g: 0.0, b: 0.75 },
    { r: 0.0, g: 0.2, b: 1.0 },
  ];
}

function calculateCoronaSize(radius: number): number {
  return Math.max(radius * 0.2, 4.0);
}

function translateColorToVec3(color: RGBColor): THREE.Vector3 {
  return new THREE.Vector3(color.r, color.g, color.b);
}

function translateRadiusToImageSize(radius: number, imageSize: number): number {
  const radiusRelativeToSun = radius / 695700;
  const sunSizeInPixels = imageSize / 6.0;
  const maxSizeInPixels = imageSize / 3.5;
  const minSizeInPixels = imageSize / 8.0;

  const sizeInPixels = radiusRelativeToSun * sunSizeInPixels;

  const size = Math.max(minSizeInPixels, Math.min(maxSizeInPixels, sizeInPixels));

  return size;
}

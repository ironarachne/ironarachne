import StarShader from '$lib/shaders/stars/star.frag';
import * as THREE from 'three';
import { RNG } from '@ironarachne/rng';
import SimpleVertexShader from '$lib/shaders/simple.vert';
import { getRgbColorsFromStarSurfaceTemperature } from '$lib/renderers/astronomical/star_surface_colors';
import {
  starCoronaWidthPixelsFromDiskRadius,
  starRadiusKmToPreviewPixels,
} from '$lib/renderers/astronomical/image_body_scale';
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

  const color_set = getRgbColorsFromStarSurfaceTemperature(star.surface_temperature);
  const diskPx = starRadiusKmToPreviewPixels(star.radius, Math.min(height, width));

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      seed: { value: rng.float(0, 100.0) },
      render_background: { value: 1.0 },
      resolution: { value: new THREE.Vector2(width, height) },
      corona_width: {
        value: starCoronaWidthPixelsFromDiskRadius(diskPx),
      },
      glow_color: { value: rgbColorToVector3(color_set[2]) },
      corona_color: { value: rgbColorToVector3(color_set[1]) },
      star_color: { value: rgbColorToVector3(color_set[0]) },
      star_radius: { value: diskPx },
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

function rgbColorToVector3(color: RGBColor): THREE.Vector3 {
  return new THREE.Vector3(color.r, color.g, color.b);
}

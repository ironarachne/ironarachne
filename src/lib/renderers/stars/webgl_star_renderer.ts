import StarShader from "$lib/shaders/stars/star.frag";
import type Star from "$lib/stars/star";
import random from "random";
import * as THREE from "three";
import SimpleVertexShader from "$lib/shaders/simple.vert";
import type RGBColor from "$lib/graphics/rgb_color";

export function render(star: Star, width: number, height: number): string {
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

  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      seed: { value: random.float(0, 100.0) },
      resolution: { value: new THREE.Vector2(width, height) },
      corona_width: {
        value: calculateCoronaSize(translateRadiusToImageSize(star.radius)),
      },
      corona_color: { value: translateColorToVec3(star.secondaryColor) },
      star_color: { value: translateColorToVec3(star.primaryColor) },
      star_radius: { value: translateRadiusToImageSize(star.radius) },
    },
    fragmentShader: StarShader,
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

  return data;
}

function calculateCoronaSize(radius: number): number {
  return radius * 0.2;
}

function translateColorToVec3(color: RGBColor): THREE.Vector3 {
  return new THREE.Vector3(color.r, color.g, color.b);
}

function translateRadiusToImageSize(radius: number): number {
  const radiusRelativeToSun = radius / 695508;
  const sizeInPixels = radiusRelativeToSun * 32.0; // a star the size of the sun is 32px
  return Math.min(50.0, sizeInPixels); // a star can be at most 50px
}

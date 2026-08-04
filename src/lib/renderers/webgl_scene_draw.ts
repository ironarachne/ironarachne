/**
 * The WebGL backend's GPU submission: a draw list onto a canvas, and the canvas out as a PNG.
 *
 * Everything this file decides is a three.js question — what a mesh is made of, what order it goes
 * in, what gets disposed. What the picture *contains* was settled by the scene builder and turned
 * into draws by `webgl_scene_build.ts`, which is where the tests are, because nothing here runs
 * without a GL context.
 */

import * as THREE from 'three';
import SceneStarsFragmentShader from '$lib/shaders/background/scene_stars.frag';
import SceneStarsVertexShader from '$lib/shaders/background/scene_stars.vert';
import SimpleVertexShader from '$lib/shaders/simple.vert';
import { buildWebGLDrawList } from '$lib/renderers/webgl_scene_build';
import { canvasToDataUrlAtSize, rasterSizeForQuality } from '$lib/renderers/render_scale';
import type { AstronomicalScene } from '$lib/renderers/astronomical_scene_types';
import type { WebGLPlaneItem, WebGLPointsItem } from '$lib/renderers/webgl_scene_types';

/**
 * Depth testing is off and the meshes are added in draw-list order, with `sortObjects` off on the
 * renderer, so the picture composes back to front the way a 2D context does. Left to itself three
 * would reorder these, and "the background is in front of the planet" is a difficult bug to read.
 */
function planeMesh(item: WebGLPlaneItem): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(item.widthPx, item.heightPx);
  const material = new THREE.ShaderMaterial({
    uniforms: item.uniforms,
    fragmentShader: item.fragmentShader,
    vertexShader: SimpleVertexShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: item.blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(item.centerX, item.centerY, 0);
  return mesh;
}

function pointsMesh(item: WebGLPointsItem): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(item.positions, 3));
  geometry.setAttribute('star_radius', new THREE.BufferAttribute(item.radii, 1));
  geometry.setAttribute('star_alpha', new THREE.BufferAttribute(item.alphas, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { star_color: { value: item.color } },
    fragmentShader: SceneStarsFragmentShader,
    vertexShader: SceneStarsVertexShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

/**
 * Draws a scene onto a throwaway canvas and returns it as a PNG data URL.
 *
 * A scene with no bodies renders as an empty string rather than an empty sky, matching the
 * Canvas2D backend: callers treat that as "nothing to show".
 *
 * At `reduced` quality the framebuffer is half size while the camera keeps the scene's own pixel
 * bounds, so every shader draws exactly what it would have drawn, over a quarter of the fragments.
 * The result is scaled back up to the size that was asked for. Antialiasing goes with the tier: a
 * machine that cannot afford the fragments cannot afford to multisample them either.
 *
 * `onContextLost` fires if the GPU takes the context back. The listener outlives this call by
 * design — a context can be lost after the frame is submitted — and the caller uses it to stop
 * choosing WebGL for the rest of the session.
 */
export function renderSceneToDataUrl(
  document: Document,
  scene: AstronomicalScene,
  onContextLost?: () => void,
): string {
  if (scene.bodies.length === 0) return '';

  const raster = rasterSizeForQuality(scene.quality, scene.width, scene.height);
  const canvas = document.createElement('canvas');
  canvas.width = raster.width;
  canvas.height = raster.height;
  if (onContextLost !== undefined) {
    canvas.addEventListener('webglcontextlost', () => onContextLost());
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: scene.quality === 'full',
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(raster.width, raster.height, false);
  renderer.sortObjects = false;

  const glScene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, scene.width, scene.height, 0, 0.1, 1000);
  camera.position.set(0, 0, 10);

  const meshes = buildWebGLDrawList(scene).map((item) =>
    item.kind === 'plane' ? planeMesh(item) : pointsMesh(item),
  );
  for (const mesh of meshes) glScene.add(mesh);

  renderer.render(glScene, camera);
  const data = canvasToDataUrlAtSize(document, renderer.domElement, scene.width, scene.height);

  for (const mesh of meshes) {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
  renderer.dispose();
  canvas.remove();

  return data;
}

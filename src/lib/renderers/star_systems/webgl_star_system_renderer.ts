import * as THREE from 'three';
import * as PlanetShaders from '$lib/shaders/planets/planets';
import StarShader from '$lib/shaders/stars/star.frag';
import SimpleVertexShader from '$lib/shaders/simple.vert';
import { RNG } from '@ironarachne/rng';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
import type { StarSystem } from '$lib/astronomical_bodies/star_system/star_systems';
import type RGBColor from '$lib/graphics/rgb_color';

export function render(
  document: Document,
  system: StarSystem,
  width: number,
  height: number,
  seed: string,
): string {
  const rng = new RNG(seed);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  // Orthographic camera mapping (0,0) to screen bottom-left or center?
  // Let's map (0 to width) horizontally and (0 to height) vertically.
  // We place camera at z=1 looking at z=0.
  const camera = new THREE.OrthographicCamera(0, width, height, 0, 0.1, 1000);
  camera.position.set(0, 0, 10);

  if (canvas === null) {
    throw new Error('Canvas not found');
  }

  const bodies = [...system.stars, ...system.planets];
  const totalUnits = system.stars.length * 4 + system.planets.length;
  if (totalUnits === 0) return '';
  const baseUnitWidth = width / totalUnits;

  let maxStarRadius = 0;
  let maxPlanetRadius = 0;
  for (const body of system.stars) maxStarRadius = Math.max(maxStarRadius, body.radius);
  for (const body of system.planets) maxPlanetRadius = Math.max(maxPlanetRadius, body.radius);

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
      render_background: { value: 1.0 }
  };
  const bgGeo = new THREE.PlaneGeometry(width, height);
  const bgMat = new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      fragmentShader: StarShader,
      vertexShader: SimpleVertexShader,
      depthWrite: false
  });
  const bgPlane = new THREE.Mesh(bgGeo, bgMat);
  bgPlane.position.set(width / 2, height / 2, -100);
  scene.add(bgPlane);
  geometries.push(bgGeo);
  materials.push(bgMat);

  let currentX = 0;

  for (let i = 0; i < system.stars.length; i++) {
    const star = system.stars[i];

    const relativeScale = maxStarRadius > 0 ? Math.pow(star.radius / maxStarRadius, 0.5) : 1;
    // Scale down if height is small, make stars prominent at ~60% of vertical height
    const statCellWidth = baseUnitWidth * 4;
    currentX += statCellWidth / 2;
    const bodySizePixels = Math.min(height, statCellWidth * 0.75) * 0.75 * relativeScale;

    const color_set = getColorSetFromTemperature(star.surface_temperature);
    const planeSize = bodySizePixels * 4.0;

    const uniforms = {
      seed: { value: rng.float(0, 100.0) },
      render_background: { value: 0.0 },
      resolution: { value: new THREE.Vector2(planeSize, planeSize) },
      corona_width: { value: Math.max((bodySizePixels / 2.0) * 0.2, 4.0) },
      glow_color: { value: translateColorToVec3(color_set[2]) },
      corona_color: { value: translateColorToVec3(color_set[1]) },
      star_color: { value: translateColorToVec3(color_set[0]) },
      star_radius: { value: bodySizePixels / 2.0 },
    };

    const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: StarShader,
      vertexShader: SimpleVertexShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    geometries.push(geometry);
    materials.push(material);

    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(currentX, height / 2, 0);
    scene.add(plane);

    currentX += statCellWidth / 2;
  }

  for (let i = 0; i < system.planets.length; i++) {
    const planet = system.planets[i];

    const relativeScale = maxPlanetRadius > 0 ? Math.pow(planet.radius / maxPlanetRadius, 0.5) : 1;
    // Planets max out at 25% of grid to stay distinctly smaller than the star
    const planetCellWidth = baseUnitWidth;
    currentX += planetCellWidth / 2;
    const bodySizePixels = Math.min(height, planetCellWidth) * 0.25 * relativeScale;

    const planetShader = PlanetShaders.getFragmentShaderByName(planet.classification);
    const colors = getRandomGasGiantColorSet(rng.randomString(13));

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
      ring_color: { value: new THREE.Vector3(rng.float(0.6, 0.9), rng.float(0.6, 0.9), rng.float(0.6, 0.9)) },
    };

    const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: planetShader,
      vertexShader: SimpleVertexShader,
      transparent: true
    });

    geometries.push(geometry);
    materials.push(material);

    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(currentX, height / 2, 0);
    scene.add(plane);

    currentX += planetCellWidth / 2;
  }

  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL('image/png');

  for (const mat of materials) mat.dispose();
  for (const geo of geometries) geo.dispose();
  renderer.dispose();
  canvas.remove();

  return data;
}

function getColorSetFromTemperature(temperature: number): RGBColor[] {
  if (temperature < 3700) return [{ r: 1.0, g: 0.0, b: 0.0 }, { r: 0.5, g: 0.0, b: 0.0 }, { r: 1.0, g: 0.0, b: 0.0 }];
  if (temperature < 5200) return [{ r: 1.0, g: 0.39, b: 0.0 }, { r: 0.7, g: 0.13, b: 0.0 }, { r: 1.0, g: 1.0, b: 0.0 }];
  if (temperature < 6000) return [{ r: 1.0, g: 1.0, b: 0.0 }, { r: 0.55, g: 0.35, b: 0.0 }, { r: 1.0, g: 1.0, b: 0.5 }];
  if (temperature < 7500) return [{ r: 1.0, g: 1.0, b: 0.9 }, { r: 0.95, g: 0.95, b: 0.7 }, { r: 1.0, g: 1.0, b: 1.0 }];
  if (temperature < 10000) return [{ r: 1.0, g: 1.0, b: 1.0 }, { r: 0.95, g: 0.95, b: 0.95 }, { r: 1.0, g: 1.0, b: 1.0 }];
  if (temperature < 30000) return [{ r: 0.85, g: 0.9, b: 1.0 }, { r: 0.7, g: 0.75, b: 0.95 }, { r: 1.0, g: 1.0, b: 1.0 }];
  return [{ r: 0.0, g: 0.0, b: 1.0 }, { r: 0.0, g: 0.0, b: 0.75 }, { r: 0.0, g: 0.2, b: 1.0 }];
}

function translateColorToVec3(color: RGBColor): THREE.Vector3 { return new THREE.Vector3(color.r, color.g, color.b); }
function getRandomGasGiantColorSet(seed: string): [THREE.Vector3, THREE.Vector3, THREE.Vector3] {
  const rng = new RNG(seed);
  return [
    new THREE.Vector3(rng.float(0.1, 0.8), rng.float(0.1, 0.8), rng.float(0.1, 0.8)),
    new THREE.Vector3(rng.float(0.1, 0.8), rng.float(0.1, 0.8), rng.float(0.1, 0.8)),
    new THREE.Vector3(rng.float(0.1, 0.8), rng.float(0.1, 0.8), rng.float(0.1, 0.8)),
  ];
}

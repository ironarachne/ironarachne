import type Planet from "$lib/planets/planet";
import * as StarfieldShader from "$lib/renderers/starfields/starfield-webgl";
import * as PlanetShaders from "$lib/shaders/planets/planets";
import random from "random";
import * as THREE from "three";

export function render(planet: Planet, width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  let materials = [];
  let geometries = [];
  let meshes = [];

  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
  camera.position.set(0, 10, 20);
  if (canvas === null) {
    throw new Error("Canvas not found");
  }
  let renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(width, height);

  let starfieldGeometry = new THREE.PlaneGeometry(50, 50, 50);
  geometries.push(starfieldGeometry);
  let starfieldMaterial = new THREE.ShaderMaterial({
    fragmentShader: StarfieldShader.generate(),
  });
  materials.push(starfieldMaterial);
  let plane = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
  meshes.push(plane);
  scene.add(plane);

  let planetShaders = PlanetShaders.getSetByName(planet.classification.name);

  let fragmentShader = planetShaders.fragment;
  let vertexShader = planetShaders.vertex;

  let uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib["lights"]]);

  uniforms.u_resolution = { value: { x: width, y: height } };
  uniforms.seed = { value: random.float(0, 200.0) };

  let planetSize = translateDiameterToModelSize(planet.diameter);

  let planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
  geometries.push(planetGeometry);

  let planetMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader,
    vertexShader: vertexShader,
    lights: true,
  });
  materials.push(planetMaterial);

  let light = new THREE.HemisphereLight(0xf6e86d, 0x404040, 0.5);
  scene.add(light);

  let planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
  planetMesh.position.set(0, 10, 0);
  meshes.push(planetMesh);

  scene.add(planetMesh);

  if (planet.has_clouds) {
    let cloudsShader = planetShaders.cloud;
    let planetCloudGeometry = new THREE.SphereGeometry(planetSize + 0.1, 32, 32);
    geometries.push(planetCloudGeometry);
    uniforms.numOctaves = { value: 16 };
    let cloudsMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: cloudsShader,
      vertexShader: vertexShader,
      transparent: true,
    });
    materials.push(cloudsMaterial);
    let clouds = new THREE.Mesh(planetCloudGeometry, cloudsMaterial);
    clouds.position.set(0, 10, 0);
    meshes.push(clouds);

    scene.add(clouds);
  }

  renderer.render(scene, camera);
  let data = renderer.domElement.toDataURL("image/png");

  for (let i = 0; i < materials.length; i++) {
    materials[i].dispose();
  }
  for (let i = 0; i < geometries.length; i++) {
    geometries[i].dispose();
  }
  materials = [];
  meshes = [];
  geometries = [];
  renderer.dispose();

  return data;
}

function translateDiameterToModelSize(diameter: number): number {
  let size = Math.floor(diameter / 2000) + 1;

  if (diameter > 19000) {
    size = 10;
  }

  return size;
}

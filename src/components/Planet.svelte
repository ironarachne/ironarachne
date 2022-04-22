<script>
  import * as RND from '../modules/random';
  import * as Classifications from '../modules/planets/classifications';
  import * as PlanetRenderer from '../modules/renderers/planets/planet-webgl';
  import * as THREE from 'three';
  import * as StarfieldShader from '../modules/renderers/starfields/starfield-webgl';

  import random from 'random';
  import seedrandom from 'seedrandom';

  import { onMount } from 'svelte';
  import PlanetGeneratorConfig from '../modules/planets/generatorconfig';
  import PlanetGenerator from '../modules/planets/generator';

  let materials = [];
  let meshes = [];
  let geometries = [];
  let planetTypes = Classifications.getClassificationNames();

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let planetType = 'random';
  let planetGenConfig = new PlanetGeneratorConfig();
  let planetGen = new PlanetGenerator(planetGenConfig);
  let planet = planetGen.generate();
  let initialized = false;
  let scene = new THREE.Scene();
  let camera = {};
  let canvas = {};
  let renderer = {};

  function clean() {
    for (let i = 0; i < materials; i++) {
      materials[i].dispose();
    }
    for (let i = 0; i < meshes; i++) {
      meshes[i].dispose();
    }
    for (let i = 0; i < geometries; i++) {
      geometries[i].dispose();
    }
    materials = [];
    meshes = [];
    geometries = [];
    renderer.dispose();
    initialized = false;
  }

  function generate() {
    if (initialized) {
      // If we already have a scene, destroy it and free up its resources
      clean();
    }

    random.use(seedrandom(seed));

    if (planetType == 'random') {
      planetGen.config.possibleClassifications = Classifications.all();
    } else {
      planetGen.config.possibleClassifications = [
        Classifications.getClassificationByName(planetType),
      ];
    }

    planet = planetGen.generate();

    let shaderData = PlanetRenderer.getShaderData(planet.classification.name);
    planet.fragmentShader = shaderData.generateFragmentShader();
    planet.vertexShader = shaderData.generateVertexShader();
    planet.cloudShader = shaderData.generateCloudShader();

    render();
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  function render() {
    if (planetType == '') {
      planetType = 'random';
    }
    canvas = document.getElementById('render');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, 600 / 400, 0.1, 100);
    camera.position.set(0, 10, 20);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(600, 400);

    let starfieldGeometry = new THREE.PlaneGeometry(50, 50, 50);
    geometries.push(starfieldGeometry);
    let starfieldMaterial = new THREE.ShaderMaterial({
      fragmentShader: StarfieldShader.generate(),
    });
    materials.push(starfieldMaterial);
    let plane = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
    meshes.push(plane);
    scene.add(plane);

    let fragmentShader = planet.fragmentShader;
    let vertexShader = planet.vertexShader;

    let uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['lights']]);

    uniforms.u_resolution = { value: { x: 600, y: 400 } };
    uniforms.seed = { value: random.float(0, 200.0) };

    let planetSize = PlanetRenderer.translateDiameterToModelSize(planet.diameter);

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
      let cloudsShader = planet.cloudShader;
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

    initialized = true;
    animate();
  }

  onMount(() => {
    newSeed();
  });
</script>

<svelte:head>
  <title>Planet Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h2>Planet Generator</h2>

  <p>This lets you generate a planet. It uses WebGL and your graphics card.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>

  <div class="input-group">
    <label for="planetType">Planet Type</label>
    <select bind:value={planetType} id="planetType">
      <option>random</option>
      {#each planetTypes as pType}
        <option>{pType}</option>
      {/each}
    </select>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h3>{planet.name}</h3>

  <canvas id="render" />

  <p>{planet.description}</p>

  <p><strong>Planet Type:</strong> {planet.classification.name}</p>
  <p><strong>Population:</strong> {planet.population}</p>
  <p><strong>Government:</strong> {planet.government}</p>
  <p><strong>Culture:</strong> {planet.culture}</p>
  <p>
    <strong>Distance from Star:</strong>
    {new Intl.NumberFormat().format(planet.distance_from_sun)} AU
  </p>
  <p>
    <strong>Mass:</strong>
    {new Intl.NumberFormat().format(planet.mass)} &times; 10<sup>24</sup> kg ({new Intl.NumberFormat().format(
      Math.floor((planet.mass / 5.9722) * 100),
    )}% Earth's mass)
  </p>
  <p>
    <strong>Diameter:</strong>
    {new Intl.NumberFormat().format(Math.floor(planet.diameter))} km ({new Intl.NumberFormat().format(
      Math.floor((planet.diameter / 12756) * 100),
    )}% Earth's diameter)
  </p>
  <p>
    <strong>Gravity:</strong>
    {new Intl.NumberFormat().format(planet.gravity)} m/s<sup>2</sup>
    ({new Intl.NumberFormat().format(Math.floor((planet.gravity / 9.81) * 100))}% Earth's gravity)
  </p>
  <p>
    <strong>Orbital Period:</strong>
    {new Intl.NumberFormat().format(Math.floor(planet.orbital_period))} days
  </p>
</section>

<style>
  canvas {
    display: block;
    width: 600px;
    height: 400px;
    margin: 1rem auto;
  }
</style>

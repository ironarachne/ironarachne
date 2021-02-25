<template>
  <section class="main scifi">
    <h2>Planet Generator</h2>

    <p>This lets you generate a planet. It uses WebGL and your graphics card.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>

    <div class="input-group">
      <label for="planetType">Planet Type</label>
      <select v-model="planetType">
        <option>random</option>
        <option v-for="pType in planetTypes" :key="pType">{{ pType }}</option>
      </select>
    </div>

    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>{{ planetName }}</h3>

    <canvas id="render"></canvas>

    <p>{{ description }}</p>

    <p><strong>Population:</strong> {{ population }}</p>
    <p><strong>Government:</strong> {{ government }}</p>
    <p><strong>Culture:</strong> {{ culture }}</p>
    <p><strong>Habitations:</strong> {{ habitations }}</p>
  </section>
</template>

<script>
  import * as iarnd from "../modules/random.js";
  import * as PlanetMap from "../modules/maps/planet.js";
  import * as THREE from "three";
  import * as StarfieldShader from "../modules/shaders/starfield.glsl.js";

  const random = require("random");
  const seedrandom = require("seedrandom");

  export default {
    name: "PlanetGenerator",
    data: function () {
      return {
        planetName: "",
        description: "",
        seed: "",
        renderer: {},
        scene: {},
        initialized: false,
        materials: [],
        meshes: [],
        geometries: [],
        planetType: "random",
        planetTypes: [],
        population: "",
        government: "",
        culture: "",
        habitations: "",
      };
    },
    methods: {
      clean: function () {
        for (let i=0;i<this.materials;i++) {
          this.materials[i].dispose();
        }
        for (let i=0;i<this.meshes;i++) {
          this.meshes[i].dispose();
        }
        for (let i=0;i<this.geometries;i++) {
          this.geometries[i].dispose();
        }
        this.materials = [];
        this.meshes = [];
        this.geometries = [];
        this.renderer.dispose();
        this.initialized = false;
      },
      generate: function () {
        if (this.initialized) {
          // If we already have a scene, destroy it and free up its resources
          this.clean();
        }

        random.use(seedrandom(this.seed));

        let planetMap = PlanetMap.generate(this.planetType);
        this.planetName = planetMap.name;
        this.description = planetMap.description;
        this.population = planetMap.population;
        this.government = planetMap.government;
        this.culture = planetMap.culture;
        this.habitations = planetMap.habitations;

        this.render(planetMap);
      },
      animate: function () {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
      },
      newSeed: function () {
        this.seed = iarnd.randomString(13);
        this.generate();
      },
      render: function (planetMap) {
        if (this.planetType == "") {
          this.planetType = "random";
        }
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, 600/400, 0.1, 100);
        this.camera.position.set(0, 10, 20);
        let canvas = document.getElementById("render");
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(600, 400);

        let starfieldGeometry = new THREE.PlaneGeometry(50, 50, 50);
        this.geometries.push(starfieldGeometry);
        let starfieldMaterial = new THREE.ShaderMaterial({ fragmentShader: StarfieldShader.generate() });
        this.materials.push(starfieldMaterial);
        let plane = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
        this.meshes.push(plane);
        this.scene.add(plane);

        let fragmentShader = planetMap.baseFragmentShader;
        let vertexShader = planetMap.vertexShader;

        let uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib[ "lights" ],
        ]);

        uniforms.u_resolution = { value: { x: 600, y: 400 } };

        let planetSize = planetMap.size.size;

        let planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
        this.geometries.push(planetGeometry);

        let planetMaterial = new THREE.ShaderMaterial({ uniforms:uniforms, fragmentShader: fragmentShader, vertexShader: vertexShader, lights: true });
        this.materials.push(planetMaterial);

        let planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.set(0, 10, 0);
        this.meshes.push(planet);

        this.scene.add(planet);

        if (planetMap.hasCloudLayer) {
          let cloudsShader = planetMap.cloudShader;
          let planetCloudGeometry = new THREE.SphereGeometry(planetSize + 0.1, 32, 32);
          this.geometries.push(planetCloudGeometry);
          let cloudsMaterial = new THREE.ShaderMaterial({ uniforms:uniforms, fragmentShader: cloudsShader, vertexShader: vertexShader, transparent: true});
          this.materials.push(cloudsMaterial);
          let clouds = new THREE.Mesh(planetCloudGeometry, cloudsMaterial);
          clouds.position.set(0, 10, 0);
          this.meshes.push(clouds);

          this.scene.add(clouds);
        }

        this.initialized = true;
        this.animate();
      }
    },
    created: function () {
      this.planetTypes = PlanetMap.listPlanetTypes();
    },
    mounted: function () {
      this.newSeed();
    },
  }
</script>

<style>
canvas {
  display: block;
  width: 600px;
  height: 400px;
  margin: 1rem auto;
}
</style>

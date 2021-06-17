<template>
  <section class="main scifi">
    <h2>Planet Generator</h2>

    <p>This lets you generate a planet. It uses WebGL and your graphics card.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" id="seed"/>
    </div>

    <div class="input-group">
      <label for="planetType">Planet Type</label>
      <select v-model="planetType" id="planetType">
        <option>random</option>
        <option v-for="pType in planetTypes" :key="pType">{{ pType }}</option>
      </select>
    </div>

    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>{{ planet.name }}</h3>

    <canvas id="render"></canvas>

    <p>{{ planet.description }}</p>

    <p><strong>Planet Type:</strong> {{ planet.classification }}</p>
    <p><strong>Population:</strong> {{ planet.population }}</p>
    <p><strong>Government:</strong> {{ planet.government }}</p>
    <p><strong>Culture:</strong> {{ planet.culture }}</p>
    <p><strong>Distance from Star:</strong> {{ new Intl.NumberFormat().format(planet.distance_from_sun) }} AU</p>
    <p><strong>Mass:</strong> {{ new Intl.NumberFormat().format(planet.mass) }} &times; 10<sup>24</sup> kg</p>
    <p><strong>Diameter:</strong> {{ new Intl.NumberFormat().format(Math.floor(planet.diameter)) }} km</p>
    <p><strong>Gravity:</strong> {{ new Intl.NumberFormat().format(planet.gravity) }} m/s<sup>2</sup></p>
    <p><strong>Orbital Period:</strong> {{ new Intl.NumberFormat().format(Math.floor(planet.orbital_period)) }} days</p>
  </section>
</template>

<script>
import * as RND from "../modules/random.js";
import * as Planet from "../modules/planets/planet.js";
import * as PlanetRenderer from "../modules/renderers/planets/planet-webgl.js";
import * as THREE from "three";
import * as StarfieldShader from "../modules/renderers/starfields/starfield-webgl.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "PlanetGenerator",
  data: function () {
    return {
      planet: {},
      seed: "",
      renderer: {},
      scene: {},
      initialized: false,
      materials: [],
      meshes: [],
      geometries: [],
      planetType: "random",
      planetTypes: [],
    };
  },
  methods: {
    clean: function () {
      for (let i = 0; i < this.materials; i++) {
        this.materials[i].dispose();
      }
      for (let i = 0; i < this.meshes; i++) {
        this.meshes[i].dispose();
      }
      for (let i = 0; i < this.geometries; i++) {
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

      let planet = Planet.generate(this.planetType);

      let shaderData = PlanetRenderer.getShaderData(planet.classification);
      planet.fragmentShader = shaderData.generateFragmentShader();
      planet.vertexShader = shaderData.generateVertexShader();
      planet.cloudShader = shaderData.generateCloudShader();

      this.planet = planet;

      this.render();
    },
    animate: function () {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generate();
    },
    render: function () {
      if (this.planetType == "") {
        this.planetType = "random";
      }
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(65, 600 / 400, 0.1, 100);
      this.camera.position.set(0, 10, 20);
      let canvas = document.getElementById("render");
      this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
      this.renderer.setSize(600, 400);

      let starfieldGeometry = new THREE.PlaneGeometry(50, 50, 50);
      this.geometries.push(starfieldGeometry);
      let starfieldMaterial = new THREE.ShaderMaterial({fragmentShader: StarfieldShader.generate()});
      this.materials.push(starfieldMaterial);
      let plane = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
      this.meshes.push(plane);
      this.scene.add(plane);

      let fragmentShader = this.planet.fragmentShader;
      let vertexShader = this.planet.vertexShader;

      let uniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
      ]);

      uniforms.u_resolution = {value: {x: 600, y: 400}};

      let planetSize = PlanetRenderer.translateDiameterToModelSize(this.planet.diameter);

      let planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
      this.geometries.push(planetGeometry);

      let planetMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        lights: true
      });
      this.materials.push(planetMaterial);

      let planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.position.set(0, 10, 0);
      this.meshes.push(planet);

      this.scene.add(planet);

      if (this.planet.has_clouds) {
        let cloudsShader = this.planet.cloudShader;
        let planetCloudGeometry = new THREE.SphereGeometry(planetSize + 0.1, 32, 32);
        this.geometries.push(planetCloudGeometry);
        let cloudsMaterial = new THREE.ShaderMaterial({
          uniforms: uniforms,
          fragmentShader: cloudsShader,
          vertexShader: vertexShader,
          transparent: true
        });
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
    this.planetTypes = Planet.listPlanetTypes();
  },
  mounted: function () {
    this.newSeed();
  },
};
</script>

<style>
canvas {
  display: block;
  width: 600px;
  height: 400px;
  margin: 1rem auto;
}
</style>

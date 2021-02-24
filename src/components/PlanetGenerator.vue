<template>
  <section class="main">
    <h2>Planet Generator</h2>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>

    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <p>{{ description }}</p>

    <canvas id="render"></canvas>
  </section>
</template>

<script>
  import * as iarnd from "../modules/random.js";
  import * as PlanetMap from "../modules/maps/planet.js";
  import * as THREE from "three";
  import StarfieldShader from "../modules/shaders/starfield.glsl.js";

  const random = require("random");
  const seedrandom = require("seedrandom");

  export default {
    name: "PlanetGenerator",
    data: function () {
      return {
        description: "",
        seed: "",
        renderer: {},
        scene: {},
      };
    },
    methods: {
      generate: function () {
        random.use(seedrandom(this.seed));

        if (Object.entries(this.renderer).length != 0) {
          // If we already have a scene, destroy it and free up its resources
          this.renderer.dispose();
        }

        let planetMap = PlanetMap.generate();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 65, 800/600, 0.1, 100 );
        this.camera.position.set(0, 10, 20);
        let canvas = document.getElementById("render");
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(800, 600);

        this.description = '';

        let starfieldGeometry = new THREE.PlaneGeometry(50, 50, 50);
        let starfieldMaterial = new THREE.ShaderMaterial({fragmentShader: StarfieldShader});
        let plane = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
        this.scene.add(plane);

        let fragmentShader = planetMap.baseFragmentShader;
        let vertexShader = planetMap.vertexShader;

        let uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib[ "lights" ],
        ]);

        uniforms.u_resolution = { value: { x: 800, y: 600 } };

        let planetGeometry = new THREE.SphereGeometry(8, 32, 32);

        let planetMaterial = new THREE.ShaderMaterial({ uniforms:uniforms, fragmentShader: fragmentShader, vertexShader: vertexShader, lights: true });

        let planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.set(0, 10, 0);

        this.scene.add(planet);

        /* TODO: finish atmosphere
        let atmosphereShader = planetMap.atmosphereShader;
        let planetAtmosphereGeometry = new THREE.SphereGeometry(8.1, 32, 32);
        let atmosphereMaterial = new THREE.ShaderMaterial({ uniforms:uniforms, fragmentShader: atmosphereShader, transparent: true});
        let atmosphere = new THREE.Mesh(planetAtmosphereGeometry, atmosphereMaterial);
        atmosphere.position.set(0, 10, 0);

        this.scene.add(atmosphere);*/

        this.animate();
      },
      animate: function () {
        requestAnimationFrame( this.animate );
        this.renderer.render( this.scene, this.camera );
      },
      newSeed: function () {
        this.seed = iarnd.randomString(13);
        this.generate();
      },
    },
    mounted: function () {
      this.newSeed();
    },
  }
</script>

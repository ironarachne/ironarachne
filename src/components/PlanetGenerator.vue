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

  const random = require("random");
  const seedrandom = require("seedrandom");

  export default {
    name: "PlanetGenerator",
    data: function () {
      return {
        description: "",
        seed: "",
        renderer: {},
      };
    },
    methods: {
      generate: function () {
        random.use(seedrandom(this.seed));

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 65, 800/600, 0.1, 100 );
        this.camera.position.set(0, 10, 20);
        let canvas = document.getElementById("render");
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(800, 600);

        this.description = '';

        let fragmentShader = PlanetMap.generateFragmentShader();
        let vertexShader = PlanetMap.generateVertexShader();

        let spotLightColor = 0xFFFFFF;
        let intensity = 1;
        let spotLight = new THREE.DirectionalLight(spotLightColor, intensity);
        spotLight.position.set(0, 10, 0);
        spotLight.target.position.set(-5, 0, 0);
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);

        let uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib[ "lights" ],
        ]);

        uniforms.u_resolution = { value: { x: 800, y: 600 } };

        let geometry = new THREE.SphereGeometry(8, 32, 32);
        let material = new THREE.ShaderMaterial({ uniforms:uniforms, fragmentShader: fragmentShader, vertexShader: vertexShader, lights: true });
        this.planet = new THREE.Mesh( geometry, material );
        this.planet.position.set(0, 10, 0);
        this.scene.add(this.planet);

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

<template>
  <section class="main scifi">
    <h2>Star System Generator</h2>
    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateStarSystem">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>The {{ name }} System</h3>

    <p>{{ description }}</p>

    <h4>Stars</h4>

    <article
      v-for="star in stars"
      :key="star.name"
      class="media-banner"
    >
      <div class="image-container" v-html="star.svg"></div>
      <div>
        <h5>{{ star.name }}</h5>
        <p>{{ star.description }}</p>
      </div>
    </article>

    <h4>Planets</h4>

    <article
      v-for="planet in planets"
      :key="planet.name"
      class="media-banner"
    >
      <div class="image-container" v-html="planet.svg"></div>
      <div>
        <h5>{{ planet.name }}</h5>
        <p>{{ planet.description }}</p>
        <p><strong>Planet Type:</strong> {{ planet.classification }}</p>
        <p><strong>Population:</strong> {{ planet.population }}</p>
        <p><strong>Culture:</strong> {{ planet.culture }}</p>
        <p><strong>Government:</strong> {{ planet.government }}</p>
        <p><strong>Distance from Star:</strong> {{ new Intl.NumberFormat().format(planet.distance_from_sun) }} AU</p>
        <p><strong>Mass:</strong> {{ new Intl.NumberFormat().format(planet.mass) }} &times; 10<sup>24</sup> kg</p>
        <p><strong>Diameter:</strong> {{ new Intl.NumberFormat().format(Math.floor(planet.diameter)) }} km</p>
        <p><strong>Gravity:</strong> {{ new Intl.NumberFormat().format(planet.gravity) }} m/s<sup>2</sup></p>
        <p><strong>Orbital Period:</strong> {{ new Intl.NumberFormat().format(Math.floor(planet.orbital_period)) }} days</p>
      </div>
    </article>
  </section>
</template>

<script>
import * as StarSystem from "../modules/starsystem/starsystem.js";
import * as iarnd from "../modules/random.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "StarSystemGenerator",
  data: function () {
    return {
      name: "",
      description: "",
      stars: [],
      planets: [],
      seed: "",
    };
  },
  methods: {
    generateStarSystem: function () {
      random.use(seedrandom(this.seed));
      let starSystem = StarSystem.generate();

      this.name = starSystem.name;
      this.description = starSystem.description;
      this.planets = starSystem.planets;
      this.stars = starSystem.stars;
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generateStarSystem();
    },
  },
  created: function () {
    this.newSeed();
  },
};
</script>

<style>
article.media-banner {
  display: grid;
  grid-template-columns: 128px auto;
  column-gap: 1rem;
}
</style>

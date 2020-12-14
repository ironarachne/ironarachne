<template>
  <section class="starsystem main">
    <h2>Star System Generator</h2>
    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateStarSystem">Generate</button>
    <button v-on:click="newSeed">New Seed</button>

    <h3>The {{ name }} System</h3>

    <p>{{ description }}</p>

    <h4>Stars</h4>

    <article
      v-for="(star, starIndex) in stars"
      :key="starIndex"
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
      v-for="(planet, planetIndex) in planets"
      :key="planetIndex"
      class="media-banner"
    >
      <div class="image-container" v-html="planet.svg"></div>
      <div>
        <h5>{{ planet.name }}</h5>
        <p>{{ planet.description }}</p>
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

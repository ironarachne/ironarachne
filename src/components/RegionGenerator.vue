<template>
  <section class="fantasy main">
    <h2>Region Generator</h2>

    <p>Generate fantasy regions.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" id="seed"/>
    </div>
    <button v-on:click="generateRegion">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <p>{{ description }}</p>
    <h3>Notable Towns</h3>
    <article v-for="town in towns" :key="town.name">
      <h4>{{ town.name }}</h4>
      <p>{{ town.description }}</p>
    </article>
    <h3>Notable Organizations</h3>
    <article v-for="organization in organizations" :key="organization.name">
      <h4>{{ organization.name }}</h4>
      <p>{{ organization.description }}</p>
    </article>
  </section>
</template>

<script>
import * as RND from "../modules/random";
import * as Region from "../modules/region";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "RegionGenerator",
  data: function () {
    return {
      description: "",
      towns: [],
      organizations: [],
      seed: "",
    };
  },
  methods: {
    generateRegion: function () {
      random.use(seedrandom(this.seed));

      let region = Region.generate();

      this.description = region.description;
      this.organizations = region.organizations;
      this.towns = region.towns;
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generateRegion();
    },
  },
  created: function () {
    this.newSeed();
  },
};
</script>

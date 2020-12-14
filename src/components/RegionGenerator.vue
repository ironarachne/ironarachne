<template>
  <section class="region main">
    <h2>Region Generator</h2>
    <p>Generate fantasy regions.</p>
    <button v-on:click="generateRegion">Generate</button>
    <p>{{ description }}</p>
    <h3>Notable Towns</h3>
    <article v-for="(item, index) in towns" :key="index">
      <h4>{{ item.name }}</h4>
      <p>{{ item.description }}</p>
    </article>
    <h3>Notable Organizations</h3>
    <article v-for="(item, index) in organizations" :key="index">
      <h4>{{ item.name }}</h4>
      <p>{{ item.description }}</p>
    </article>
  </section>
</template>

<script>
import * as Region from "../modules/region.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "RegionGenerator",
  data: function () {
    return {
      description: "",
      towns: [],
      organizations: [],
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
  },
  created: function () {
    this.generateRegion();
  },
};
</script>

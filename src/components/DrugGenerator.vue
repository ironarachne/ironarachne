<template>
  <section class="cyberpunk main">
    <h2>Drug Generator</h2>

    <p>I suppose you could also use this for any sci-fi setting, really.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed"/>
    </div>

    <button v-on:click="generateDrug">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <p>{{ description }}</p>

  </section>
</template>

<script>
import * as Drug from "../modules/drug.js";
import * as RND from "../modules/random.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "DrugGenerator",
  data: function () {
    return {
      description: "",
    };
  },
  methods: {
    generateDrug: function () {
      random.use(seedrandom(this.seed));
      this.description = Drug.generate();
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generateDrug();
    },
  },
  created: function () {
    this.newSeed();
  },
};
</script>

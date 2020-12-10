<template>
  <section class="chopshop main">
    <h2>Chop Shop Generator</h2>
    <p>This is a cyberpunk chop shop generator.</p>
    <button v-on:click="generateChopShop">Generate</button>
    <p>{{ description }}</p>
  </section>
</template>

<script>
import * as ChopShop from "../modules/chopshop.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "ChopShopGenerator",
  data: function () {
    return {
      description: "",
    };
  },
  methods: {
    generateChopShop: function () {
      random.use(seedrandom(this.seed));
      this.description = ChopShop.generate();
    },
  },
  created: function () {
    this.generateChopShop();
  },
};
</script>

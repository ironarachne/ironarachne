<template>
  <section class="fantasy main">
    <h2>Tavern Generator</h2>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed"/>
    </div>
    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>{{ tavern.name }}</h3>
    <p>{{ tavern.description }}</p>
    <div class="drink-menu">
      <h4>Drink Menu</h4>
      <ul>
        <li v-for="(item, index) in tavern.drinks" :key="index">{{ item }}</li>
      </ul>
    </div>
    <div class="food-menu">
      <h4>Food Menu</h4>
      <ul>
        <li v-for="(item, index) in tavern.food" :key="index">{{ item }}</li>
      </ul>
    </div>
  </section>
</template>

<script>
import * as RND from "../modules/random.js";
import * as Tavern from "../modules/tavern.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "TavernGenerator",
  data: function () {
    return {
      tavern: {},
    };
  },
  methods: {
    generate: function () {
      random.use(seedrandom(this.seed));
      this.tavern = Tavern.generate();
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generate();
    },
  },
  created: function () {
    this.newSeed();
  },
};
</script>

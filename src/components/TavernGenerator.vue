<template>
  <section class="tavern main">
    <h2>Tavern Generator</h2>
    <button v-on:click="generateTavern">Generate</button>
    <h3>{{ tavernName }}</h3>
    <p>{{ tavernDescription }}</p>
    <div class="image-container" v-html="tavernMap"></div>
    <div class="drink-menu">
      <h4>Drink Menu</h4>
      <ul>
        <li v-for="(item, index) in drinkItems" :key="index">{{ item }}</li>
      </ul>
    </div>
    <div class="food-menu">
      <h4>Food Menu</h4>
      <ul>
        <li v-for="(item, index) in foodItems" :key="index">{{ item }}</li>
      </ul>
    </div>
  </section>
</template>

<script>
import * as Tavern from "../modules/tavern.js";
const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "TavernGenerator",
  data: function () {
    return {
      tavernDescription: "",
      tavernMap: "",
      tavernName: "",
      foodItems: [],
      drinkItems: [],
    };
  },
  methods: {
    generateTavern: function () {
      random.use(seedrandom(this.seed));
      let tavern = Tavern.generate();

      this.tavernDescription = tavern.description;
      this.tavernMap = tavern.map;
      this.tavernName = tavern.name;
      this.foodItems = tavern.food;
      this.drinkItems = tavern.drinks;
    },
  },
  created: function () {
    this.generateTavern();
  },
};
</script>

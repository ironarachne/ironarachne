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
import * as TavernName from "../modules/names/taverns.js";
import * as TavernMap from "../modules/maps/tavern.js";
import * as Food from "../modules/cuisine/food.js";
import * as Drink from "../modules/cuisine/drink.js";
import * as iarnd from "../modules/random.js";
import * as Dice from "../modules/dice.js";
import * as Currency from "../modules/currency.js";
const random = require("random");

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
      this.generateName();
      this.generateDescription();
      this.generateFood();
      this.generateDrinks();
      this.generateMap();
    },
    generateDescription: function () {
      let description = iarnd.item([
        this.tavernName,
        "This tavern",
        "This establishment",
      ]);

      let quality = iarnd.item([
        "has seen better days",
        "looks newly painted",
        "is well kept",
        "has an air of wealth about it",
      ]);

      description += " " + quality + ". ";

      let patrons = iarnd.item([
        "It caters to a diverse crowd.",
        "Some of its patrons are less savory types.",
        "It has a welcoming atmosphere.",
        "The crowd is friendly and boisterous.",
        "The patrons all keep to themselves and talk quietly.",
        "There's a rough crowd here.",
      ]);

      description += patrons;

      this.tavernDescription = description;
    },
    generateName: function () {
      this.tavernName = TavernName.generate();
    },
    generateFood: function () {
      let food = [];

      let numberOfItems = random.int(2, 4);

      for (let i = 0; i < numberOfItems; i++) {
        let quality = Dice.roll("2d6");

        let dish = Food.generateDish();
        let cost = Currency.convertCopper(quality);

        let foodDescription = dish + " (cost: " + cost + ")";

        food.push(foodDescription);
      }

      this.foodItems = food;
    },
    generateDrinks: function () {
      let drinks = [];

      let numberOfItems = random.int(2, 4);

      for (let i = 0; i < numberOfItems; i++) {
        let drink = Drink.generateDrink();

        let quality = Dice.roll("2d4");
        let cost = Currency.convertCopper(quality);

        let drinkDescription = drink + " (cost: " + cost + ")";

        drinks.push(drinkDescription);
      }

      this.drinkItems = drinks;
    },
    generateMap: function () {
      let tavernMap = TavernMap.generate();
      this.tavernMap = tavernMap;
    },
  },
  created: function () {
    this.generateTavern();
  },
};
</script>

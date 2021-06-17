<template>
  <section class="fantasy main">
    <h2>Magic Weapon Generator</h2>

    <p>This generates a unique magical weapon.</p>

    <div class="input-group">
      <label for="theme">Theme</label>
      <select name="theme" v-model="theme">
        <option>any</option>
        <option v-for="item in themes" :key="item">{{ item }}</option>
      </select>
    </div>

    <div class="input-group">
      <label for="category">Category</label>
      <select name="category" v-model="category">
        <option>any</option>
        <option v-for="item in categories" :key="item">{{ item }}</option>
      </select>
    </div>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed"/>
    </div>
    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>{{ weapon.name }}</h3>

    <p>{{ weapon.description }}. It {{ weapon.effect }}.</p>
  </section>
</template>

<script>
import * as Domain from "../modules/religion/domain.js";
import * as Weapon from "../modules/equipment/weapon.js";
import * as RND from "../modules/random.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "MagicWeaponGenerator",
  data: function () {
    return {
      weapon: {},
      themes: [],
      categories: [],
      category: "any",
      theme: "any",
    };
  },
  methods: {
    generate: function () {
      random.use(seedrandom(this.seed));

      let weapon = Weapon.generate(this.category, this.theme);
      weapon.description = weapon.name + " is " + weapon.description;

      this.weapon = weapon;
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generate();
    },
  },
  created: function () {
    this.categories = Weapon.getAllWeaponCategories().sort();
    this.themes = Domain.getAllDomainNames().sort();
    this.newSeed();
  },
};
</script>

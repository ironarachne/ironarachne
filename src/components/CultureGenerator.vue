<template>
  <section class="fantasy main">
    <h2>Culture Generator</h2>
    <p>This generator lets you create fantasy cultures.</p>
    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" id="seed"/>
    </div>
    <button v-on:click="generateCulture">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>The {{ culture.name }} Culture</h3>

    <h4>Common Names</h4>

    <div class="namelist">
      <div>
        <h5>Male Names</h5>
        <ul>
          <li v-for="(name, index) in culture.maleNames" :key="index">{{ name }}</li>
        </ul>
      </div>
      <div>
        <h5>Female Names</h5>
        <ul>
          <li v-for="(name, index) in culture.femaleNames" :key="index">
            {{ name }}
          </li>
        </ul>
      </div>
      <div>
        <h5>Family Names</h5>
        <ul>
          <li v-for="(name, index) in culture.familyNames" :key="index">
            {{ name }}
          </li>
        </ul>
      </div>
    </div>

    <h4>Organization</h4>

    <p>{{ culture.organization.description }}</p>

    <h4>Religion</h4>

    <p>{{ culture.religion.description }}</p>

    <h4>Taboos</h4>

    <p v-for="(taboo, index) in culture.taboos" :key="index">{{ taboo }}</p>

    <h4>Greetings</h4>

    <p>{{ culture.greeting }}</p>

    <h4>Meals</h4>

    <p>{{ culture.eatingTrait }}</p>

    <h4>Design</h4>

    <p>{{ culture.designTrait }}</p>

    <h4>Music</h4>

    <p>{{ culture.musicStyle.description }}</p>
  </section>
</template>

<style>
.namelist {
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: start;
  justify-items: center;
}
</style>

<script>
import * as RND from "../modules/random.js";
import * as Culture from "../modules/culture/culture.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "CultureGenerator",
  data: function () {
    return {
      culture: {},
      seed: "",
    };
  },
  methods: {
    generateCulture: function () {
      random.use(seedrandom(this.seed));
      this.culture = Culture.generate();
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generateCulture();
    },
  },
  created: function () {
    this.newSeed();
  },
};
</script>

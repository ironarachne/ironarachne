<template>
  <section class="culture main">
    <h2>Culture Generator</h2>
    <p>This generator lets you create fantasy cultures.</p>
    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateCulture">Generate</button>
    <button v-on:click="newSeed">New Seed</button>

    <h3>The {{ name }} Culture</h3>

    <h4>Common Names</h4>

    <div class="namelist">
      <div>
        <h5>Male Names</h5>
        <ul>
          <li v-for="(name, index) in maleNames" :key="index">{{ name }}</li>
        </ul>
      </div>
      <div>
        <h5>Female Names</h5>
        <ul>
          <li v-for="(name, index) in femaleNames" :key="index">
            {{ name }}
          </li>
        </ul>
      </div>
      <div>
        <h5>Family Names</h5>
        <ul>
          <li v-for="(name, index) in familyNames" :key="index">
            {{ name }}
          </li>
        </ul>
      </div>
    </div>

    <h4>Religion</h4>
    <p>{{ religion }}</p>

    <h4>Taboos</h4>

    <p v-for="(taboo, index) in taboos" :key="index">{{ taboo }}</p>

    <h4>Greetings</h4>

    <p>{{ greeting }}</p>

    <h4>Meals</h4>

    <p>{{ eatingTrait }}</p>

    <h4>Design</h4>

    <p>{{ designTrait }}</p>
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
import * as iarnd from "../modules/random.js";
import * as Culture from "../modules/culture.js";
const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "CultureGenerator",
  data: function () {
    return {
      name: "",
      maleNames: [],
      femaleNames: [],
      familyNames: [],
      religion: "",
      taboos: [],
      greeting: "",
      eatingTrait: "",
      designTrait: "",
    };
  },
  methods: {
    generateCulture: function () {
      random.use(seedrandom(this.seed));
      let culture = Culture.generate();
      this.name = culture.name;
      this.maleNames = culture.maleNames;
      this.femaleNames = culture.femaleNames;
      this.familyNames = culture.familyNames;
      this.religion = culture.religion.description;
      this.taboos = culture.taboos;
      this.greeting = culture.greeting;
      this.eatingTrait = culture.eatingTrait;
      this.designTrait = culture.designTrait;
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generateCulture();
    },
  },
  created: function () {
    this.newSeed();
  },
};
</script>

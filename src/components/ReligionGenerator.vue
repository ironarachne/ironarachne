<template>
  <section class="fantasy main">
    <h2>Fantasy Religion Generator</h2>

    <p>Generate a fictional fantasy religion.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h2>{{ religion.name }}</h2>

    <p>{{ religion.description }}</p>

    <h3>Realms</h3>

    <div v-for="realm in religion.realms" :key="realm.name">
      <h4>{{ realm.name }}</h4>
      <p>{{ realm.description }}</p>
    </div>

    <h3>Deities</h3>

    <div v-for="deity in religion.pantheon.deities" :key="deity.name">
      <h4>{{ deity.name }}</h4>

      <p><strong>Holy Item:</strong> {{ deity.holyItem }}</p>
      <p><strong>Holy Symbol:</strong> {{ deity.holySymbol }}</p>

      <p>{{ deity.description }}</p>
    </div>
  </section>
</template>

<script>
import * as iarnd from "../modules/random.js";
import * as FantasyReligion from "../modules/religion/generator.js"

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "ReligionGenerator",
  data: function() {
    return {
      religion: {}
    }
  },
  methods: {
    generate: function() {
      random.use(seedrandom(this.seed))

      this.religion = FantasyReligion.generate()
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13)
      this.generate()
    },
  },
  created: function () {
    this.newSeed()
  },
}

</script>

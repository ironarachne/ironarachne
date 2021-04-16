<template>
  <section class="fantasy main">
    <h2>Magic Weapon Generator</h2>

    <p>This generates a unique magical weapon.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>{{ weapon.name }}</h3>

    <p>{{ weapon.description }}. It {{ weapon.effect.description }}.</p>
  </section>
</template>

<script>
import * as Weapon from "../modules/equipment/weapon.js"
import * as iarnd from "../modules/random.js"

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: 'MagicWeaponGenerator',
  data: function () {
    return {
      weapon: {},
    }
  },
  methods: {
    generate: function() {
      random.use(seedrandom(this.seed))

      let weaponTypes = Weapon.getAllWeaponCategories()
      let weaponType = iarnd.item(weaponTypes)

      let weapon = Weapon.generate(weaponType, 'any')
      weapon.description = weapon.name + ' is ' + weapon.description

      this.weapon = weapon
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generate();
    },
  },
  created: function () {
    this.newSeed();
  },
}
</script>

<template>
  <section class="organization main">
    <h2>Organization Generator</h2>

    <p>This generates fantasy organizations.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateFantasyOrganization">Generate</button>
    <button v-on:click="newSeed">New Seed</button>

    <h3>{{ name }}</h3>

    <div class="org-arms" v-html="heraldry.svg"></div>

    <p>{{ description }}</p>

    <p>{{ leadership }}</p>
  </section>
</template>

<script>
import * as Heraldry from "../modules/heraldry/heraldry.js";
import * as Organization from "../modules/organizations/organizations.js";
import * as iarnd from "../modules/random.js";
import axios from "axios";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "FantasyOrgGenerator",
  data: function () {
    return {
      name: "",
      description: "",
      leadership: "",
      charges: [],
      heraldry: {},
      seed: "",
    }
  },
  methods: {
    generateFantasyOrganization: function() {
      random.use(seedrandom(this.seed));
      let org = Organization.generate();

      this.name = org.name;
      this.description = org.description;
      this.leadership = org.leadership;
      this.heraldry = Heraldry.generate(this.charges, 200, 220);
    },
    loadCharges: function () {
      var self = this;
      let charges = Heraldry.getCharges();

      charges.forEach(function (charge) {
        axios
          .get("/images/heraldry/charges/" + charge.fileName)
          .then(function (response) {
            let chargeSVG = response.data;
            charge.svg = chargeSVG;
            self.charges.push(charge);
          });
      });
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generateFantasyOrganization();
    },
  },
  created: function () {
    this.loadCharges();
  },
}
</script>

<style>
div.org-arms {
  width: 200px;
  height: 220px;
  margin: 0 auto;
}
</style>

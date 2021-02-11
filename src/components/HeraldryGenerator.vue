<template>
  <section class="fantasy main">
    <h2>Heraldry Generator</h2>
    <p>
      Generate fantasy coats-of-arms. Note: if you change the seed, the page URL
      won't change, but your new seed will be used the next time you hit
      Generate.
    </p>
    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateHeraldry">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>
    <button v-on:click="saveHeraldry" :disabled="image == ''">Save</button>

    <p class="blazon">{{ blazon }}</p>
    <div class="coat-of-arms" v-html="image"></div>
  </section>
</template>

<script>
import * as Heraldry from "../modules/heraldry/heraldry.js";
import * as iarnd from "../modules/random.js";
import axios from "axios";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "HeraldryGenerator",
  data: function () {
    return {
      blazon: "",
      image: "",
      seed: this.$route.params.seed,
      charges: [],
    };
  },
  methods: {
    generateHeraldry: function () {
      random.use(seedrandom(this.seed));
      let h = Heraldry.generate(this.charges, 600, 660);
      this.blazon = h.blazon;
      this.image = h.svg;
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
      this.generateHeraldry();
    },
    saveHeraldry: function () {
      const blob = new Blob([this.image], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "heraldry.svg";
      link.click();
      URL.revokeObjectURL(link.href);
    },
  },
  created: function () {
    this.loadCharges();
  },
};
</script>

<style type="scss">
div.coat-of-arms {
  width: 600px;
  height: 660px;
  margin: 0 auto;
}

p.blazon {
  text-align: center;
}
</style>

<template>
  <section class="heraldry main">
    <h2>Heraldry Generator</h2>
    <p>This is the heraldry generator.</p>
    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateHeraldry">Generate</button>
  </section>
</template>

<script>
import * as iarnd from "../modules/random.js";

export default {
  name: "HeraldryScreen",
  data: function () {
    return {
      seed: "",
    };
  },
  methods: {
    generateHeraldry: function () {
      this.$router.push({
        name: "heraldry-generator",
        params: { seed: this.seed },
      });
    },
  },
  created: function () {
    this.seed = iarnd.randomString(13);
  },
};
</script>

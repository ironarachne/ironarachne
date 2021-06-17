<template>
  <section class="fantasy main">
    <h2>Heraldry Generator</h2>
    <p>Generate random coats-of-arms that loosely adhere to heraldic rules.</p>
    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" id="seed"/>
    </div>
    <button v-on:click="generateHeraldry">Load the Generator</button>
  </section>
</template>

<script>
import * as RND from "../modules/random.js";

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
        params: {seed: this.seed},
      });
    },
  },
  created: function () {
    this.seed = RND.randomString(13);
  },
};
</script>

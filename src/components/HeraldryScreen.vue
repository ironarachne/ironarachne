<template>
  <section class="heraldry main">
    <h2>Heraldry Generator</h2>
    <p>This is the heraldry generator.</p>
    <button v-on:click="generateHeraldry">Generate</button>
    <p class="blazon">{{ blazon }}</p>
    <div class="coat-of-arms" v-html="image"></div>
  </section>
</template>

<script>
  import * as Heraldry from '../modules/heraldry/heraldry.js'

  export default {
    name: 'HeraldryScreen',
    data: function() {
      return {
        blazon: '',
        image: ''
      }
    },
    methods: {
      generateHeraldry: function() {
        let h = Heraldry.generate()
        this.blazon = h.blazon
        this.image = h.svg
      }
    }
  }
</script>

<style type="scss">
  div.coat-of-arms {
    width: 600px;
    height: 600px;
    margin: 0 auto;
  }
  p.blazon {
    text-align: center;
  }
</style>

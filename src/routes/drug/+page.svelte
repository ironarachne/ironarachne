<script lang="ts">
  import DrugGenerator from "$lib/drug/generator";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";

  let description = "";
  let seed = RND.randomString(13);
  let generator = new DrugGenerator();

  function generate() {
    random.use(seedrandom(seed));
    let drug = generator.generate();
    description = drug.describe();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  newSeed();
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/cyberpunk.scss';
</style>

<svelte:head>
  <title>Cyberpunk Drug Generator | Iron Arachne</title>
</svelte:head>

<section class="cyberpunk main">
  <h1>Drug Generator</h1>

  <p>I suppose you could also use this for any sci-fi setting, really.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <p>{ description }</p>
</section>

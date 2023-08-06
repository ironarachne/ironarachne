<script lang="ts">
  import ArmsManufacturerGenerator from "$lib/arms-manufacturer/generator.js";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let generator = new ArmsManufacturerGenerator();
  let manufacturer = generator.generate();

  function generate() {
    seed = RND.randomString(13);
    random.use(seedrandom(seed));
    manufacturer = generator.generate();
  }
</script>

<svelte:head>
  <title>Arms Manufacturer Generator | Iron Arachne</title>
</svelte:head>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/scifi.scss';
</style>

<section class="scifi main">
  <h1>Arms Manufacturer Generator</h1>
  <p>This generator produces sci-fi arms manufacturing companies.</p>
  <button on:click={generate}>Generate</button>
  <p>{ manufacturer.description }</p>
  <h2>Models</h2>
  {#each manufacturer.models as model}
  <div>
    <h3>{model.name}</h3>
    <p>{model.description}</p>
  </div>
  {/each}
</section>

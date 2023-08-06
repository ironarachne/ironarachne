<script lang="ts">
  import * as SpookyShip from "$lib/spookyship";
  import * as RND from "@ironarachne/rng";

  import random from "random";
  import seedrandom from "seedrandom";

  let description = "";
  let seed = RND.randomString(13);

  function generateSpookyShip() {
    random.use(seedrandom(seed));
    description = SpookyShip.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generateSpookyShip();
  }

  newSeed();
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/scifi.scss';
</style>

<svelte:head>
  <title>Spooky Ship Generator | Iron Arachne</title>
</svelte:head>

<section class="scifi main">
  <h1>Spooky Ship Generator</h1>

  <p>This was done for the October 2021 Generator Challenge, from r/rpg_generators.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generateSpookyShip}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <p>{ description }</p>
</section>

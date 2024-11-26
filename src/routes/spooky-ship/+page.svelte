<script lang="ts">
  import * as SpookyShip from "$lib/spookyship";
  import * as RND from "@ironarachne/rng";

  import random from "random";
  import seedrandom from "seedrandom";

  let description = "";
  let seed = RND.randomString(13);
  let lockSeed = false;

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));
    description = SpookyShip.generate();
  }

  generate();
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
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>
  
  <button on:click={generate}>Generate</button>

  <p>{ description }</p>
</section>

<script lang="ts">
  import * as Drug from "../modules/drug";
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";

  let description = "";
  let seed = RND.randomString(13);

  function generateDrug() {
    random.use(seedrandom(seed));
    description = Drug.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generateDrug();
  }

  newSeed();
</script>

<svelte:head>
  <title>Cyberpunk Drug Generator | Iron Arachne</title>
</svelte:head>

<section class="cyberpunk main">
  <h2>Drug Generator</h2>

  <p>I suppose you could also use this for any sci-fi setting, really.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generateDrug}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <p>{ description }</p>
</section>

<script lang="ts">
  import type Drug from "$lib/drug/drug";
  import * as Drugs from "$lib/drug/drugs";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";

  let seed = $state(RND.randomString(13));
  const config = Drugs.getDefaultConfig();
  let drug: Drug = $state(Drugs.generate(config));
  let lockSeed = $state(false);

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));
    drug = Drugs.generate(config);
  }

  generate();
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
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>

  <p>{ drug.description }</p>
</section>

<script lang="ts">
  import * as ChopShop from "$lib/chopshop";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";

  let description = "";
  let seed = RND.randomString(13);

  function generateChopShop() {
    seed = RND.randomString(13);
    random.use(seedrandom(seed));
    description = ChopShop.generate();
  }

  generateChopShop();
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/cyberpunk.scss';
</style>

<svelte:head>
  <title>Chop Shop Generator | Iron Arachne</title>
</svelte:head>

<section class="cyberpunk main">
  <h1>Chop Shop Generator</h1>
  <p>This is a cyberpunk chop shop generator.</p>
  <button on:click={generateChopShop}>Generate</button>
  <p>{ description }</p>
</section>

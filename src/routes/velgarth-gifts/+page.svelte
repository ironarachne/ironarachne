<script lang="ts">
  import type GiftGeneratorConfig from "$lib/velgarth_gifts/generator_config";
  import * as VelgarthGifts from "$lib/velgarth_gifts/gifts";
  import * as VelgarthGiftPossibilities from "$lib/velgarth_gifts/gift_possibilities";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";
  import type Gift from "$lib/velgarth_gifts/gift";

  let seed = RND.randomString(13);
  let gifts: Gift[] = [];

  function generate() {
    random.use(seedrandom(seed));
    const config: GiftGeneratorConfig = {
      possibilities: VelgarthGiftPossibilities.all(),
      max_gifts: 3,
      min_gifts: 1
    };
    gifts = VelgarthGifts.generate(config);
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
  @import '$lib/styles/fantasy.scss';
</style>

<svelte:head>
  <title>Velgarth Gifts Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Velgarth Gifts Generator</h1>

  <p>This gives you a set of Gifts for a character from Mercedes Lackey's Velgarth setting.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  {#each gifts as gift}
    <div class="gift">
      <h2>{gift.name}</h2>
      <p>{gift.description}</p>
    </div>
  {/each}
</section>

<script lang="ts">
  import type GiftGeneratorConfig from "$lib/velgarth_gifts/generator_config";
  import * as VelgarthGifts from "$lib/velgarth_gifts/gifts";
  import * as VelgarthGiftPossibilities from "$lib/velgarth_gifts/gift_possibilities";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";
  import type Gift from "$lib/velgarth_gifts/gift";

  let seed = $state(RND.randomString(13));
  let lockSeed = $state(false);
  let gifts: Gift[] = $state([]);

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));
    const config: GiftGeneratorConfig = {
      possibilities: VelgarthGiftPossibilities.all(),
      max_gifts: 3,
      min_gifts: 1
    };
    gifts = VelgarthGifts.generate(config);
  }

  generate();
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
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>
  
  <button onclick={generate}>Generate</button>

  {#each gifts as gift}
    <div class="gift">
      <h2>{gift.name}</h2>
      <p>{gift.description}</p>
    </div>
  {/each}
</section>

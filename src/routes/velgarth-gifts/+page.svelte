<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import * as VelgarthGifts from '$lib/velgarth_gifts/gifts';
  import * as VelgarthGiftPossibilities from '$lib/velgarth_gifts/gift_possibilities';
  import type Gift from '$lib/velgarth_gifts/gift';
  import type GiftGeneratorConfig from '$lib/velgarth_gifts/generator_config';

  let seed = $state(new RNG(Date.now().toString()).randomString(13));
  let lockSeed = $state(false);
  let gifts: Gift[] = $state([]);

  function generate() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
    }
    const rng = new RNG(seed);
    const config: GiftGeneratorConfig = {
      possibilities: VelgarthGiftPossibilities.all(),
      max_gifts: 3,
      min_gifts: 1,
    };
    gifts = VelgarthGifts.generate(config, rng);
  }

  generate();
</script>

<svelte:head>
  <title>Velgarth Gifts Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Velgarth Gifts Generator</h1>

  <p>This gives you a set of Gifts for a character from Mercedes Lackey's Velgarth setting.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>

  {#each gifts as gift}
    <div class="gift">
      <h2>{gift.name}</h2>
      <p>{gift.description}</p>
    </div>
  {/each}
</section>


<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as VelgarthGifts from '$lib/velgarth_gifts/gifts';
  import * as VelgarthGiftPossibilities from '$lib/velgarth_gifts/gift_possibilities';
  import type Gift from '$lib/velgarth_gifts/gift';
  import type GiftGeneratorConfig from '$lib/velgarth_gifts/generator_config';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';

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

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage theme="fantasy" title="Velgarth Gifts Generator">
  {#snippet description()}
    <p>This gives you a set of Gifts for a character from Mercedes Lackey's Velgarth setting.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <button onclick={generate}>Generate</button>

  {#each gifts as gift}
    <div class="gift">
      <h2>{gift.name}</h2>
      <p>{gift.description}</p>
    </div>
  {/each}
</GeneratorPage>

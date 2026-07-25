<script lang="ts">
  import { onMount } from 'svelte';
  import type Drug from '$lib/drug/drug';
  import * as Drugs from '$lib/drug/drugs';
  import { RNG } from '@ironarachne/rng';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';

  const initialSeed = new RNG(Date.now().toString()).randomString(13);
  let seed = $state(initialSeed);
  const config = Drugs.getDefaultConfig();
  let drug: Drug | null = $state(null);
  let lockSeed = $state(false);

  function generate() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
    }
    const rng = new RNG(seed);
    drug = Drugs.generate(config, rng);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage theme="cyberpunk" title="Drug Generator">
  {#snippet description()}
    <p>I suppose you could also use this for any sci-fi setting, really.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed label="Random Seed" />

  <button onclick={generate}>Generate</button>

  {#if drug}
    <p>{drug.description}</p>
  {/if}
</GeneratorPage>

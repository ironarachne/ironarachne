<script lang="ts">
  import { onMount } from 'svelte';
  import * as SpookyShip from '$lib/spooky_ship';
  import { RNG } from '@ironarachne/rng';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let shipDescription = $state('');

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    shipDescription = SpookyShip.generate(rng);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath="/spooky-ship" theme="scifi" title="Spooky Ship Generator">
  {#snippet description()}
    <p>Generate a spooky ship description.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <p>{shipDescription}</p>
</GeneratorPage>

<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import { generate as generateArmsManufacturer } from '$lib/arms_manufacturer/generator.js';
  import type { ArmsManufacturer } from '$lib/arms_manufacturer/arms_manufacturer.js';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';

  const rng = new RNG(Date.now());

  let seed = new RNG(Date.now().toString()).randomString(13);
  rng.setSeed(seed);
  let manufacturer: ArmsManufacturer | null = $state(null);

  function generate() {
    seed = new RNG(Date.now().toString()).randomString(13);
    rng.setSeed(seed);
    manufacturer = generateArmsManufacturer(rng);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage theme="scifi" title="Arms Manufacturer Generator">
  {#snippet description()}
    <p>This generator produces sci-fi arms manufacturing companies.</p>
  {/snippet}

  <button onclick={generate}>Generate</button>

  {#if manufacturer}
    <p>{manufacturer.description}</p>

    <h2>Models</h2>
    <p>The following are the manufacturer's most popular models.</p>
    {#each manufacturer.models as model}
      <div>
        <h3>{model.name}</h3>
        <p>{model.description}</p>
      </div>
    {/each}
  {/if}
</GeneratorPage>

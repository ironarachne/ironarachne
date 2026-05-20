<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import ArmsManufacturerGenerator from '$lib/arms_manufacturer/generator.js';

  const rng = new RNG(Date.now());

  let seed = new RNG(Date.now().toString()).randomString(13);
  rng.setSeed(seed);
  const generator = new ArmsManufacturerGenerator(rng);
  let manufacturer = $state(generator.generate());

  function generate() {
    seed = new RNG(Date.now().toString()).randomString(13);
    rng.setSeed(seed);
    manufacturer = generator.generate();
  }
</script>

<svelte:head>
  <title>Arms Manufacturer Generator | Iron Arachne</title>
</svelte:head>

<section class="scifi main">
  <h1>Arms Manufacturer Generator</h1>
  <p>This generator produces sci-fi arms manufacturing companies.</p>
  <button onclick={generate}>Generate</button>
  <p>{manufacturer.description}</p>
  <h2>Models</h2>
  <p>The following are the manufacturer's most popular models.</p>
  {#each manufacturer.models as model}
    <div>
      <h3>{model.name}</h3>
      <p>{model.description}</p>
    </div>
  {/each}
</section>

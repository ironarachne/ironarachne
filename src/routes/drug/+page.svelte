<script lang="ts">
  import type Drug from '$lib/drug/drug';
  import * as Drugs from '$lib/drug/drugs';
  import { RNG } from '@ironarachne/rng';

  const initialSeed = new RNG(Date.now().toString()).randomString(13);
  let seed = $state(initialSeed);
  const config = Drugs.getDefaultConfig();
  let drug: Drug = $state(Drugs.generate(config, new RNG(initialSeed)));
  let lockSeed = $state(false);

  function generate() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
    }
    const rng = new RNG(seed);
    drug = Drugs.generate(config, rng);
  }

  generate();
</script>

<svelte:head>
  <title>Cyberpunk Drug Generator | Iron Arachne</title>
</svelte:head>

<section class="cyberpunk main">
  <h1>Drug Generator</h1>

  <p>I suppose you could also use this for any sci-fi setting, really.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>

  <p>{drug.description}</p>
</section>


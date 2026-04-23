<script lang="ts">
  import * as SpookyShip from '$lib/spooky_ship';
  import { RNG } from '@ironarachne/rng';

  let description = $state('');
  let seed = $state(new RNG(Date.now().toString()).randomString(13));
  let lockSeed = $state(false);

  function generate() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
    }
    const rng = new RNG(seed);
    description = SpookyShip.generate(rng);
  }

  generate();
</script>

<svelte:head>
  <title>Spooky Ship Generator | Iron Arachne</title>
</svelte:head>

<section class="scifi main">
  <h1>Spooky Ship Generator</h1>

  <p>This was done for the October 2021 Generator Challenge, from r/rpg_generators.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>

  <p>{description}</p>
</section>


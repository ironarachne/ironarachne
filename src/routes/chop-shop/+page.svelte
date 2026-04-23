<script lang="ts">
  import * as ChopShop from '$lib/chopshop';
  import { RNG } from '@ironarachne/rng';

  let description = $state('');
  let seed = new RNG(Date.now().toString()).randomString(13);

  function generateChopShop() {
    seed = new RNG(Date.now().toString()).randomString(13);
    const rng = new RNG(seed);
    description = ChopShop.generate(rng);
  }

  generateChopShop();
</script>

<svelte:head>
  <title>Chop Shop Generator | Iron Arachne</title>
</svelte:head>

<section class="cyberpunk main">
  <h1>Chop Shop Generator</h1>
  <p>This is a cyberpunk chop shop generator.</p>
  <button onclick={generateChopShop}>Generate</button>
  <p>{description}</p>
</section>


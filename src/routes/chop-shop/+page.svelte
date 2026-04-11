<script lang="ts">
  import * as ChopShop from '$lib/chopshop';
  import * as RNG from '@ironarachne/rng';

  let description = $state('');
  let seed = RNG.randomString(13);

  function generateChopShop() {
    seed = RNG.randomString(13);
    RNG.setSeed(seed);
    description = ChopShop.generate();
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


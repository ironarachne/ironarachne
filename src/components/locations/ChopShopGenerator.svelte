<script lang="ts">
  import * as ChopShop from '$lib/chopshop';
  import { RNG } from '@ironarachne/rng';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';

  let shopDescription = $state('');
  let seed = new RNG(Date.now().toString()).randomString(13);

  function generateChopShop() {
    seed = new RNG(Date.now().toString()).randomString(13);
    const rng = new RNG(seed);
    shopDescription = ChopShop.generate(rng);
  }

  generateChopShop();
</script>

<GeneratorPage theme="cyberpunk" title="Chop Shop Generator">
  {#snippet description()}
    <p>This is a cyberpunk chop shop generator.</p>
  {/snippet}

  <button onclick={generateChopShop}>Generate</button>

  <p>{shopDescription}</p>
</GeneratorPage>

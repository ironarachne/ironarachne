<script lang="ts">
  import * as ChopShop from '$lib/chopshop';
  import { RNG } from '@ironarachne/rng';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  let shopDescription = $state('');
  let seed = new RNG(Date.now().toString()).randomString(13);

  function generateChopShop() {
    seed = new RNG(Date.now().toString()).randomString(13);
    const rng = new RNG(seed);
    shopDescription = ChopShop.generate(rng);
  }

  generateChopShop();
</script>

<GeneratorPage toolPath="/chop-shop" theme="cyberpunk" title="Chop Shop Generator">
  {#snippet description()}
    <p>This is a cyberpunk chop shop generator.</p>
  {/snippet}

  <BaseButton onclick={generateChopShop}>Generate</BaseButton>

  <p>{shopDescription}</p>
</GeneratorPage>

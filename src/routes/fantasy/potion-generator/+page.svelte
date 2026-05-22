<script lang="ts">
  import { valueToString } from '$lib/currency';
  import { COMMON_FANTASY } from '$lib/currency/systems';
  import {
    describeDurationShort,
    describeEffect,
    generatePotion,
    getDefaultPotionConfig,
    type Potion,
  } from '$lib/potions';
  import { RNG } from '@ironarachne/rng';

  const initialSeed = new RNG(Date.now().toString()).randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  let allowHomebrew = $state(false);
  let allowProceduralNames = $state(false);

  let potion: Potion = $state(generatePotion(initialSeed, getDefaultPotionConfig()));

  function generate() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
    }

    const config = getDefaultPotionConfig();
    config.allowHomebrew = allowHomebrew;
    config.allowProceduralNames = allowProceduralNames;
    potion = generatePotion(seed, config);
  }

  generate();
</script>

<svelte:head>
  <title>Potion Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Potion Generator</h1>

  <p>Generate magical potions, oils, and ointments with procedural sensory details and SRD-based effects.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <label>
      <input type="checkbox" name="lockSeed" bind:checked={lockSeed} />
      Lock Seed
    </label>
    <label>
      <input type="checkbox" bind:checked={allowHomebrew} />
      Allow Homebrew
    </label>
    <label>
      <input type="checkbox" bind:checked={allowProceduralNames} />
      Allow Variations
    </label>
  </div>

  <button onclick={generate}>Generate</button>

  <article class="potion-result">
    <h2>{potion.displayName}</h2>

    {#if potion.modifications.length > 0}
      <p><strong>Modifications:</strong> {potion.modifications.map((mod) => mod.kind).join(', ')}</p>
    {/if}

    {#if potion.canonicalName && potion.canonicalName !== potion.displayName}
      <p><strong>Base formula:</strong> {potion.canonicalName}</p>
    {/if}
    <p><strong>Rarity:</strong> {potion.liquid.rarity}</p>
    <p><strong>Value:</strong> {valueToString(potion.liquid.value, COMMON_FANTASY)}</p>
    <p><strong>Form:</strong> {potion.liquid.properties.includes('oil') ? 'oil' : potion.liquid.properties.includes('ointment') ? 'ointment' : 'drink'}</p>

    <h3>Effect</h3>
    <p>{describeEffect(potion.effect)}</p>
    <p><strong>Duration:</strong> {describeDurationShort(potion.effect.duration)}</p>
    <p><strong>Magnitude:</strong> {potion.effect.magnitude}</p>

    <h3>Sensory Profile</h3>
    <ul>
      <li><strong>Appearance:</strong> {potion.sensory.appearance}</li>
      <li><strong>Viscosity:</strong> {potion.sensory.viscosity}</li>
      <li><strong>Flavor:</strong> {potion.sensory.flavor}</li>
      <li><strong>Scent:</strong> {potion.sensory.scent}</li>
    </ul>

    <h3>Container</h3>
    <p>{potion.container.name}: {potion.container.description}</p>
    <p><strong>Container value:</strong> {valueToString(potion.container.value, COMMON_FANTASY)}</p>

    <h3>Description</h3>
    <p>{potion.liquid.description}</p>
  </article>
</section>

<style>
  .potion-result {
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 0.5rem;
  }

  .potion-result h3 {
    margin-top: 1rem;
    margin-bottom: 0.25rem;
  }

  .input-group label {
    display: inline-block;
    margin-right: 1rem;
  }
</style>

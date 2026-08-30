<script lang="ts">
  import { onMount } from 'svelte';
  import { valueToString, COMMON_FANTASY } from '$lib/currency';
  import {
    describeDurationShort,
    describeEffect,
    generatePotion,
    getDefaultPotionConfig,
    type Potion,
  } from '$lib/potions';
  import { RNG } from '@ironarachne/rng';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const initialSeed = new RNG(Date.now().toString()).randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  let allowHomebrew = $state(false);
  let allowProceduralNames = $state(false);

  let potion: Potion | null = $state(null);

  function generate() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
    }

    const config = getDefaultPotionConfig();
    config.allowHomebrew = allowHomebrew;
    config.allowProceduralNames = allowProceduralNames;
    potion = generatePotion(seed, config);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath="/fantasy/potion-generator" title="Potion Generator">
  {#snippet description()}
    <p>
      Generate magical potions, oils, and ointments with procedural sensory details and SRD-based
      effects.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed label="Random Seed" />

  <CheckboxField id="allowHomebrew" label="Allow Homebrew" bind:checked={allowHomebrew} />
  <CheckboxField
    id="allowProceduralNames"
    label="Allow Variations"
    bind:checked={allowProceduralNames}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>

  {#if potion}
    <!-- A result surface is a panel, not a box with a border on it: the two layers,
         and the keyline, corner and padding are the system's. It wrote its own
         border, radius and padding until #124. -->
    <article class="potion-result panel">
      <div class="panel__field">
        <h2>{potion.displayName}</h2>

        {#if potion.modifications.length > 0}
          <p>
            <strong>Modifications:</strong>
            {potion.modifications.map((mod) => mod.kind).join(', ')}
          </p>
        {/if}

        {#if potion.canonicalName && potion.canonicalName !== potion.displayName}
          <p><strong>Base formula:</strong> {potion.canonicalName}</p>
        {/if}
        <p><strong>Rarity:</strong> {potion.liquid.rarity}</p>
        <p><strong>Value:</strong> {valueToString(potion.liquid.value, COMMON_FANTASY)}</p>
        <p>
          <strong>Form:</strong>
          {potion.liquid.properties.includes('oil')
            ? 'oil'
            : potion.liquid.properties.includes('ointment')
              ? 'ointment'
              : 'drink'}
        </p>

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
        <p>
          <strong>Container value:</strong>
          {valueToString(potion.container.value, COMMON_FANTASY)}
        </p>

        <h3>Description</h3>
        <p>{potion.liquid.description}</p>
      </div>
    </article>
  {/if}
</GeneratorPage>

<style>
  /* The keyline, the corner and the padding are the panel's now. What is left is where the
     result sits on the page. */
  .potion-result {
    margin-top: var(--s7);
  }

  .potion-result h3 {
    margin-top: var(--s6);
    margin-bottom: var(--s2);
  }
</style>

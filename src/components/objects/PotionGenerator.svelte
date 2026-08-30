<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
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
          <Stat label="Modifications">
            {potion.modifications.map((mod) => mod.kind).join(', ')}
          </Stat>
        {/if}

        {#if potion.canonicalName && potion.canonicalName !== potion.displayName}
          <StatBlock>
            <Stat label="Base formula">{potion.canonicalName}</Stat>
          </StatBlock>
        {/if}
        <StatBlock>
          <Stat label="Rarity">{potion.liquid.rarity}</Stat>
          <Stat label="Value">{valueToString(potion.liquid.value, COMMON_FANTASY)}</Stat>
        </StatBlock>
        <Stat label="Form">
          {potion.liquid.properties.includes('oil')
            ? 'oil'
            : potion.liquid.properties.includes('ointment')
              ? 'ointment'
              : 'drink'}
        </Stat>

        <h3>Effect</h3>
        <p>{describeEffect(potion.effect)}</p>
        <StatBlock>
          <Stat label="Duration">{describeDurationShort(potion.effect.duration)}</Stat>
          <Stat label="Magnitude">{potion.effect.magnitude}</Stat>
        </StatBlock>

        <h3>Sensory Profile</h3>
        <ul>
          <StatBlock>
            <Stat label="Appearance">{potion.sensory.appearance}</Stat>
            <Stat label="Viscosity">{potion.sensory.viscosity}</Stat>
            <Stat label="Flavor">{potion.sensory.flavor}</Stat>
            <Stat label="Scent">{potion.sensory.scent}</Stat>
          </StatBlock>
        </ul>

        <h3>Container</h3>
        <p>{potion.container.name}: {potion.container.description}</p>
        <Stat label="Container value">
          {valueToString(potion.container.value, COMMON_FANTASY)}
        </Stat>

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

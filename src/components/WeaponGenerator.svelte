<script lang="ts">
  import { onMount } from 'svelte';
  import { domains } from '$lib/religion/domains';
  import * as Equipment from '$lib/equipment/index';
  import type { Item } from '$lib/equipment/equipment_types';
  import * as RNG from '@ironarachne/rng';
  import { getDefaultGenerationConfig } from '$lib/equipment/generation';
  import GeneratorPage from '$components/GeneratorPage.svelte';
  import SeedControls from '$components/SeedControls.svelte';
  import SelectField from '$components/SelectField.svelte';

  const themes = domains.map((domain) => domain.name).sort();
  const categories = ['any', 'melee', 'ranged'];

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let category = $state('any');
  let theme = $state('any');
  let weapon: Item | null = $state(null);

  function generateWeapon(cat: string, thm: string, genRng: RNG.RNG) {
    let domainName = thm;
    if (thm === 'any') {
      domainName = genRng.item(domains).name;
    }

    const config = getDefaultGenerationConfig();
    config.itemMajorType = 'weapon';
    config.enchantments = Equipment.filterEnchantmentsByTags([domainName], Equipment.ENCHANTMENTS);
    config.decorations = Equipment.filterDecorationsByTags([domainName], Equipment.DECORATIONS);
    config.enchantmentChance = 100;
    config.decorationChance = 100;
    config.useUniqueNames = true;

    if (cat !== 'any') {
      config.itemMinorType = cat;
    }

    const newWeapon = Equipment.generateItem(seed, config);

    return newWeapon;
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    weapon = generateWeapon(category, theme, rng);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage theme="fantasy" title="Magic Weapon Generator">
  {#snippet description()}
    <p>This generates a unique magical weapon.</p>
  {/snippet}

  <SelectField id="theme" label="Theme" bind:value={theme} options={['any', ...themes]} />

  <SelectField id="category" label="Category" bind:value={category} options={categories} />

  <SeedControls bind:seed bind:lockSeed />

  <button onclick={generate}>Generate</button>

  {#if weapon}
    <h2>{weapon.uniqueName}</h2>

    <p>{weapon.description}</p>
  {/if}
</GeneratorPage>

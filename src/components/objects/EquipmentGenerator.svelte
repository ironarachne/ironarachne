<script lang="ts">
  import { onMount } from 'svelte';
  import * as RNG from '@ironarachne/rng';
  import { type Item, type Weapon, type Armor } from '$lib/equipment/equipment_types';
  import { generateItem, getDefaultGenerationConfig } from '$lib/equipment/generation';
  import { kgToPounds } from '$lib/measurements';
  import { valueToString } from '$lib/currency';
  import { COMMON_FANTASY } from '$lib/currency/systems';
  import { convertPowerToDice, convertToDnDArmorClass } from '$lib/combat_system';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let itemType = $state('any');
  let itemCount = $state(10);
  let useRefine = $state(true);
  let useEnchant = $state(true);
  let useDecorate = $state(true);
  let displaySystem = $state('dnd5e');

  let generatedItems: Item[] = $state([]);

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    const config = getDefaultGenerationConfig();
    config.itemMajorType = itemType as 'any' | 'weapon' | 'armor';
    config.useRefine = useRefine;
    config.useEnchant = useEnchant;
    config.useDecorate = useDecorate;

    const items: Item[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(generateItem(`${seed}-item-${i}`, config));
    }
    generatedItems = items;
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage theme="fantasy" title="Equipment Generator">
  {#snippet description()}
    <p>Generate random weapons and armor.</p>
    <p>"Refine" adds quality modifications to the items.</p>
    <p>"Enchant" adds magical properties to the items.</p>
    <p>"Decorate" adds aesthetic modifications to the items.</p>
  {/snippet}

  <ControlsPanel>
    <SelectField
      id="itemType"
      label="Item Type"
      bind:value={itemType}
      options={[
        { value: 'any', label: 'Any' },
        { value: 'weapon', label: 'Weapon' },
        { value: 'armor', label: 'Armor' },
      ]}
    />

    <SelectField
      id="displaySystem"
      label="System"
      bind:value={displaySystem}
      options={[
        { value: 'dnd5e', label: 'D&D 5e' },
        { value: 'ironarachne', label: 'Iron Arachne' },
      ]}
    />

    <NumberField id="itemCount" label="Count" bind:value={itemCount} min={1} max={50} />

    <div class="checkbox-group">
      <CheckboxField id="useRefine" label="Refine" bind:checked={useRefine} />
      <CheckboxField id="useEnchant" label="Enchant" bind:checked={useEnchant} />
      <CheckboxField id="useDecorate" label="Decorate" bind:checked={useDecorate} />
    </div>

    <SeedControls bind:seed bind:lockSeed inline />

    <button onclick={generate}>Generate</button>
  </ControlsPanel>

  <div class="results">
    {#each generatedItems as item}
      <div class="item-card">
        <h3>{item.name}</h3>
        <p class="description">{item.description}</p>
        <div class="stats">
          <span class="tag type">{item.itemMajorType}</span>
          {#if item.itemMajorType === 'weapon'}
            {@const weapon = item as Weapon}
            {#if displaySystem === 'dnd5e' && weapon.actions && weapon.actions.length > 0}
              <span class="tag damage"
                >Damage: {convertPowerToDice(weapon.actions[0].baseDamage || 0)} ({weapon.actions[0]
                  .damageType})</span
              >
              {#if weapon.actions[0].bonusDamage && weapon.actions[0].bonusDamage.length > 0}
                {#each weapon.actions[0].bonusDamage as bonus}
                  <span class="tag damage extra"
                    >+ {convertPowerToDice(bonus.power)} ({bonus.type})</span
                  >
                {/each}
              {/if}
            {:else}
              <span class="tag damage"
                >Damage: {weapon.actions[0].baseDamage || 0} ({weapon.actions[0].damageType})</span
              >
            {/if}
          {/if}
          {#if item.itemMajorType === 'armor'}
            {@const armor = item as Armor}
            {#if displaySystem === 'dnd5e'}
              <span class="tag defense"
                >AC: {convertToDnDArmorClass(armor.combatProfile.defense)}</span
              >
            {:else}
              <span class="tag defense">Defense: {armor.combatProfile.defense}</span>
            {/if}
          {/if}
          <span class="tag value">Value: {valueToString(item.value, COMMON_FANTASY)}</span>
          <span class="tag weight">Weight: {kgToPounds(item.weight).toFixed(1)} lbs</span>
        </div>
        {#if item.properties && item.properties.length > 0}
          <div class="tags">
            {#each item.properties as tag}
              <span class="property-tag">{tag}</span>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</GeneratorPage>

<style>
  .results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .item-card {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);

    h3 {
      margin-top: 0;
      text-transform: capitalize;
    }

    .description {
      font-style: italic;
      color: #aaa;
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }

    .tag {
      background: #333;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;

      &.damage {
        color: #ff9999;
      }
      &.defense {
        color: #9999ff;
      }
      &.value {
        color: #ffff99;
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-top: 0.5rem;
    }

    .property-tag {
      background: #444;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      font-size: 0.7rem;
      color: #ddd;
    }
  }
</style>

<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { type Item, type Weapon, type Armor } from '$lib/equipment/equipment_types';
  import { generateItem, getDefaultGenerationConfig } from '$lib/equipment/generation';
  import { kgToPounds } from '$lib/measurements';
  import { valueToString } from '$lib/currency';
  import { COMMON_FANTASY } from '$lib/currency/systems';
  import { convertPowerToDice, convertToDnDArmorClass } from '$lib/combat_system';

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

  // Initial generation
  generate();
</script>

<svelte:head>
  <title>Equipment Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Equipment Generator</h1>

  <p>Generate random weapons and armor.</p>
  <p>"Refine" adds quality modifications to the items.</p>
  <p>"Enchant" adds magical properties to the items.</p>
  <p>"Decorate" adds aesthetic modifications to the items.</p>

  <div class="controls">
    <div class="input-group">
      <label for="itemType">Item Type</label>
      <select name="itemType" bind:value={itemType} id="itemType">
        <option value="any">Any</option>
        <option value="weapon">Weapon</option>
        <option value="armor">Armor</option>
      </select>
    </div>

    <div class="input-group">
      <label for="displaySystem">System</label>
      <select name="displaySystem" bind:value={displaySystem} id="displaySystem">
        <option value="dnd5e">D&D 5e</option>
        <option value="ironarachne">Iron Arachne</option>
      </select>
    </div>

    <div class="input-group">
      <label for="itemCount">Count</label>
      <input
        type="number"
        name="itemCount"
        bind:value={itemCount}
        id="itemCount"
        min="1"
        max="50"
      />
    </div>

    <div class="checkbox-group">
      <label>
        <input type="checkbox" bind:checked={useRefine} /> Refine
      </label>
      <label>
        <input type="checkbox" bind:checked={useEnchant} /> Enchant
      </label>
      <label>
        <input type="checkbox" bind:checked={useDecorate} /> Decorate
      </label>
    </div>

    <div class="input-group">
      <label for="seed">Seed</label>
      <input type="text" name="seed" bind:value={seed} id="seed" />
      <label class="inline-label">
        <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
      </label>
    </div>

    <button onclick={generate}>Generate</button>
  </div>

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
</section>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .checkbox-group {
    display: flex;
    gap: 1rem;
    padding-bottom: 0.5rem;
  }

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

  .inline-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
  }
</style>

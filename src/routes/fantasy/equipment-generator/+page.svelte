<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import {
    type Item,
    type Weapon,
    type Armor,
    type WeaponType,
    type ArmorType
  } from '$lib/equipment/equipment_types';
  import { weaponTypes } from '$lib/equipment/weapons';
  import { armorTypes } from '$lib/equipment/armor';
  import { applyMaterial, getRandomMaterialForItem } from '$lib/equipment/foundry';
  import { applyRefinement, getRandomRefinement } from '$lib/equipment/refinery';
  import { applyEnchantment, getRandomEnchantment } from '$lib/equipment/enchanter';
  import { applyDecoration, getRandomDecoration } from '$lib/equipment/decorator';
  import { kgToPounds } from '$lib/measurements';
  import { valueToString } from '$lib/currency';
  import { STANDARD_FANTASY } from '$lib/currency/systems';
  import { convertToDnD5e } from '$lib/combat_system/converter';
  import type { CombatProfile } from '$lib/combat_system/types';

  const EQUIPMENT_CURRENCY = {
    ...STANDARD_FANTASY,
    denominations: STANDARD_FANTASY.denominations.filter((d) => d.name !== 'platinum'),
  };

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

  function createBaseWeapon(type: WeaponType, rng: RNG.RNG): Weapon {
    // Rough mapping of damage to power
    // Power / 5 = Average Damage
    let power = 10;
    if (type.damage.includes('d4')) power = 12; // Avg 2.5
    if (type.damage.includes('d6')) power = 17; // Avg 3.5
    if (type.damage.includes('d8')) power = 22; // Avg 4.5
    if (type.damage.includes('d10')) power = 27; // Avg 5.5
    if (type.damage.includes('d12')) power = 32; // Avg 6.5
    if (type.damage.includes('2d6')) power = 35; // Avg 7

    return {
      id: rng.randomString(16),
      name: type.name,
      description: type.description,
      itemMajorType: 'weapon',
      itemMinorType: type.weaponType,
      value: 100, // Base value, should probably be in the type definition
      rarity: 'common',
      densityCategory: 'standard',
      weight: 1, // Base weight
      properties: ['weapon', type.damageType, type.weaponType],
      damage: type.damage,
      damageType: type.damageType,
      weaponType: type.weaponType,
      range: type.range,
      hands: type.hands,
      combatProfile: {
        attack: 0,
        defense: 0,
        power,
        resilience: 0,
        speed: 0,
        health: 0
      }
    };
  }

  function createBaseArmor(type: ArmorType, rng: RNG.RNG): Armor {
    // Rough mapping of armor type to defense
    // 10 + Defense / 5 = AC
    let defense = 5; // Light (AC 11)
    if (type.armorType === 'medium') defense = 15; // Medium (AC 13)
    if (type.armorType === 'heavy') defense = 40; // Heavy (AC 18)

    return {
      id: rng.randomString(16),
      name: type.name,
      description: type.description,
      itemMajorType: 'armor',
      itemMinorType: type.armorType,
      value: 100, // Base value
      rarity: 'common',
      densityCategory: 'standard',
      weight: 1, // Base weight
      properties: ['armor', type.armorType],
      defense: type.defense,
      armorType: type.armorType,
      combatProfile: {
        attack: 0,
        defense,
        power: 0,
        resilience: 0,
        speed: 0,
        health: 0
      }
    };
  }

  function generateItem(rng: RNG.RNG): Item {
    let baseItem: Item;
    let typeChoice = itemType;

    if (typeChoice === 'any') {
      typeChoice = rng.item(['weapon', 'armor']);
    }

    if (typeChoice === 'weapon') {
      const type = rng.item(weaponTypes);
      baseItem = createBaseWeapon(type, rng);
    } else {
      const type = rng.item(armorTypes);
      baseItem = createBaseArmor(type, rng);
    }

    // Phase 1: Foundry (Always run)
    const material = getRandomMaterialForItem(baseItem, rng);
    let item = applyMaterial(baseItem, material);

    // Phase 2: Refinery
    if (useRefine) {
      // Chance to refine? Or always refine if checked?
      // Let's say 50% chance to have a refinement if checked, to add variety
      if (rng.simple(100) > 50) {
        const refinement = getRandomRefinement(item, rng);
        if (refinement) {
          item = applyRefinement(item, refinement);
        }
      }
    }

    // Phase 3: Enchanter
    if (useEnchant) {
      // Lower chance for enchantment
      if (rng.simple(30)) {
        const enchantment = getRandomEnchantment(item, rng);
        if (enchantment) {
          item = applyEnchantment(item, enchantment);
        }
      }
    }

    // Phase 4: Decorator
    if (useDecorate) {
      if (rng.simple(100) > 50) {
        const decoration = getRandomDecoration(item, rng);
        if (decoration) {
          item = applyDecoration(item, decoration);
        }
      }
    }

    item.value = roundValue(item.value);

    return item;
  }

  function roundValue(value: number): number {
    if (value < 1000) return value; // < 10 gp: Exact
    if (value < 10000) return Math.round(value / 10) * 10; // 10-100 gp: Round to 1 sp
    if (value < 100000) return Math.round(value / 100) * 100; // 100-1000 gp: Round to 1 gp
    if (value < 1000000) return Math.round(value / 1000) * 1000; // 1000-10000 gp: Round to 10 gp
    return Math.round(value / 10000) * 10000; // > 10000 gp: Round to 100 gp
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    const items: Item[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(generateItem(rng));
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

  <p>Generate weapons and armor using the Foundry -> Refinery -> Enchanter -> Decorator pipeline.</p>

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
      <input type="number" name="itemCount" bind:value={itemCount} id="itemCount" min="1" max="50" />
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
             {#if displaySystem === 'dnd5e'}
               <span class="tag damage">Damage: {weapon.damage} ({weapon.damageType})</span>
               {#if weapon.additionalDamage}
                 {#each weapon.additionalDamage as extra}
                   <span class="tag damage extra">+ {extra.damage} ({extra.type})</span>
                 {/each}
               {/if}
             {:else if displaySystem === 'ironarachne' && item.combatProfile}
               <span class="tag damage">Power: {item.combatProfile.power}</span>
             {:else}
               <span class="tag damage">Damage: {weapon.damage} ({weapon.damageType})</span>
             {/if}
          {/if}
          {#if item.itemMajorType === 'armor'}
             {@const armor = item as Armor}
             {#if displaySystem === 'dnd5e'}
               <span class="tag defense">AC: {10 + armor.defense}</span>
             {:else if displaySystem === 'ironarachne' && item.combatProfile}
               <span class="tag defense">Defense: {item.combatProfile.defense}</span>
             {:else}
               <span class="tag defense">Defense: {armor.defense}</span>
             {/if}
          {/if}
          <span class="tag value">Value: {valueToString(item.value, EQUIPMENT_CURRENCY)}</span>
          <span class="tag weight">Weight: {item.weight.toFixed(1)} kg ({kgToPounds(item.weight).toFixed(1)} lbs)</span>
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

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';

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

      &.damage { color: #ff9999; }
      &.defense { color: #9999ff; }
      &.value { color: #ffff99; }
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

<script lang="ts">
  import { onMount } from 'svelte';
  import * as RNG from '@ironarachne/rng';
  import {
    type Item,
    type Weapon,
    type Armor,
    generateItem,
    getDefaultGenerationConfig,
  } from '$lib/equipment';
  import { kgToPounds } from '$lib/measurements';
  import { valueToString, COMMON_FANTASY } from '$lib/currency';
  import { convertPowerToDice, convertToDnDArmorClass } from '$lib/combat_system';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import Badge from '$components/common/Badge.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG.RNG(Date.now().toString());
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

<GeneratorPage toolPath="/fantasy/equipment-generator" title="Equipment Generator">
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

    <BaseButton onclick={generate}>Generate</BaseButton>
  </ControlsPanel>

  <div class="results">
    {#each generatedItems as item}
      <!-- A card is a panel: the two layers, with the `li` painting the keyline across its box
           and the field covering all but a pixel of it. See docs/visual-design.md, "Cards are
           panels". This card wrote its own border, radius, fill and padding until #124. -->
      <div class="item-card panel">
        <div class="panel__field">
          <h3>{item.name}</h3>
          <p class="description">{item.description}</p>
          <div class="stats">
            <Badge>{item.itemMajorType}</Badge>
            {#if item.itemMajorType === 'weapon'}
              {@const weapon = item as Weapon}
              {#if displaySystem === 'dnd5e' && weapon.actions && weapon.actions.length > 0}
                <Badge
                  >Damage: {convertPowerToDice(weapon.actions[0].baseDamage || 0)} ({weapon
                    .actions[0].damageType})</Badge
                >
                {#if weapon.actions[0].bonusDamage && weapon.actions[0].bonusDamage.length > 0}
                  {#each weapon.actions[0].bonusDamage as bonus}
                    <Badge>+ {convertPowerToDice(bonus.power)} ({bonus.type})</Badge>
                  {/each}
                {/if}
              {:else}
                <Badge
                  >Damage: {weapon.actions[0].baseDamage || 0} ({weapon.actions[0]
                    .damageType})</Badge
                >
              {/if}
            {/if}
            {#if item.itemMajorType === 'armor'}
              {@const armor = item as Armor}
              {#if displaySystem === 'dnd5e'}
                <Badge>AC: {convertToDnDArmorClass(armor.combatProfile.defense)}</Badge>
              {:else}
                <Badge>Defense: {armor.combatProfile.defense}</Badge>
              {/if}
            {/if}
            <Badge>Value: {valueToString(item.value, COMMON_FANTASY)}</Badge>
            <Badge>Weight: {kgToPounds(item.weight).toFixed(1)} lbs</Badge>
          </div>
          {#if item.properties && item.properties.length > 0}
            <div class="tags">
              {#each item.properties as tag}
                <!-- `plain` because a card can carry a dozen of these: bordered pills stop
                     annotating the item and start shouting over it. -->
                <Badge plain>{tag}</Badge>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</GeneratorPage>

<style>
  .results {
    display: grid;
    gap: var(--s6);
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  /* What is left after #124: the card's own border, radius, fill and padding are the panel's now,
     and the three tag colours are gone. A hue meaning "damage", another meaning "defense" and a
     third meaning "value" was a fourth colour system beside the roles, the tones and the genres —
     the label already says which is which. */
  .item-card .description {
    color: var(--ink-muted);
    font-style: italic;
  }

  .item-card .stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
    margin: var(--s4) 0;
  }

  .item-card .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s3);
    margin-top: var(--s4);
  }
</style>

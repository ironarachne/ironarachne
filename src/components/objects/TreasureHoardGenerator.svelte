<script lang="ts">
  import * as Equipment from '$lib/equipment';
  import { formatNumber } from '$lib/format';
  import * as Measurements from '$lib/measurements';
  import * as RNG from '@ironarachne/rng';
  import * as Treasure from '$lib/treasure';
  import * as Words from '@ironarachne/words';
  import * as Currency from '$lib/currency';
  import type { Container, Item } from '$lib/equipment';
  import { isArtObject, isGem, isPotion } from '$lib/treasure';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);
  let treasureValue = $state(200);
  let coinsProportion = $state(80);
  let gemsProportion = $state(15);
  let artProportion = $state(5);
  let mundaneItemProportion = $state(20);
  let magicItemProportion = $state(5);
  let potionProportion = $state(0);
  let allowPotionVariations = $state(false);
  let allowPotionHomebrew = $state(false);
  let roomWidth = $state(10);
  let roomLength = $state(10);
  let roomHeight = $state(10);
  let hoard: Item[] = $state([]);
  let containers: Container[] = $state([]);
  let looseItems: string[] = $state([]);

  function getDisplayItems(items: Item[]) {
    const gems = items.filter(isGem);
    const artObjects = items.filter(isArtObject);
    const potions = items.filter(isPotion);
    const others = items.filter((i) => !isGem(i) && !isArtObject(i) && !isPotion(i));

    let displayGems: { name: string; value: number }[] = [];

    if (gems.length > 0 && gems.length < 12) {
      displayGems = gems.map((g) => ({ name: g.name, value: g.value }));
    } else if (gems.length >= 12 && gems.length <= 24) {
      // Local scratch map for tallying duplicates; never held as component state, so the
      // plain Map is correct here and SvelteMap would only add reactivity overhead.
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const groups = new Map<string, { count: number; value: number }>();
      for (const gem of gems) {
        const entry = groups.get(gem.name) || { count: 0, value: 0 };
        entry.count++;
        entry.value += gem.value;
        groups.set(gem.name, entry);
      }

      for (const [name, data] of groups) {
        displayGems.push({
          name: `${data.count} ${data.count > 1 ? Words.pluralize(name) : name}`,
          value: data.value,
        });
      }
    } else if (gems.length > 24) {
      const totalValue = gems.reduce((sum, g) => sum + g.value, 0);
      displayGems.push({
        name: `${gems.length} assorted gems`,
        value: totalValue,
      });
    }

    const displayArtObjects = artObjects.map((i) => ({
      name: i.description || i.name,
      value: i.value,
    }));
    const displayPotions = potions.map((i) => ({
      name: i.name,
      value: i.value,
    }));
    const displayOthers = others.map((i) => ({ name: i.name, value: i.value }));

    return [...displayOthers, ...displayPotions, ...displayArtObjects, ...displayGems];
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
      rng.setSeed(seed);
    }

    const hoardConfig = Treasure.getDefaultTreasureHoardGeneratorConfig();
    hoardConfig.artObjectProportion = artProportion;
    hoardConfig.coinProportions = coinsProportion;
    hoardConfig.gemProportion = gemsProportion;
    hoardConfig.mundaneItemProportion = mundaneItemProportion;
    hoardConfig.magicItemProportion = magicItemProportion;
    hoardConfig.potionProportion = potionProportion;
    hoardConfig.potionGeneratorConfig = {
      ...Treasure.getDefaultPotionConfig(),
      allowHomebrew: allowPotionHomebrew,
      allowProceduralNames: allowPotionVariations,
    };
    hoardConfig.targetValue = treasureValue * 100;

    const containerTypes = Equipment.generateContainerTypes();
    const containerFilter: Equipment.ContainerFilter = {};
    const filteredContainerTypes = Equipment.filterContainerTypes(containerFilter, containerTypes);

    hoardConfig.allowedContainerTypes = filteredContainerTypes;
    hoardConfig.roomDimensions = {
      width: Measurements.feetToMeters(roomWidth),
      length: Measurements.feetToMeters(roomLength),
      height: Measurements.feetToMeters(roomHeight),
    };

    hoard = Treasure.generateRandomTreasureHoard(seed, hoardConfig);

    containers = Equipment.separateContainersFromItems(hoard).containers;

    const allLooseItems = Equipment.getLooseItems(containers, Equipment.filterOutContainers(hoard));
    const looseGems = allLooseItems.filter(isGem);
    const looseArtObjects = allLooseItems.filter(isArtObject);
    const looseOthers = allLooseItems.filter((i) => !isGem(i) && !isArtObject(i) && !isPotion(i));
    const loosePotions = allLooseItems.filter(isPotion);

    const displayLooseGems = getDisplayItems(looseGems);
    const looseGemStrings = displayLooseGems.map(
      (d) => `${d.name} (Value: ${Currency.valueToString(d.value, Currency.COMMON_FANTASY)})`,
    );

    const looseArtObjectStrings = looseArtObjects.map(
      (i) =>
        `${i.description || i.name} (Value: ${Currency.valueToString(i.value, Currency.COMMON_FANTASY)})`,
    );

    const looseOtherStrings = Equipment.createCombinedDescriptions(looseOthers, true);
    const loosePotionStrings = loosePotions.map(
      (i) => `${i.name} (Value: ${Currency.valueToString(i.value, Currency.COMMON_FANTASY)})`,
    );

    looseItems = [
      ...looseOtherStrings,
      ...loosePotionStrings,
      ...looseArtObjectStrings,
      ...looseGemStrings,
    ];
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath="/fantasy/treasure-hoard" title="Treasure Hoard Generator">
  {#snippet description()}
    <p>This generates a unique treasure hoard.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed inputClass="monospace" />

  <NumberField
    id="value"
    label="Treasure Hoard Value (gp)"
    bind:value={treasureValue}
    min={1}
    max={200000}
  />
  <NumberField
    id="coins"
    label="Proportion of Coins"
    bind:value={coinsProportion}
    min={0}
    max={100}
  />
  <NumberField id="gems" label="Proportion of Gems" bind:value={gemsProportion} min={0} max={100} />
  <NumberField
    id="art"
    label="Proportion of Art Objects"
    bind:value={artProportion}
    min={0}
    max={100}
  />
  <NumberField
    id="mundane"
    label="Proportion of Mundane Items"
    bind:value={mundaneItemProportion}
    min={0}
    max={100}
  />
  <NumberField
    id="magic"
    label="Proportion of Magic Items"
    bind:value={magicItemProportion}
    min={0}
    max={100}
  />
  <NumberField
    id="potions"
    label="Proportion of Potions"
    bind:value={potionProportion}
    min={0}
    max={100}
  />

  {#if potionProportion > 0}
    <div class="input-group">
      <CheckboxField
        id="allowPotionVariations"
        label="Allow Potion Variations"
        bind:checked={allowPotionVariations}
      />
      <CheckboxField
        id="allowPotionHomebrew"
        label="Allow Homebrew Potions"
        bind:checked={allowPotionHomebrew}
      />
    </div>
  {/if}

  <NumberField id="room-width" label="Room Width (ft)" bind:value={roomWidth} min={1} />
  <NumberField id="room-length" label="Room Length (ft)" bind:value={roomLength} min={1} />
  <NumberField id="room-height" label="Room Height (ft)" bind:value={roomHeight} min={1} />

  <BaseButton onclick={generate}>Generate Treasure Hoard</BaseButton>

  <h2>Generated Treasure Hoard</h2>

  {#if hoard.length === 0}
    <p>No treasure hoard generated yet.</p>
  {:else}
    <ul>
      {#each containers as container}
        <li>
          {#if container.contents.length == 0}empty{/if}
          {container.description} (total weight: {formatNumber(
            Measurements.kgToPounds(container.currentWeight + container.weight),
          )} lbs)
          <ul>
            {#each getDisplayItems(Equipment.getContainerContents(container, hoard)) as item}
              <li>{item.name} (Value: {Currency.valueToString(item.value)})</li>
            {/each}
          </ul>
        </li>
      {/each}
      {#each looseItems as item}
        <li>{item}</li>
      {/each}
    </ul>
  {/if}
</GeneratorPage>

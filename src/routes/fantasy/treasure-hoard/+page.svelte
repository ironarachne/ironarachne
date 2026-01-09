<script lang="ts">
  import * as Equipment from '$lib/equipment';
  import { formatNumber } from '$lib/formatting';
  import * as Measurements from '$lib/measurements';
  import * as RNG from '@ironarachne/rng';
  import * as Treasure from '$lib/treasure';
  import * as Words from '@ironarachne/words';
  import * as Currency from '$lib/currency';
  import type { Container, Item } from '$lib/equipment/equipment_types';
  import type { Gem } from '$lib/treasure';
  import { onMount } from 'svelte';

  let rng = new RNG.RNG(Date.now().toString());
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
  let roomWidth = $state(10);
  let roomLength = $state(10);
  let roomHeight = $state(10);
  let hoard: Item[] = $state([]);
  let containers: Container[] = $state([]);
  let looseItems: string[] = $state([]);

  function isGem(item: Item): item is Gem {
    return 'cut' in item;
  }

  function isArtObject(item: Item): boolean {
    return item.itemMinorType === 'art object';
  }

  function getDisplayItems(items: Item[]) {
    const gems = items.filter(isGem);
    const artObjects = items.filter(isArtObject);
    const others = items.filter((i) => !isGem(i) && !isArtObject(i));

    let displayGems: { name: string; value: number }[] = [];

    if (gems.length === 0) {
      // do nothing
    } else if (gems.length < 12) {
      displayGems = gems.map((g) => ({ name: g.name, value: g.value }));
    } else if (gems.length <= 24) {
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
    } else {
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
    const displayOthers = others.map((i) => ({ name: i.name, value: i.value }));

    return [...displayOthers, ...displayArtObjects, ...displayGems];
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
    hoardConfig.targetValue = treasureValue * 100; // convert to cp

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
    const looseOthers = allLooseItems.filter((i) => !isGem(i) && !isArtObject(i));

    const displayLooseGems = getDisplayItems(looseGems);
    const looseGemStrings = displayLooseGems.map((d) => `${d.name} (Value: ${Currency.valueToString(d.value, Currency.COMMON_FANTASY)})`);

    const looseArtObjectStrings = looseArtObjects.map(
      (i) => `${i.description || i.name} (Value: ${Currency.valueToString(i.value, Currency.COMMON_FANTASY)})`,
    );

    const looseOtherStrings = Equipment.createCombinedDescriptions(looseOthers, true);

    looseItems = [...looseOtherStrings, ...looseArtObjectStrings, ...looseGemStrings];
  }

  onMount(() => {
    generate();
  });
</script>

<svelte:head>
  <title>Treasure Hoard Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Treasure Hoard Generator</h1>

  <p>This generates a unique treasure hoard.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" id="seed" bind:value={seed} class="monospace" />
    <label>
      <input type="checkbox" bind:checked={lockSeed} />
      Lock Seed
    </label>
  </div>

  <div class="input-group">
    <label for="value">Treasure Hoard Value (gp)</label>
    <input
      type="number"
      id="value"
      min="1"
      max="200000"
      bind:value={treasureValue}
      class="monospace"
    />
  </div>

  <div class="input-group">
    <label for="coins">Proportion of Coins</label>
    <input
      type="number"
      id="coins"
      min="0"
      max="100"
      bind:value={coinsProportion}
      class="monospace"
    />
  </div>

  <div class="input-group">
    <label for="gems">Proportion of Gems</label>
    <input
      type="number"
      id="gems"
      min="0"
      max="100"
      bind:value={gemsProportion}
      class="monospace"
    />
  </div>

  <div class="input-group">
    <label for="art">Proportion of Art Objects</label>
    <input type="number" id="art" min="0" max="100" bind:value={artProportion} class="monospace" />
  </div>

  <div class="input-group">
    <label for="mundane">Proportion of Mundane Items</label>
    <input
      type="number"
      id="mundane"
      min="0"
      max="100"
      bind:value={mundaneItemProportion}
      class="monospace"
    />
  </div>

  <div class="input-group">
    <label for="magic">Proportion of Magic Items</label>
    <input
      type="number"
      id="magic"
      min="0"
      max="100"
      bind:value={magicItemProportion}
      class="monospace"
    />
  </div>

  <div class="input-group">    <label for="room-width">Room Width (ft)</label>
    <input type="number" id="room-width" min="1" bind:value={roomWidth} class="monospace" />
  </div>

  <div class="input-group">
    <label for="room-length">Room Length (ft)</label>
    <input type="number" id="room-length" min="1" bind:value={roomLength} class="monospace" />
  </div>

  <div class="input-group">
    <label for="room-height">Room Height (ft)</label>
    <input type="number" id="room-height" min="1" bind:value={roomHeight} class="monospace" />
  </div>

  <button onclick={generate}>Generate Treasure Hoard</button>

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
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';
</style>

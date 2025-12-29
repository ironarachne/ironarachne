<script lang="ts">
  import * as Equipment from "$lib/equipment";
  import { formatNumber } from "$lib/formatting";
  import * as Measurements from "$lib/measurements";
  import * as RNG from "@ironarachne/rng";
  import * as Treasure from "$lib/treasure";
  import type { Container, Item } from "$lib/equipment/equipment_types"
  import type { Gem } from "$lib/treasure";
  import { onMount } from "svelte";

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  rng.setSeed(seed);
  let lockSeed = $state(false);
  let treasureValue = $state(200);
  let coinsProportion = $state(80);
  let gemsProportion = $state(15);
  let artProportion = $state(5);
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

  function pluralize(word: string): string {
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    }
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) {
      return word + 'es';
    }
    return word + 's';
  }

  function getDisplayItems(items: Item[]) {
    const gems = items.filter(isGem);
    const artObjects = items.filter(isArtObject);
    const others = items.filter(i => !isGem(i) && !isArtObject(i));

    let displayGems: { name: string, value: number }[] = [];

    if (gems.length === 0) {
      // do nothing
    } else if (gems.length < 12) {
      displayGems = gems.map(g => ({ name: g.name, value: g.value }));
    } else if (gems.length <= 24) {
      const groups = new Map<string, { count: number, value: number }>();
      for (const gem of gems) {
        const entry = groups.get(gem.name) || { count: 0, value: 0 };
        entry.count++;
        entry.value += gem.value;
        groups.set(gem.name, entry);
      }

      for (const [name, data] of groups) {
        displayGems.push({
          name: `${data.count} ${data.count > 1 ? pluralize(name) : name}`,
          value: data.value
        });
      }
    } else {
      const totalValue = gems.reduce((sum, g) => sum + g.value, 0);
      displayGems.push({
        name: `${gems.length} assorted gems`,
        value: totalValue
      });
    }

    const displayArtObjects = artObjects.map(i => ({ name: i.description || i.name, value: i.value }));
    const displayOthers = others.map(i => ({ name: i.name, value: i.value }));

    return [...displayOthers, ...displayArtObjects, ...displayGems];
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
      rng.setSeed(seed);
    }

    const proportions = {
      coins: coinsProportion,
      gems: gemsProportion,
      artObjects: artProportion,
    };

    const containerTypes = Equipment.generateContainerTypes();
    const containerFilter: Equipment.ContainerFilter = {};
    const filteredContainerTypes = Equipment.filterContainerTypes(containerFilter, containerTypes);

    hoard = Treasure.generateRandomTreasureHoard(seed, {
      allowedContainerTypes: filteredContainerTypes,
      artObjectProportion: artProportion,
      coinProportions: {
        copper: coinsProportion,
        silver: 0,
        electrum: 0,
        gold: 0,
        platinum: 0
      },
      gemProportion: gemsProportion,
      roomDimensions: {
        width: Measurements.feetToMeters(roomWidth),
        length: Measurements.feetToMeters(roomLength),
        height: Measurements.feetToMeters(roomHeight),
      },
      targetValue: treasureValue * 100
    });

    containers = Equipment.separateContainersFromItems(hoard).containers;

    const allLooseItems = Equipment.getLooseItems(containers, Equipment.filterOutContainers(hoard));
    const looseGems = allLooseItems.filter(isGem);
    const looseArtObjects = allLooseItems.filter(isArtObject);
    const looseOthers = allLooseItems.filter(i => !isGem(i) && !isArtObject(i));

    const displayLooseGems = getDisplayItems(looseGems);
    const looseGemStrings = displayLooseGems.map(d => `${d.name} (Value: ${d.value / 100} gp)`);

    const looseArtObjectStrings = looseArtObjects.map(i => `${i.description || i.name} (Value: ${i.value / 100} gp)`);

    const looseOtherStrings = Equipment.createCombinedDescriptions(looseOthers, true);

    looseItems = [...looseOtherStrings, ...looseArtObjectStrings, ...looseGemStrings];
  }

  onMount(() => {
    generate();
  });
</script>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';
</style>

<svelte:head>
  <title>Treasure Hoard Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Treasure Hoard Generator</h1>

  <p>This generates a unique treasure hoard.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input
      type="text"
      id="seed"
      bind:value={seed}
      class="monospace"
    />
    <label>
      <input type="checkbox" bind:checked={lockSeed} />
      Lock Seed
    </label>
  </div>

  <div class="input-group">
    <label for="value">Treasure Hoard Value (gp)</label>
    <input type="number" id="value" min="1" max="200000" bind:value={treasureValue} class="monospace">
  </div>

  <div class="input-group">
    <label for="coins">Proportion of Coins</label>
    <input type="number" id="coins" min="0" max="100" bind:value={coinsProportion} class="monospace">
  </div>

  <div class="input-group">
    <label for="gems">Proportion of Gems</label>
    <input type="number" id="gems" min="0" max="100" bind:value={gemsProportion} class="monospace">
  </div>

  <div class="input-group">
    <label for="art">Proportion of Art Objects</label>
    <input type="number" id="art" min="0" max="100" bind:value={artProportion} class="monospace">
  </div>

  <div class="input-group">
    <label for="room-width">Room Width (ft)</label>
    <input type="number" id="room-width" min="1" bind:value={roomWidth} class="monospace">
  </div>

  <div class="input-group">
    <label for="room-length">Room Length (ft)</label>
    <input type="number" id="room-length" min="1" bind:value={roomLength} class="monospace">
  </div>

  <div class="input-group">
    <label for="room-height">Room Height (ft)</label>
    <input type="number" id="room-height" min="1" bind:value={roomHeight} class="monospace">
  </div>

  <button onclick={generate}>Generate Treasure Hoard</button>

  <h2>Generated Treasure Hoard</h2>

  {#if hoard.length === 0}
    <p>No treasure hoard generated yet.</p>
  {:else}
    <ul>
      {#each containers as container}
        <li>
          {#if (container.contents.length == 0)}empty{/if} {container.description} (total weight: {formatNumber(Measurements.kgToPounds(container.currentWeight + container.weight))} lbs)
          <ul>
            {#each getDisplayItems(Equipment.getContainerContents(container, hoard)) as item}
              <li>{item.name} (Value: {item.value / 100} gp)</li>
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

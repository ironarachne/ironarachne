<script lang="ts">
  import * as Currency from "$lib/currency/currency";
  import * as RND from "@ironarachne/rng";
  import * as Words from '@ironarachne/words';
  import random from "random";
  import seedrandom from "seedrandom";
  import * as Dungeons from "$lib/dungeon/dungeons";
  import DungeonTileRenderer from "$lib/dungeon/tilerenderer";
  import { onMount } from "svelte";

  let seed = RND.randomString(13);
  let lockSeed = false;

  let canvas: HTMLCanvasElement;
  let minRooms = 20;
  let maxRooms = 30;

  let config = Dungeons.getDefaultConfig();
  config.minRooms = minRooms;
  config.maxRooms = maxRooms;
  let dungeon = Dungeons.generate(config);
  let renderer = new DungeonTileRenderer(800, 1000, config.height, config.width);

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));

    config.minRooms = minRooms;
    config.maxRooms = maxRooms;

    dungeon = Dungeons.generate(config);
    renderer.render(dungeon, canvas);
  }

  onMount(() => {
    const htmlElement = document.getElementById('mapCanvas');
    if (htmlElement instanceof HTMLCanvasElement) {
      canvas = htmlElement;
    }
    generate();
  });
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';

  div.mobs {
    display: block;
    padding: 0;
    margin: 0;
  }

  div.mob {
    border: 1px solid black;
    padding: 0.5rem;
    margin: 0.5rem;
  }

  div.mob > h4 {
    display: block;
    font-size: 1rem;
    margin: 0;
    padding: 0;
    width: 100%;
    border-bottom: 1px solid black;
  }

  div.room-description {
    border: 3px solid black;
    padding: 0.5rem;
    margin: 0.5rem;
  }

  div.room-secrets {
    padding: 0.5rem;
  }
</style>

<svelte:head>
  <title>Dungeon Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Dungeon Generator</h1>

  <p>A dungeon generator.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>

  <div class="input-group">
    <label for="minRooms">Min. Rooms</label>
    <input type="number" name="minRooms" bind:value={minRooms} id="minRooms"/>
  </div>

  <div class="input-group">
    <label for="maxRooms">Max. Rooms</label>
    <input type="number" name="maxRooms" bind:value={maxRooms} id="maxRooms"/>
  </div>

  <button on:click={generate}>Generate</button>

  <h2>{dungeon.name}</h2>

  <p><strong>Environment:</strong> {dungeon.environment}</p>
  <p><strong>Total Threat Level:</strong> {dungeon.totalThreatLevel}</p>
  <p><strong>Average Threat Level:</strong> {dungeon.averageThreatLevel}</p>

  <canvas id="mapCanvas" width="800" height="1000"></canvas>

  {#each dungeon.rooms as room }
  <div class="room">
    <h3>{room.id + 1}. {Words.title(room.name)}</h3>
    {#if room.lightLevel == 0}<p>This room is dark.</p>{/if}
    <div class="room-description">
      {room.description}
      {#each room.features as feature}
      {feature.description + ' '}
      {/each}
    </div>
    {#if room.secrets != ''}
    <div class="room-secrets">
      {room.secrets}
    </div>
    {/if}
    <div class="encounter">
      {#each room.encounters as encounter}
        {#each encounter.groups as group}
        <p>There {#if group.mobs.length > 1}are {group.mobs.length}{:else}is {Words.article(group.name)}{/if} {group.name} here.</p>
        <div class="mobs">
          {#each group.mobs as mob}
          <div class="mob">
            <h4>{mob.name}, {mob.summary} (TL {mob.threatLevel})</h4>
            {#if mob.abilities.length > 0}
            <p>Abilities:</p>
            <ul>
              {#each mob.abilities as ability}
              <li><strong>{ability.name}:</strong> {ability.description}</li>
              {/each}
            </ul>
            {/if}
            {#if mob.carried.length > 0}
            <p>Carrying the following:</p>
            <ul>
              {#each mob.carried as item}
              <li>{item.description}, worth {Currency.valueToCoins(item.value, false, false, false)}</li>
              {/each}
            </ul>
            {/if}
          </div>
          {/each}
        </div>
        {/each}
      {/each}
    </div>
    {#if room.treasureCaches.length > 0}
    <div class="treasure">
      <h4>Treasure</h4>
      <ul>
        {#each room.treasureCaches as cache}
        <li>{cache}</li>
        {/each}
      </ul>
    </div>
    {/if}
  </div>
  {/each}
</section>

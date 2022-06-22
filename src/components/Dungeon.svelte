<script lang="ts">
  import * as Currency from "../modules/currency/currency";
  import * as RND from "../modules/random";
  import * as Words from '../modules/words';

  import random from "random";
  import seedrandom from "seedrandom";
  import DungeonGeneratorConfig from "../modules/dungeon/dungeongeneratorconfig";
  import DungeonGenerator from "../modules/dungeon/dungeongenerator";
  import DungeonTileRenderer from "../modules/dungeon/tilerenderer";
  import { onMount } from "svelte";

  let seed = RND.randomString(13);

  let canvas = null;

  let config = new DungeonGeneratorConfig();
  let generator = new DungeonGenerator(config);
  let dungeon = generator.generate();
  let renderer = new DungeonTileRenderer(800, 1000, config.height, config.width);

  function generate() {
    random.use(seedrandom(seed));

    dungeon = generator.generate();
    renderer.render(dungeon, canvas);
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  onMount(() => {
    canvas = <HTMLCanvasElement> document.getElementById('mapCanvas');
    newSeed();
  });
</script>

<style>
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
</style>

<svelte:head>
  <title>Dungeon Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Dungeon Generator</h2>

  <p>A dungeon generator.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{dungeon.name}</h2>

  <p><strong>Environment:</strong> {dungeon.environment}</p>
  <p><strong>Total Threat Level:</strong> {dungeon.totalThreatLevel}</p>
  <p><strong>Average Threat Level:</strong> {dungeon.averageThreatLevel}</p>

  <canvas id="mapCanvas" width="800" height="1000"></canvas>

  {#each dungeon.rooms as room }
  <div class="room">
    <h3>{room.id + 1}. {Words.title(room.name)}</h3>
    <p>
      {room.description}
      {#each room.features as feature}
      {feature.description + ' '}
      {/each}
    </p>
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
              <li>{ability}</li>
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

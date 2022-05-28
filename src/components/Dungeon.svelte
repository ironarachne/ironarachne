<script lang="ts">
  import * as RND from "../modules/random";

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

  <canvas id="mapCanvas" width="800" height="1000"></canvas>

  {#each dungeon.rooms as room }
  <div class="room">
    <h3>Room {room.id + 1}</h3>
    <p>{room.description}</p>
    {#each room.features as feature}
    <p>{feature}</p>
    {/each}
  </div>
  {/each}
</section>

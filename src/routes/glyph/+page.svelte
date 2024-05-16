<script lang="ts">
  import type GlyphGeneratorConfig from "$lib/glyphs/generator.config";
  import type Glyph from "$lib/glyphs/glyph";
  import * as Glyphs from "$lib/glyphs/glyphs";
  import type GlyphRenderConfig from "$lib/glyphs/render_config";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";
  import { onMount } from "svelte";

  const imageWidth = 64;
  const imageHeight = 64;

  let seed = "henryjonesjr";
  let glyphs: Glyph[] = [];
  let numGlyphs = 1;

  let generatorConfig: GlyphGeneratorConfig = {
    gridSize: 5,
    numberOfRadicals: 1,
    minNumberOfStrokesPerRadical: 3,
    maxNumberOfStrokesPerRadical: 5,
    sharpness: 0.7
  };

  let renderConfig: GlyphRenderConfig = {
    width: imageWidth,
    height: imageHeight,
    gridSize: 5,
    color: "black",
    weight: 3
  };

  function generate() {
    random.use(seedrandom(seed));

    glyphs = [];

    for (let i = 0; i < numGlyphs; i++) {
      let glyph = Glyphs.generate(generatorConfig);
      glyph.image = Glyphs.render(glyph, renderConfig);
      glyphs.push(glyph);
    }
  }

  function newSeed() {
    //seed = RND.randomString(13);
    generate();
  }

  onMount(() => {
    newSeed();
  });
</script>

<style lang="scss">
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';

  .glyphs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .glyph {
    width: 64px;
    height: 64px;
    margin: 0 auto;
    border: 1px solid gray;
  }
</style>

<section class="fantasy main">
  <h1>Glyph Generator</h1>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>

  <div class="input-group">
    <label for="sharpness">Sharpness</label>
    <input type="number" name="sharpness" step="0.1" bind:value={generatorConfig.sharpness} id="sharpness" />
  </div>

  <div class="input-group">
    <label for="numGlyphs">Number of Glyphs</label>
    <input type="number" name="numGlyphs" bind:value={numGlyphs} id="numGlyphs" />
  </div>

  <div class="input-group">
    <label for="minStrokes">Min. Strokes</label>
    <input type="number" name="minStrokes" bind:value={generatorConfig.minNumberOfStrokesPerRadical} id="minStrokes" />
  </div>

  <div class="input-group">
    <label for="maxStrokes">Max. Strokes</label>
    <input type="number" name="maxStrokes" bind:value={generatorConfig.maxNumberOfStrokesPerRadical} id="maxStrokes" />
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  {#if glyphs.length > 0}
    <h2>Glyphs</h2>
    <div class="glyphs">
    {#each glyphs as glyph}
      <div class="glyph"><img alt="glyph for { glyph.represents }" src="{ glyph.image }" /></div>
    {/each}
    </div>
  {/if}

</section>

<svelte:head>
  <title>Glyph Generator | Iron Arachne</title>
</svelte:head>

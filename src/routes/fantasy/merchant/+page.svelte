<script lang="ts">
  import * as Currency from "$lib/currency";
  import * as Merchant from "$lib/merchant";
  import * as RND from "@ironarachne/rng";
  import * as Words from "@ironarachne/words";
  import random from "random";
  import seedrandom from "seedrandom";

  let category = $state('general');
  let valueThreshold = $state(50);
  let categories = [
    'armor',
    'clothing',
    'general',
    'weapon',
  ];
  let merchant = $state(Merchant.generate(category, valueThreshold));
  let seed = $state(RND.randomString(13));
  let lockSeed = false;

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));

    merchant = Merchant.generate(category, valueThreshold);
  }
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';
</style>

<svelte:head>
  <title>Fantasy Merchant Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Merchant Generator</h1>

  <p>This generates a fantasy merchant and a list of their wares.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <div class="input-group">
    <label for="value">Material Rarity Threshold</label>
    <select name="value" bind:value={valueThreshold}>
      <option value="50">Common</option>
      <option value="100">Rare</option>
      <option value="10000">Legendary</option>
    </select>
  </div>

  <div class="input-group">
    <label for="value">Type of Goods</label>
    <select name="value" bind:value={category}>
      {#each categories as cat}
      <option>{cat}</option>
      {/each}
    </select>
  </div>

  <button onclick={generate}>Generate From Seed</button>
  <button onclick={newSeed}>Random Seed (and Generate)</button>

  <p>{ merchant.description } { Words.capitalize(merchant.character.gender.possessivePronoun) } wares include:</p>

  <h2>Stock List</h2>

  {#each merchant.wares as item}
    <h4>{Words.capitalize(item.name)}</h4>
    <p>{Words.capitalize(item.description)}.</p>
    <p><strong>Cost:</strong> {Currency.convertCopper(Math.floor(item.value * merchant.priceVariance), false, false, false)}</p>
  {/each}
</section>

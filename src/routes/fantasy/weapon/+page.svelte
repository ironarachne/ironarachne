<script lang="ts">
  import * as Domains from "$lib/religion/domains/domains";
  import * as Weapon from "$lib/equipment/weapon";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";

  let themes = Domains.getAllDomainNames().sort();
  let categories = Weapon.getAllWeaponCategories().sort();
  let category = "any";
  let theme = "any";
  let seed = RND.randomString(13);
  let weapon = Weapon.generate(category, theme);

  function generate() {
    random.use(seedrandom(seed));
    weapon = Weapon.generate(category, theme);
    weapon.description = weapon.name + " is " + weapon.description;
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  newSeed();
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';
</style>

<svelte:head>
  <title>Magic Weapon Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Magic Weapon Generator</h1>

  <p>This generates a unique magical weapon.</p>

  <div class="input-group">
    <label for="theme">Theme</label>
    <select name="theme" bind:value={theme} id="theme">
      <option>any</option>
      {#each themes as item}
        <option>{item}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="category">Category</label>
    <select name="category" bind:value={category} id="category">
      <option>any</option>
      {#each categories as item}
        <option>{item}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{weapon.name}</h2>

  <p>{weapon.description}. It {weapon.effect}.</p>
</section>

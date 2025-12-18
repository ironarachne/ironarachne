<script lang="ts">
import * as Domains from "$lib/religion/domains/domains";
import * as Weapon from "$lib/equipment/weapon";
import * as RNG from "@ironarachne/rng";

const themes = Domains.getAllDomainNames().sort();
const categories = Weapon.getAllWeaponCategories().sort();

let rng = new RNG.RNG(Date.now().toString());
let seed = $state(rng.randomString(13));
rng.setSeed(seed);
let lockSeed = $state(false);

let category = $state("any");
let theme = $state("any");
let weapon = $state(Weapon.generate(category, theme, rng));

function generate() {
  if (!lockSeed) {
    seed = rng.randomString(13);
  }
  rng.setSeed(seed);
  weapon = Weapon.generate(category, theme, rng);
  weapon.description = `${weapon.name} is ${weapon.description}`;
}

generate();
</script>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';
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
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>

  <h2>{weapon.name}</h2>

  <p>{weapon.description}. It {weapon.effect}.</p>
</section>

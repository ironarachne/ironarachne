<script lang="ts">
  import { domains } from '$lib/religion/domains';
  import * as Equipment from '$lib/equipment/index';
  import * as RNG from '@ironarachne/rng';
  import { getDefaultGenerationConfig } from '$lib/equipment/generation';

  const themes = domains.map((domain) => domain.name).sort();
  const categories = ['any', 'melee', 'ranged'];

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let category = $state('any');
  let theme = $state('any');
  let weapon = $state(generateWeapon('any', 'any', rng));

  function generateWeapon(cat: string, thm: string, genRng: RNG.RNG) {
    let domainName = thm;
    if (thm === 'any') {
      domainName = genRng.item(domains).name;
    }

    const config = getDefaultGenerationConfig();
    config.itemMajorType = 'weapon';
    config.enchantments = Equipment.filterEnchantmentsByTags([domainName], Equipment.ENCHANTMENTS);
    config.decorations = Equipment.filterDecorationsByTags([domainName], Equipment.DECORATIONS);
    config.enchantmentChance = 100;
    config.decorationChance = 100;
    config.useUniqueNames = true;

    if (cat !== 'any') {
      config.itemMinorType = cat;
    }

    const newWeapon = Equipment.generateItem(seed, config);

    return newWeapon;
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    weapon = generateWeapon(category, theme, rng);
  }

  generate();
</script>

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
      {#each categories as item}
        <option>{item}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>

  <h2>{weapon.uniqueName}</h2>

  <p>{weapon.description}</p>
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';
</style>

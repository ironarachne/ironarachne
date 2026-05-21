<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import AdndCharacterSheet from '$lib/adnd/adnd_character_sheet.svelte';
  import ADNDCharacterGenerator from '$lib/adnd/adndcharactergenerator';
  import ADNDCharacterGeneratorConfig from '$lib/adnd/adndcharactergeneratorconfig';
  import type ADNDCharacter from '$lib/adnd/adndcharacter';

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let includeProficiencies = $state(false);
  let includeKits = $state(false);
  let lastIncludeProficiencies = $state(false);
  let lastIncludeKits = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  let genConfig;
  let charGen;
  let character: ADNDCharacter | undefined = $state();

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    genConfig = new ADNDCharacterGeneratorConfig();
    genConfig.rng = rng;
    genConfig.includeProficiencies = includeProficiencies;
    genConfig.includeKits = includeKits;
    lastIncludeProficiencies = includeProficiencies;
    lastIncludeKits = includeKits;
    charGen = new ADNDCharacterGenerator(genConfig);
    character = charGen.generateCharacter();
  }

  generate();
</script>

<svelte:head>
  <title>AD&amp;D 2e Character Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>AD&amp;D 2e Character Generator</h1>

  <p>This is an AD&amp;D 2e character generator.</p>

  <p>
    <a href="/fantasy/adnd/character/build">User-directed character builder</a> (dice for attributes only).
  </p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <input
      type="checkbox"
      name="includeProficiencies"
      bind:checked={includeProficiencies}
      id="includeProficiencies"
    />
    <label for="includeProficiencies">Include proficiencies (weapon and nonweapon)</label>
  </div>

  <div class="input-group">
    <input type="checkbox" name="includeKits" bind:checked={includeKits} id="includeKits" />
    <label for="includeKits">Include character kit (optional sub-archetype)</label>
  </div>

  <button onclick={generate}>Generate</button>

  {#if character}
    <AdndCharacterSheet {character} />
  {/if}
</section>

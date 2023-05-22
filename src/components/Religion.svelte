<script>
  import * as RND from "../modules/random";
  import ReligionGeneratorConfig from "../modules/religion/generatorconfig";
  import ReligionGenerator from "../modules/religion/generator";
  import { savedCulture } from "../modules/stores";
  import HumanSet from '../modules/names/races/human';

  import random from "random";
  import seedrandom from "seedrandom";

  let useSavedCulture = false;
  let loadedCulture = null;
  let humanNameGenSet = new HumanSet();

  savedCulture.subscribe(value => {
    loadedCulture = value;
  });

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let genConfig = new ReligionGeneratorConfig();
  let generator = new ReligionGenerator(genConfig);
  let religion = generator.generate();

  function generate() {
    random.use(seedrandom(seed));
    if (useSavedCulture == true) {
      generator.config.nameGenerator = loadedCulture.generatorSet.family;
      generator.config.femaleNameGenerator = loadedCulture.generatorSet.female;
      generator.config.maleNameGenerator = loadedCulture.generatorSet.male;
    } else {
      generator.config.nameGenerator = humanNameGenSet.family;
      generator.config.femaleNameGenerator = humanNameGenSet.female;
      generator.config.maleNameGenerator = humanNameGenSet.male;
    }
    religion = generator.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<svelte:head>
  <title>Religion Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Religion Generator</h1>

  <p>Generate a fictional fantasy religion.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>

  <div class="input-group">
    <label for="useSavedCulture">Use Saved Culture</label>
    <input type="checkbox" name="useSavedCulture" id="useSavedCulture" bind:checked={useSavedCulture} disabled={loadedCulture == null} />
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{religion.name}</h2>

  <p>{religion.description}</p>

  <h3>Realms</h3>

  {#each religion.realms as realm}
    <div>
      <h4>{realm.name}</h4>
      <p>{realm.description}</p>
    </div>
  {/each}

  <h3>Deities</h3>

  <p>{religion.pantheon.description}</p>

  {#each religion.pantheon.members as member}
    <div>
      <h4>{member.deity.name}</h4>

      <p>{member.deity.titles.join(",")}</p>

      <p><strong>Holy Item:</strong> {member.deity.holyItem}</p>
      <p><strong>Holy Symbol:</strong> {member.deity.holySymbol}</p>

      <p>{member.deity.description}</p>
    </div>
  {/each}
</section>

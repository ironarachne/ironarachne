<script lang="ts">
  import * as RND from "../modules/random";
  import * as CultureNames from "../modules/names/cultures";

  import random from "random";
  import seedrandom from "seedrandom";
  import CultureGeneratorConfig from "../modules/culture/generatorconfig";
  import CultureGenerator from "../modules/culture/generator";

  let seed = RND.randomString(13);
  let genConfig = new CultureGeneratorConfig();
  let genSet = CultureNames.randomGenSet();
  genConfig.generatorSet = genSet;
  let generator = new CultureGenerator(genConfig);
  let culture = generator.generate();

  function generate() {
    random.use(seedrandom(seed));
    genSet = CultureNames.randomGenSet();
    generator.config.generatorSet = genSet;
    culture = generator.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<svelte:head>
  <title>Culture Generator | Iron Arachne</title>
</svelte:head>

<style>
  .namelist {
    display: grid;
    grid-template-columns: auto auto auto;
    align-items: start;
    justify-items: center;
  }
</style>

<section class="fantasy main">
  <h1>Culture Generator</h1>
  <p>This generator lets you create fantasy cultures.</p>
  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>The { culture.name } Culture</h2>

  <h3>Common Names</h3>

  <div class="namelist">
    <div>
      <h5>Male Names</h5>
      <ul>
      {#each culture.maleNames as name}
        <li>{ name }</li>
      {/each}
      </ul>
    </div>
    <div>
      <h5>Female Names</h5>
      <ul>
        {#each culture.femaleNames as name}
      <li>{ name }</li>
      {/each}
      </ul>
    </div>
    <div>
      <h5>Family Names</h5>
      <ul>
        {#each culture.familyNames as name}
        <li>{ name }</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="namelist">
    <div>
      <h5>Country Names</h5>

      <ul>
        {#each culture.countryNames as name}
        <li>{ name }</li>
        {/each}
      </ul>
    </div>
    <div>
      <h5>Town Names</h5>

      <ul>
        {#each culture.townNames as name}
        <li>{ name }</li>
        {/each}
      </ul>
    </div>
  </div>



  <h3>Organization</h3>

  <p>{ culture.organization.description }</p>

  <h3>Religion</h3>

  <p>{ culture.religion.description }</p>

  <h3>Taboos</h3>

  {#each culture.taboos as taboo}
  <p>{taboo}</p>
  {/each}

  <h3>Greetings</h3>

  <p>{ culture.greeting }</p>

  <h3>Meals</h3>

  <p>{ culture.eatingTrait }</p>

  <h3>Design</h3>

  <p>{ culture.designTrait }</p>

  <h3>Music</h3>

  <p>{ culture.musicStyle.description }</p>
</section>

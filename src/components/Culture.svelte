<script lang="ts">
  import * as RND from "../modules/random";
  import * as Culture from "../modules/culture/culture";

  import random from "random";
  import seedrandom from "seedrandom";

  let culture = {};
  let seed = RND.randomString(13);

  function generateCulture() {
    random.use(seedrandom(seed));
    culture = Culture.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generateCulture();
  }

  newSeed();
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
  <h2>Culture Generator</h2>
  <p>This generator lets you create fantasy cultures.</p>
  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>
  <button on:click={generateCulture}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h3>The { culture.name } Culture</h3>

  <h4>Common Names</h4>

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

  <h4>Organization</h4>

  <p>{ culture.organization.description }</p>

  <h4>Religion</h4>

  <p>{ culture.religion.description }</p>

  <h4>Taboos</h4>

  {#each culture.taboos as taboo}
  <p>{taboo}</p>
  {/each}

  <h4>Greetings</h4>

  <p>{ culture.greeting }</p>

  <h4>Meals</h4>

  <p>{ culture.eatingTrait }</p>

  <h4>Design</h4>

  <p>{ culture.designTrait }</p>

  <h4>Music</h4>

  <p>{ culture.musicStyle.description }</p>
</section>

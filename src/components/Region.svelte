<script lang="ts">
  import * as RND from "../modules/random";
  import * as Region from "../modules/region";

  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let region = Region.generate();

  function generate() {
    random.use(seedrandom(seed));
    region = Region.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<svelte:head>
  <title>Region Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Region Generator</h2>

  <p>Generate fantasy regions.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <p>{region.description}</p>
  <h3>Notable Towns</h3>
  {#each region.towns as town}
    <article>
      <h4>{town.name}</h4>
      <p>{town.description}</p>
    </article>
  {/each}
  <h3>Notable Organizations</h3>
  {#each region.organizations as organization}
    <article>
      <h4>{organization.name}</h4>
      <p>{organization.description}</p>
    </article>
  {/each}
</section>

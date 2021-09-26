<script>
  import * as RND from "../modules/random";
  import * as FantasyReligion from "../modules/religion/generator";

  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let religion = FantasyReligion.generate();

  function generate() {
    random.use(seedrandom(seed));
    religion = FantasyReligion.generate();
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
  <h2>Fantasy Religion Generator</h2>

  <p>Generate a fictional fantasy religion.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
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

  {#each religion.pantheon.deities as deity}
    <div>
      <h4>{deity.name}</h4>

      <p>{deity.titles.join(",")}</p>

      <p><strong>Holy Item:</strong> {deity.holyItem}</p>
      <p><strong>Holy Symbol:</strong> {deity.holySymbol}</p>

      <p>{deity.description}</p>
    </div>
  {/each}
</section>

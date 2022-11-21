<script lang="ts">
  import * as ArmsManufacturer from "../modules/armsmanufacturer";
  import * as RND from "../modules/random";
  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let manufacturer = ArmsManufacturer.generate();

  function generate() {
    seed = RND.randomString(13);
    random.use(seedrandom(seed));
    manufacturer = ArmsManufacturer.generate();
  }
</script>

<svelte:head>
  <title>Arms Manufacturer Generator | Iron Arachne</title>
</svelte:head>

<section class="scifi main">
  <h1>Arms Manufacturer Generator</h1>
  <p>This generator produces sci-fi arms manufacturing companies.</p>
  <button on:click={generate}>Generate</button>
  <p>{ manufacturer.description }</p>
  <h2>Models</h2>
  {#each manufacturer.models as model}
  <div>
    <h3>{model.name}</h3>
    <p>{model.description}</p>
  </div>
  {/each}
</section>

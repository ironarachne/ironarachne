<script lang="ts">
  import * as ChopShop from "../modules/chopshop";
  import * as RND from "../modules/random";
  import random from "random";
  import seedrandom from "seedrandom";

  let description = "";
  let seed = RND.randomString(13);

  function generateChopShop() {
    seed = RND.randomString(13);
    random.use(seedrandom(seed));
    description = ChopShop.generate();
  }

  generateChopShop();
</script>

<svelte:head>
  <title>Chop Shop Generator | Iron Arachne</title>
</svelte:head>

<section class="cyberpunk main">
  <h2>Chop Shop Generator</h2>
  <p>This is a cyberpunk chop shop generator.</p>
  <button on:click={generateChopShop}>Generate</button>
  <p>{ description }</p>
</section>

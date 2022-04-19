<script lang="ts">
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";
  import LanguageGeneratorConfig from "../modules/languages/generatorconfig";
  import LanguageGenerator from "../modules/languages/generator";

  let seed = RND.randomString(13);
  let genConfig = new LanguageGeneratorConfig();
  let generator = new LanguageGenerator(genConfig);
  let language = generator.generate();

  function generate() {
    random.use(seedrandom(seed));
    language = generator.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<svelte:head>
  <title>Language Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Language Generator</h2>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{language.name}</h2>

  <p>{language.description}</p>

</section>

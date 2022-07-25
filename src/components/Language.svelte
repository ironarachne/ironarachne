<script lang="ts">
  import * as RND from "../modules/random";
  import LanguageGeneratorConfig from "../modules/languages/generatorconfig";
  import LanguageGenerator from "../modules/languages/generator";
  import random from "random";
  import seedrandom from "seedrandom";

  let language;
  let gen;
  let config;
  let seed = RND.randomString(13);

  function generate() {
    seed = RND.randomString(13);
    random.use(seedrandom(seed));
    config = new LanguageGeneratorConfig();
    gen = new LanguageGenerator(config);
    language = gen.generate();
  }

  generate();
</script>

<svelte:head>
  <title>Chop Shop Generator | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h2>Language Generator</h2>
  <p>This generates fictional languages. This is mostly useful for debugging.</p>
  <button on:click={generate}>Generate</button>

  <h2>{language.name}</h2>

  <h3>{language.name} Dictionary</h3>
  {#each language.lexicon.words as word}
    <p>{word.root} ({word.speechPart}): "{word.meaning}"</p>
  {/each}
</section>

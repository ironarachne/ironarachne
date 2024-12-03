<script lang="ts">
  import * as RND from "@ironarachne/rng";
  import LanguageGeneratorConfig from "$lib/languages/generatorconfig";
  import LanguageGenerator from "$lib/languages/generator";
  import random from "random";
  import seedrandom from "seedrandom";
  import type Language from "$lib/languages/language";
  let language: Language = $state();
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

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';
</style>

<svelte:head>
  <title>Language Generator | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h1>Language Generator</h1>
  <p>This generates fictional languages. This is mostly useful for debugging.</p>
  <button onclick={generate}>Generate</button>

  <h2>{language.name}</h2>

  <h3>{language.name} Dictionary</h3>

  <h4>Pronouns</h4>
  {#each language.lexicon.getWordsBySpeechPart('pronoun') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Articles</h4>
  {#each language.lexicon.getWordsBySpeechPart('article') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Prepositions</h4>
  {#each language.lexicon.getWordsBySpeechPart('preposition') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Numbers</h4>
  {#each language.lexicon.getWordsBySpeechPart('number') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Questions</h4>
  {#each language.lexicon.getWordsBySpeechPart('question') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Interjections</h4>
  {#each language.lexicon.getWordsBySpeechPart('interjection') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Adverbs</h4>
  {#each language.lexicon.getWordsBySpeechPart('adverb') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Adjectives</h4>
  {#each language.lexicon.getWordsBySpeechPart('adjective') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Verbs</h4>
  {#each language.lexicon.getWordsBySpeechPart('verb') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}

  <h4>Nouns</h4>
  {#each language.lexicon.getWordsBySpeechPart('noun') as word}
    <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
  {/each}
</section>

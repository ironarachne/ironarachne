<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import {
    applyMorphologicalAffix,
    generateConstructedLanguage,
    getDefaultLanguageGeneratorConfig,
    getLexiconWordsBySpeechPart,
    translateConstructedLanguageSentenceToEnglish,
    translateEnglishSentenceToConstructedLanguage,
    type ConstructedLanguage,
  } from '$lib/languages';

  let language: ConstructedLanguage | undefined = $state();
  let englishTranslationInput = $state('the cat sees a dog');
  let conlangTranslationInput = $state('');
  let englishToConlangResult = $state('');
  let conlangToEnglishResult = $state('');

  function runEnglishToConlang() {
    if (!language) {
      return;
    }
    const out = translateEnglishSentenceToConstructedLanguage(englishTranslationInput, language);
    englishToConlangResult = out.ok ? out.text : out.message;
  }

  function runConlangToEnglish() {
    if (!language) {
      return;
    }
    const out = translateConstructedLanguageSentenceToEnglish(conlangTranslationInput, language);
    conlangToEnglishResult = out.ok ? out.text : out.message;
  }

  function generate() {
    const seed = new RNG(Date.now().toString()).randomString(13);
    const rng = new RNG(seed);
    const config = getDefaultLanguageGeneratorConfig(rng);
    language = generateConstructedLanguage(config);
    englishToConlangResult = '';
    conlangToEnglishResult = '';
    conlangTranslationInput = '';
  }

  generate();
</script>

<svelte:head>
  <title>Language Generator | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h1>Language Generator</h1>
  <p>This generates fictional languages. This is mostly useful for debugging.</p>
  <button onclick={generate}>Generate</button>

  {#if language}
    <h2>{language.name}</h2>
    <p><strong>Word order:</strong> {language.wordOrder}</p>
    <p><strong>Article system:</strong> {language.articleSystem}</p>
    <p><strong>Possession strategy:</strong> {language.possessionStrategy.kind}</p>
    <p><strong>Syllable template:</strong> {language.syllableProfile}</p>
    <p><strong>Orthography:</strong> {language.orthographySummary}</p>
    <p>
      <strong>Sample morphology:</strong>
      plural {language.morphology.pluralPlacement}
      <code>{language.morphology.pluralAffix}</code>
      · past {language.morphology.pastPlacement}
      <code>{language.morphology.pastAffix}</code>
    </p>

    <h3>Simple sentence translation</h3>
    <p>
      Transitive and intransitive clauses using lexicon nouns, verbs, articles, and pronouns.
      English input is SVO; conlang output follows this language’s word order. Conlang→English
      expects tokens in that same order.
    </p>
    <div>
      <label for="en-to-con">English → {language.name}</label>
      <input id="en-to-con" type="text" bind:value={englishTranslationInput} />
      <button type="button" onclick={runEnglishToConlang}>Translate</button>
      <p><code>{englishToConlangResult}</code></p>
    </div>
    <div>
      <label for="con-to-en">{language.name} → English</label>
      <input id="con-to-en" type="text" bind:value={conlangTranslationInput} />
      <button type="button" onclick={runConlangToEnglish}>Translate</button>
      <p><code>{conlangToEnglishResult}</code></p>
    </div>

    <h3>{language.name} Dictionary</h3>

    <h4>Pronouns</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'pronoun') as word, i (`pronoun-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Articles</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'article') as word, i (`article-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Prepositions</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'preposition') as word, i (`preposition-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Numbers</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'number') as word, i (`number-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Questions</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'question') as word, i (`question-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Interjections</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'interjection') as word, i (`interjection-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Adverbs</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'adverb') as word, i (`adverb-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Adjectives</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'adjective') as word, i (`adjective-${i}`)}
      <p>{word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}"</p>
    {/each}

    <h4>Verbs</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'verb') as word, i (`verb-${i}`)}
      <p>
        {word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}" · past:
        {applyMorphologicalAffix(
          word.root,
          language.morphology.pastAffix,
          language.morphology.pastPlacement,
        )}
      </p>
    {/each}

    <h4>Nouns</h4>
    {#each getLexiconWordsBySpeechPart(language.lexicon, 'noun') as word, i (`noun-${i}`)}
      <p>
        {word.root} ({word.speechPart}, /{word.pronunciation}/): "{word.meaning}" · plural:
        {applyMorphologicalAffix(
          word.root,
          language.morphology.pluralAffix,
          language.morphology.pluralPlacement,
        )}
      </p>
    {/each}
  {/if}
</section>

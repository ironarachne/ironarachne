<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import BaseButton from '$components/common/BaseButton.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import {
    applyMorphologicalAffix,
    articleDescription,
    getLexiconWordsBySpeechPart,
    glossaryLine,
    languageDisplayName,
    languageFileStem,
    languageToMarkdown,
    languageToText,
    possessionDescription,
    rollLanguage,
    speechPartHeading,
    toLanguageSnapshot,
    translateConstructedLanguageSentenceToEnglish,
    translateEnglishSentenceToConstructedLanguage,
    LANGUAGE_ARTIFACT_KIND,
    type LanguageSnapshot,
  } from '$lib/languages';

  const TOOL_PATH = '/language';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. This tool failed requirement 2.3
   * outright rather than 2.2's usual reseeding fault: there was no seed control at all, and
   * `generate()` drew a fresh seed from `Date.now()` every press — so a language a user liked could
   * not be got back, because there was nothing to write down.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  /**
   * The language on screen, held as its stored form.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array and object in a
   * Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so saving
   * fails with `could not be cloned`. This is also the largest payload on the site: a lexicon of
   * 1,760 words is 1,760 Proxies the page would otherwise be creating on every render.
   */
  let language = $state.raw<LanguageSnapshot | null>(null);

  let englishTranslationInput = $state('the cat sees a dog');
  let conlangTranslationInput = $state('');
  let englishToConlangResult = $state('');
  let conlangToEnglishResult = $state('');

  /** The parts of speech the glossary prints, in the order the dictionary reads. */
  const GLOSSARY_PARTS = [
    'pronoun',
    'article',
    'preposition',
    'number',
    'question',
    'interjection',
    'adverb',
    'adjective',
    'verb',
    'noun',
  ];

  function runEnglishToConlang() {
    if (language === null) return;
    const out = translateEnglishSentenceToConstructedLanguage(englishTranslationInput, language);
    englishToConlangResult = out.ok ? out.text : out.message;
  }

  function runConlangToEnglish() {
    if (language === null) return;
    const out = translateConstructedLanguageSentenceToEnglish(conlangTranslationInput, language);
    conlangToEnglishResult = out.ok ? out.text : out.message;
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    language = toLanguageSnapshot(rollLanguage(seed));
    englishToConlangResult = '';
    conlangToEnglishResult = '';
    conlangTranslationInput = '';
  }

  function exportMarkdown() {
    if (language === null) return;
    downloadTextFile(
      languageToMarkdown(language),
      `${languageFileStem(language)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (language === null) return;
    await downloadTextPdf(
      languageDisplayName(language),
      languageToText(language),
      `${languageFileStem(language)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Language Generator">
  {#snippet description()}
    <p>
      Generate a constructed language: a phonology, a syllable template, a morphology, and a lexicon
      of about 1,700 words, with simple two-way translation.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={LANGUAGE_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={language}
    {seed}
    defaultName={language === null ? '' : languageDisplayName(language)}
  />

  {#if language}
    <h2>{languageDisplayName(language)}</h2>

    <div class="language-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
    </div>

    <StatBlock>
      <Stat label="Word order">{language.wordOrder}</Stat>
      <Stat label="Phoneme set">{language.phonemeSetName}</Stat>
      <Stat label="Syllable template">{language.syllableProfile}</Stat>
    </StatBlock>

    <p>{articleDescription(language)}</p>
    <p>{possessionDescription(language)}</p>
    <p>{language.orthographySummary}</p>

    <Stat label="Sample morphology">
      plural {language.morphology.pluralPlacement}
      <code>{language.morphology.pluralAffix}</code>
      · past {language.morphology.pastPlacement}
      <code>{language.morphology.pastAffix}</code>
    </Stat>

    <h3>Simple sentence translation</h3>
    <p>
      Transitive and intransitive clauses using lexicon nouns, verbs, articles, and pronouns.
      English input is SVO; conlang output follows this language's word order. Conlang→English
      expects tokens in that same order.
    </p>
    <div class="input-group">
      <label for="en-to-con">English → {language.name}</label>
      <input id="en-to-con" type="text" bind:value={englishTranslationInput} />
      <BaseButton onclick={runEnglishToConlang}>Translate to {language.name}</BaseButton>
      {#if englishToConlangResult !== ''}
        <p role="status"><code>{englishToConlangResult}</code></p>
      {/if}
    </div>
    <div class="input-group">
      <label for="con-to-en">{language.name} → English</label>
      <input id="con-to-en" type="text" bind:value={conlangTranslationInput} />
      <BaseButton onclick={runConlangToEnglish}>Translate to English</BaseButton>
      {#if conlangToEnglishResult !== ''}
        <p role="status"><code>{conlangToEnglishResult}</code></p>
      {/if}
    </div>

    <h3>{languageDisplayName(language)} Dictionary</h3>

    <!-- 6.4 on screen as well as in the exports: a part of speech the lexicon has none of prints
         no heading, rather than an empty list under one. -->
    {#each GLOSSARY_PARTS as speechPart (speechPart)}
      {@const words = getLexiconWordsBySpeechPart(language.lexicon, speechPart)}
      {#if words.length > 0}
        <h4>{speechPartHeading(speechPart)}</h4>

        <ul class="glossary">
          {#each words as word, index (index)}
            <li>
              {glossaryLine(word)}
              {#if speechPart === 'noun'}
                · plural {applyMorphologicalAffix(
                  word.root,
                  language.morphology.pluralAffix,
                  language.morphology.pluralPlacement,
                )}
              {:else if speechPart === 'verb'}
                · past {applyMorphologicalAffix(
                  word.root,
                  language.morphology.pastAffix,
                  language.morphology.pastPlacement,
                )}
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    {/each}
  {/if}
</GeneratorPage>

<style>
  .language-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .glossary {
    margin: 0 0 var(--s4);
    padding-left: 1.25rem;
  }

  .glossary li {
    overflow-wrap: anywhere;
  }
</style>

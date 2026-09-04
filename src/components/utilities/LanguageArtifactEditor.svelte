<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import Notice from '$components/common/Notice.svelte';
  import {
    addLexiconWord,
    filterLexicon,
    languageSyllablePatternText,
    lexiconSpeechParts,
    removeLexiconWord,
    setLanguageArticleSystem,
    setLanguageMorphologyAffix,
    setLanguageMorphologyPlacement,
    setLanguagePossessionKind,
    setLanguagePossessionMarker,
    setLanguageSyllablePattern,
    setLanguageText,
    setLanguageWordOrder,
    setLexiconWordField,
    validateLanguageSnapshot,
    ARTICLE_SYSTEM_CHOICES,
    LANGUAGE_TEXT_FIELDS,
    MORPHOLOGY_AFFIX_FIELDS,
    POSSESSION_KIND_CHOICES,
    WORD_ORDER_CHOICES,
    type ArticleSystem,
    type LanguageSnapshot,
    type LanguageTextField,
    type MorphologyAffixField,
    type PossessionStrategy,
    type WordOrder,
  } from '$lib/languages';

  /**
   * The editing view for a saved constructed language.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **The lexicon is why this is bespoke.** 1,760 words is not a form, and a `SnapshotFieldEditor`
   * over it would be unusable — the typology fields would fit that shape and the glossary never
   * would. What a conlanger does is look a word up and rewrite it, so the lexicon is a search box
   * over a list, and each row carries its index into the *unfiltered* lexicon so that typing in the
   * search box cannot make a handler rewrite the wrong word.
   *
   * **Nothing recomputes.** Changing the syllable template does not rebuild the words that were
   * built from it, and changing the plural affix does not re-inflect the lexicon: a conlanger who
   * rewrote a word has made a decision, and 4.2 says the payload is authoritative. Rebuilding from
   * the rules is the destructive re-roll, which the surface offers separately.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  /**
   * The snapshot as this kind's own validator accepts it, or nothing.
   *
   * The prop is `unknown` because the framework holds payloads of every kind, and narrowing it
   * through `validate` rather than a cast is what keeps this editor from rendering fields over
   * something that is not a language.
   */
  const accepted = $derived(validateLanguageSnapshot(snapshot));
  const language = $derived<LanguageSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  let query = $state('');
  let speechPartFilter = $state('');

  /**
   * How many glossary rows are rendered at once.
   *
   * A cap rather than a virtual list: the search box is the real way through 1,760 words, and a
   * page of fifty is enough to see that a search worked. "Show more" raises it for the user who
   * genuinely wants to scroll. Rendering all of them would put several thousand inputs in the DOM
   * inside a panel, which is slow enough to feel broken.
   */
  const PAGE = 50;
  let shown = $state(PAGE);

  const speechParts = $derived(language === undefined ? [] : lexiconSpeechParts(language));
  const matches = $derived(
    language === undefined ? [] : filterLexicon(language, query, speechPartFilter),
  );
  const visible = $derived(matches.slice(0, shown));

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: LanguageSnapshot) => LanguageSnapshot): void {
    if (language === undefined) {
      return;
    }
    onChange(change(language));
  }

  const TEXT_LABELS: Record<LanguageTextField, string> = {
    name: 'Name',
    phonemeSetName: 'Phoneme set',
    syllableProfile: 'Syllable profile',
    orthographySummary: 'Orthography',
  };

  const AFFIX_LABELS: Record<MorphologyAffixField, string> = {
    pluralAffix: 'Plural affix',
    pastAffix: 'Past-tense affix',
  };

  const PLACEMENT_FOR: Record<MorphologyAffixField, 'pluralPlacement' | 'pastPlacement'> = {
    pluralAffix: 'pluralPlacement',
    pastAffix: 'pastPlacement',
  };

  const POSSESSION_LABELS: Record<PossessionStrategy['kind'], string> = {
    none: 'Unmarked',
    juxtapose_possessor_before: 'Possessor before the possessed',
    juxtapose_possessor_after: 'Possessor after the possessed',
    marker_on_possessed: 'Marked on the possessed',
  };

  const ARTICLE_LABELS: Record<ArticleSystem, string> = {
    none: 'No articles',
    definite_and_indefinite: 'Definite and indefinite',
    definite_only: 'Definite only',
  };
</script>

{#if language === undefined}
  <Notice tone="danger">
    These contents are stored as a language but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="language-editor">
    <fieldset>
      <legend>What it is</legend>

      {#each LANGUAGE_TEXT_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{field}">{TEXT_LABELS[field]}</label>
          <input
            id="{uid}-{field}"
            type="text"
            value={language[field]}
            oninput={(event) =>
              edit((current) => setLanguageText(current, field, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>
      {/each}

      <div class="input-group input-group--inline">
        <!-- Typed as the `CVC` string a conlanger writes. Anything that is not a C or a V is
             dropped as they type rather than refused, which is what keeps the field from fighting
             a half-finished keystroke. -->
        <label for="{uid}-pattern">Syllable template</label>
        <input
          id="{uid}-pattern"
          type="text"
          value={languageSyllablePatternText(language)}
          oninput={(event) =>
            edit((current) => setLanguageSyllablePattern(current, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Syntax</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-word-order">Word order</label>
        <select
          id="{uid}-word-order"
          value={language.wordOrder}
          onchange={(event) =>
            edit((current) =>
              setLanguageWordOrder(current, event.currentTarget.value as WordOrder),
            )}
        >
          {#each WORD_ORDER_CHOICES as choice (choice)}
            <option value={choice}>{choice}</option>
          {/each}
        </select>
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-articles">Articles</label>
        <select
          id="{uid}-articles"
          value={language.articleSystem}
          onchange={(event) =>
            edit((current) =>
              setLanguageArticleSystem(current, event.currentTarget.value as ArticleSystem),
            )}
        >
          {#each ARTICLE_SYSTEM_CHOICES as choice (choice)}
            <option value={choice}>{ARTICLE_LABELS[choice]}</option>
          {/each}
        </select>
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-possession">Possession</label>
        <select
          id="{uid}-possession"
          value={language.possessionStrategy.kind}
          onchange={(event) =>
            edit((current) =>
              setLanguagePossessionKind(
                current,
                event.currentTarget.value as PossessionStrategy['kind'],
              ),
            )}
        >
          {#each POSSESSION_KIND_CHOICES as choice (choice)}
            <option value={choice}>{POSSESSION_LABELS[choice]}</option>
          {/each}
        </select>
      </div>

      <!-- Only the one variant carries an affix, so only it offers the fields for one. -->
      {#if language.possessionStrategy.kind === 'marker_on_possessed'}
        <div class="input-group input-group--inline">
          <label for="{uid}-possession-affix">Possession marker</label>
          <input
            id="{uid}-possession-affix"
            type="text"
            value={language.possessionStrategy.affix}
            oninput={(event) =>
              edit((current) =>
                setLanguagePossessionMarker(current, { affix: event.currentTarget.value }),
              )}
            autocomplete="off"
          />
          <label for="{uid}-possession-placement">Possession marker placement</label>
          <select
            id="{uid}-possession-placement"
            value={language.possessionStrategy.placement}
            onchange={(event) =>
              edit((current) =>
                setLanguagePossessionMarker(current, {
                  placement: event.currentTarget.value as 'prefix' | 'suffix',
                }),
              )}
          >
            <option value="prefix">prefix</option>
            <option value="suffix">suffix</option>
          </select>
        </div>
      {/if}
    </fieldset>

    <fieldset>
      <legend>Morphology</legend>

      {#each MORPHOLOGY_AFFIX_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{field}">{AFFIX_LABELS[field]}</label>
          <input
            id="{uid}-{field}"
            type="text"
            value={language.morphology[field]}
            oninput={(event) =>
              edit((current) =>
                setLanguageMorphologyAffix(current, field, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <label for="{uid}-{field}-placement">{AFFIX_LABELS[field]} placement</label>
          <select
            id="{uid}-{field}-placement"
            value={language.morphology[PLACEMENT_FOR[field]]}
            onchange={(event) =>
              edit((current) =>
                setLanguageMorphologyPlacement(
                  current,
                  PLACEMENT_FOR[field],
                  event.currentTarget.value as 'prefix' | 'suffix',
                ),
              )}
          >
            <option value="prefix">prefix</option>
            <option value="suffix">suffix</option>
          </select>
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Lexicon</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-search">Search the lexicon</label>
        <input
          id="{uid}-search"
          type="search"
          bind:value={query}
          oninput={() => (shown = PAGE)}
          autocomplete="off"
          placeholder="a word or its meaning"
        />
        <label for="{uid}-part">Part of speech</label>
        <select id="{uid}-part" bind:value={speechPartFilter} onchange={() => (shown = PAGE)}>
          <option value="">All</option>
          {#each speechParts as part (part)}
            <option value={part}>{part}</option>
          {/each}
        </select>
      </div>

      <p class="language-editor__count" role="status">
        {matches.length} of {language.lexicon.words.length} words
        {#if matches.length > visible.length}· showing {visible.length}{/if}
      </p>

      <!-- 6.4 in the editor too: a search that matches nothing says so rather than showing an
           empty table under a heading. -->
      {#if matches.length === 0}
        <Notice>No words match that search.</Notice>
      {/if}

      {#each visible as entry (entry.index)}
        <div class="language-editor__word inset">
          <div class="input-group input-group--inline">
            <label for="{uid}-word-{entry.index}-root">Word {entry.index + 1} form</label>
            <input
              id="{uid}-word-{entry.index}-root"
              type="text"
              value={entry.word.root}
              oninput={(event) =>
                edit((current) =>
                  setLexiconWordField(current, entry.index, 'root', event.currentTarget.value),
                )}
              autocomplete="off"
            />
            <label for="{uid}-word-{entry.index}-meaning">Word {entry.index + 1} meaning</label>
            <input
              id="{uid}-word-{entry.index}-meaning"
              type="text"
              value={entry.word.meaning}
              oninput={(event) =>
                edit((current) =>
                  setLexiconWordField(current, entry.index, 'meaning', event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>

          <div class="input-group input-group--inline">
            <label for="{uid}-word-{entry.index}-pronunciation">
              Word {entry.index + 1} pronunciation
            </label>
            <input
              id="{uid}-word-{entry.index}-pronunciation"
              type="text"
              value={entry.word.pronunciation}
              oninput={(event) =>
                edit((current) =>
                  setLexiconWordField(
                    current,
                    entry.index,
                    'pronunciation',
                    event.currentTarget.value,
                  ),
                )}
              autocomplete="off"
            />
            <span class="language-editor__part">{entry.word.speechPart}</span>
            <BaseButton
              aria-label="Remove word {entry.index + 1}"
              onclick={() => edit((current) => removeLexiconWord(current, entry.index))}
            >
              Remove
            </BaseButton>
          </div>
        </div>
      {/each}

      {#if matches.length > visible.length}
        <BaseButton onclick={() => (shown += PAGE)}>Show more words</BaseButton>
      {/if}

      <BaseButton
        onclick={() => edit((current) => addLexiconWord(current, speechPartFilter || 'noun'))}
      >
        Add a {speechPartFilter || 'noun'}
      </BaseButton>
    </fieldset>
  </div>
{/if}

<style>
  .language-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
    align-items: flex-start;
  }

  .language-editor fieldset {
    width: 100%;
    min-width: 0;
  }

  .language-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .language-editor input,
  .language-editor select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  /* `inset` rather than a hand-rolled border and radius: the panel language owns those. */
  .language-editor__word {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    align-items: flex-start;
    min-width: 0;
    padding: var(--s4);
    width: 100%;
  }

  .language-editor__count,
  .language-editor__part {
    color: var(--ink-faint);
    margin: 0;
  }

  .language-editor__part {
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    text-transform: uppercase;
    white-space: nowrap;
  }
</style>

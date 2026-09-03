<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import DataTable, { type Column } from '$components/common/DataTable.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import InputGroup from '$components/common/InputGroup.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import {
    DEFAULT_PATTERN,
    MAXIMUM_WORD_COUNT,
    MINIMUM_WORD_COUNT,
    WORD_PATTERN_SHEET_FILE_STEM,
    WORD_PATTERN_SHEET_TITLE,
    generateWords,
    isBlankPattern,
    sheetToMarkdown,
    sheetToText,
    wordPatternSheet,
  } from '$lib/word_patterns';
  import { RNG } from '@ironarachne/rng';

  const TOOL_PATH = '/word-generator-cheat-sheet';

  const SYNTAX_COLUMNS: Column[] = [
    { label: 'Syntax' },
    { label: 'Meaning' },
    { label: 'Example' },
  ];

  const ELEMENT_COLUMNS: Column[] = [{ label: 'Name' }, { label: 'Symbol' }, { label: 'Elements' }];

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again — the shape the rest of the pass settled
   * on. The generator here used to build a `new WordGenerator()` with no RNG at all, so nothing it
   * produced could be got back, written down, or shared with whoever asked what the pattern did.
   */
  const rng = new RNG(Date.now().toString());

  let pattern = $state(DEFAULT_PATTERN);
  let numberOfWords = $state(10);
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let words: string[] = $state([]);

  const sheet = $derived(wordPatternSheet(words.length > 0 ? { pattern, seed, words } : undefined));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    words = generateWords(pattern, numberOfWords, seed);
  }

  function exportMarkdown() {
    downloadTextFile(sheetToMarkdown(sheet), `${WORD_PATTERN_SHEET_FILE_STEM}.md`, 'text/markdown');
  }

  async function exportPdf() {
    await downloadTextPdf(sheet.title, sheetToText(sheet), `${WORD_PATTERN_SHEET_FILE_STEM}.pdf`);
  }
</script>

<GeneratorPage toolPath={TOOL_PATH} title={WORD_PATTERN_SHEET_TITLE}>
  {#snippet description()}
    <p>This is meant only for development reference.</p>
  {/snippet}

  <h2>Pattern syntax</h2>

  <!-- Was three paragraphs of prose above the controls, and the only place in the repository the
       syntax was written down at all. It is `PATTERN_SYNTAX` now, so the exports carry it too. -->
  <!-- Wrapped, because a `{#snippet}` that is a direct child of a component is passed to *that*
       component: left bare here, `syntaxRows` would be handed to `GeneratorPage` instead of being
       a name this scope can pass to `DataTable`. -->
  <div class="syntax">
    <DataTable columns={SYNTAX_COLUMNS} rows={syntaxRows} label="Pattern syntax" />

    {#snippet syntaxRows()}
      {#each sheet.syntax as rule (rule.syntax)}
        <tr>
          <td data-label="Syntax"><code>{rule.syntax}</code></td>
          <td data-label="Meaning">{rule.meaning}</td>
          <td data-label="Example"><code>{rule.example}</code></td>
        </tr>
      {/each}
    {/snippet}
  </div>

  <h2>Try a pattern</h2>

  <ControlsPanel>
    <InputGroup id="pattern" label="Pattern">
      <input type="text" name="pattern" bind:value={pattern} id="pattern" />
    </InputGroup>
    <NumberField
      id="number-of-words"
      label="Number of Words"
      bind:value={numberOfWords}
      min={MINIMUM_WORD_COUNT}
      max={MAXIMUM_WORD_COUNT}
    />
    <SeedControls bind:seed bind:lockSeed />
  </ControlsPanel>

  <div class="actions">
    <!-- Disabled rather than generating nothing: an empty pattern produces empty words, which is
         where the ten blank bullets came from. -->
    <BaseButton onclick={generate} disabled={isBlankPattern(pattern)}>Generate</BaseButton>
    <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
  </div>

  {#if words.length > 0}
    <ul class="words" aria-label="Generated words">
      {#each words as word, index (index)}
        <li>{word}</li>
      {/each}
    </ul>
  {/if}

  <h2>Element Reference</h2>

  <!-- `narrow="scroll"` rather than the flip: the three columns mean something only beside each
       other, and unbreakable terms like "palatals/post-alveolars" are already wider than a 320px
       phone allows. The table scrolls inside its own container; the page never does. This replaces
       a hand-built HTML string injected with `{@html}` — the one `svelte/no-at-html-tags`
       suppression on the page, for markup the component had concatenated itself. -->
  <div class="elements">
    <DataTable
      columns={ELEMENT_COLUMNS}
      rows={elementRows}
      narrow="scroll"
      label="Word pattern elements"
    />

    {#snippet elementRows()}
      {#each sheet.elements as element (element.symbol)}
        <tr>
          <td data-label="Name">{element.name}</td>
          <td data-label="Symbol"><code>{element.symbol}</code></td>
          <td data-label="Elements">{element.elements.join(', ')}</td>
        </tr>
      {/each}
    {/snippet}
  </div>
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .words {
    columns: 12rem;
  }
</style>

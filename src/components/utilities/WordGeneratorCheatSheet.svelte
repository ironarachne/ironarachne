<script lang="ts">
  import { WordGenerator, allElements } from '@ironarachne/word-generator';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import InputGroup from '$components/common/InputGroup.svelte';
  import NumberField from '$components/common/NumberField.svelte';

  const elements = allElements;

  let html = $state(
    '<table><thead><tr><th>Name</th><th>Symbol</th><th>Elements</th></tr></thead><tbody>',
  );

  for (let i = 0; i < elements.length; i++) {
    html +=
      '<tr><td>' +
      elements[i].name +
      '</td><td>' +
      elements[i].symbol +
      '</td><td>' +
      elements[i].elements.join(', ') +
      '</td></tr>';
  }

  html += '</tbody></table>';

  let pattern = $state('');
  let numberOfWords = $state(10);
  let words: string[] = $state([]);

  function generate() {
    words = [];
    const wordGen = new WordGenerator();
    wordGen.patterns = [pattern];
    for (let i = 0; i < numberOfWords; i++) {
      words.push(wordGen.generate());
    }
  }
</script>

<GeneratorPage title="Word Generator Cheat Sheet">
  {#snippet description()}
    <p>This is meant only for development reference.</p>
    <p>
      Enclosing several comma-separated patterns in parentheses will make the parser choose one of
      those to add to the word.
    </p>
    <p>
      Outside of the above, adding a + will duplicate the previous character after its processing.
    </p>
  {/snippet}

  <InputGroup id="pattern" label="Pattern">
    <input type="text" name="pattern" bind:value={pattern} id="pattern" />
  </InputGroup>

  <NumberField id="number-of-words" label="Number of Words" bind:value={numberOfWords} />

  <button onclick={generate}>Generate</button>

  <ul>
    {#each words as word}
      <li>{word}</li>
    {/each}
  </ul>

  <h2>Element Reference</h2>

  <!-- Renders app-generated markup (no external or user-supplied input). -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
</GeneratorPage>

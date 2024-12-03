<script lang="ts">
  import { WordGenerator, allElements } from '@ironarachne/word-generator';

  let elements = allElements;

  let html =
    $state('<table><thead><tr><th>Name</th><th>Symbol</th><th>Elements</th></tr></thead><tbody>');

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
    let wordGen = new WordGenerator();
    wordGen.patterns = [pattern];
    for (let i =0;i<numberOfWords;i++) {
      words.push(wordGen.generate());
    }
  }
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
</style>

<svelte:head>
  <title>Word Generator Cheat Sheet | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h1>Word Generator Cheat Sheet</h1>

  <p>This is meant only for development reference.</p>
  <p>Enclosing several comma-separated patterns in parentheses will make the parser choose one of those to add to the word.</p>
  <p>Outside of the above, adding a + will duplicate the previous character after its processing.</p>

  <div class="input-group">
    <label for="pattern">Pattern</label>
    <input type="text" name="pattern" bind:value={pattern} id="pattern" />
  </div>

  <div class="input-group">
    <label for="number-of-words">Number of Words</label>
    <input type="number" name="number-of-words" bind:value={numberOfWords} id="number-of-words" />
  </div>

  <button onclick={generate}>Generate</button>

  <ul>
    {#each words as word}
      <li>{word}</li>
    {/each}
  </ul>

  <h2>Element Reference</h2>

  {@html html}
</section>

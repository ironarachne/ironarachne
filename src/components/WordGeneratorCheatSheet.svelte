<script lang="ts">
  import * as Elements from '../modules/languages/wordgenerator/elements';
  import WordGenerator from '../modules/languages/wordgenerator/generator';

  let elements = Elements.all();

  let html =
    '<table><thead><tr><th>Name</th><th>Symbol</th><th>Elements</th></tr></thead><tbody>';

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

  let pattern = '';
  let numberOfWords = 10;
  let words = [];

  function generate() {
    words = [];
    let wordGen = new WordGenerator();
    wordGen.patterns = [pattern];
    for (let i =0;i<numberOfWords;i++) {
      words.push(wordGen.generate());
    }
  }
</script>

<svelte:head>
  <title>Word Generator Cheat Sheet | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h2>Word Generator Cheat Sheet</h2>

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

  <button on:click={generate}>Generate</button>

  <ul>
    {#each words as word}
      <li>{word}</li>
    {/each}
  </ul>

  <h3>Element Reference</h3>

  {@html html}
</section>

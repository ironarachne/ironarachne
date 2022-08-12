<script lang="ts">
  import OSECharacterGenerator from "../modules/ose/generator";
  import * as RND from '../modules/random';
  import { marked } from 'marked';

  let character;
  let charGen = new OSECharacterGenerator();
  let seed = RND.randomString(13);

  function generate() {

    character = charGen.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  newSeed();
</script>

<svelte:head>
  <title>Old School Essentials Character Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Old School Essentials Character Generator</h2>

  <p>This creates first-level characters for Old School Essentials Advanced Fantasy.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h3>{ character.firstName } { character.lastName }</h3>

  <p>A level { character.level } { character.race.name } { character.characterClass.name }</p>

  <h4>Attributes</h4>

  <p><strong>Strength:</strong> { character.strength }</p>
  <p><strong>Intelligence:</strong> { character.intelligence }</p>
  <p><strong>Wisdom:</strong> { character.wisdom }</p>
  <p><strong>Dexterity:</strong> { character.dexterity }</p>
  <p><strong>Constitution:</strong> { character.constitution }</p>
  <p><strong>Charisma:</strong> { character.charisma }</p>

  <h4>Attack Values</h4>

  <table>
    <thead>
      <tr>
        <th>AC 9</th>
        <th>AC 8</th>
        <th>AC 7</th>
        <th>AC 6</th>
        <th>AC 5</th>
        <th>AC 4</th>
        <th>AC 3</th>
        <th>AC 2</th>
        <th>AC 1</th>
        <th>AC 0</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{ character.attackValues[9] }</td>
        <td>{ character.attackValues[8] }</td>
        <td>{ character.attackValues[7] }</td>
        <td>{ character.attackValues[6] }</td>
        <td>{ character.attackValues[5] }</td>
        <td>{ character.attackValues[4] }</td>
        <td>{ character.attackValues[3] }</td>
        <td>{ character.attackValues[2] }</td>
        <td>{ character.attackValues[1] }</td>
        <td>{ character.attackValues[0] }</td>
      </tr>
    </tbody>
  </table>

  <h4>Abilities</h4>

  {#each character.abilities as ability}
    <h5>{ ability.name }</h5>
    <div>{@html marked.parse(ability.description) }</div>
  {/each}
</section>

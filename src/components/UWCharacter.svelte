<script lang="ts">
  import * as RND from "../modules/random";
  import * as CharGen from "../modules/unchartedworlds/character";

  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let character = CharGen.generate();

  function generate() {
    random.use(seedrandom(seed));
    character = CharGen.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  function save() {
    let description = CharGen.formatAsText(character);

    const blob = new Blob([description], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "uw-character.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<svelte:head>
  <title>Uncharted Worlds Character Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h2>Uncharted Worlds Character Generator</h2>

  <p>Generate starting characters for Uncharted Worlds.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>
  <button on:click={save}>Save</button>

  <h3>Statistics</h3>

  <p><strong>Physique:</strong> {character.stats.physique}</p>
  <p><strong>Mettle:</strong> {character.stats.mettle}</p>
  <p><strong>Expertise:</strong> {character.stats.expertise}</p>
  <p><strong>Influence:</strong> {character.stats.influence}</p>
  <p><strong>Interface:</strong> {character.stats.interface}</p>

  <h3>Careers</h3>

  {#each character.careers as career}
    <div>{career.name}</div>
  {/each}

  <h3>Origin</h3>

  <p>{character.origin.name}</p>

  <h3>Descriptors</h3>

  <p>{character.descriptors}</p>

  <h3>Skills</h3>

  <ul>
    {#each character.skills as skill}
      <li>
        <strong>{skill.name}: </strong>
        <pre>{ skill.description }</pre>
      </li>
    {/each}
  </ul>

  <h3>Advancement</h3>

  <p>{character.advancement}</p>

  <h3>Assets</h3>

  <div class="asset">
    <h4>Workspace: {character.workspace.name}</h4>
    <p>{character.workspace.description}</p>
  </div>

  {#each character.assets as asset}
    <div>
      <h4>{asset.name}</h4>
      <p>{asset.description}</p>
      {#if asset.upgrades.length > 0}
        <ul v-if="asset.upgrades.length > 0">
          {#each asset.upgrades as upgrade}
            <li>
              <strong>{upgrade.name}:</strong>
              {upgrade.description}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/each}
</section>

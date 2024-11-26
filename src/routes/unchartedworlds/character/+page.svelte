<script lang="ts">
  import * as CharGen from "$lib/unchartedworlds/character";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  let lockSeed = false;
  random.use(seedrandom(seed));
  let character = CharGen.generate();

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));
    character = CharGen.generate();
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

  generate();
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/scifi.scss';
</style>

<svelte:head>
  <title>Uncharted Worlds Character Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Uncharted Worlds Character Generator</h1>

  <p>Generate starting characters for Uncharted Worlds.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>
  
  <button on:click={generate}>Generate</button>
  <button on:click={save}>Save</button>

  <h2>Statistics</h2>

  <p><strong>Physique:</strong> {character.stats.physique}</p>
  <p><strong>Mettle:</strong> {character.stats.mettle}</p>
  <p><strong>Expertise:</strong> {character.stats.expertise}</p>
  <p><strong>Influence:</strong> {character.stats.influence}</p>
  <p><strong>Interface:</strong> {character.stats.interface}</p>

  <h2>Careers</h2>

  {#each character.careers as career}
    <div>{career.name}</div>
  {/each}

  <h2>Origin</h2>

  <p>{character.origin.name}</p>

  <h2>Descriptors</h2>

  <p>{character.descriptors}</p>

  <h2>Skills</h2>

  <ul>
    {#each character.skills as skill}
      <li>
        <strong>{skill.name}: </strong>
        <pre>{ skill.description }</pre>
      </li>
    {/each}
  </ul>

  <h2>Advancement</h2>

  <p>{character.advancement}</p>

  <h2>Assets</h2>

  <div class="asset">
    <h4>Workspace: {character.workspace.name}</h4>
    <p>{character.workspace.description}</p>
  </div>

  {#each character.assets as asset}
    <div>
      <h4>{asset.name}</h4>
      <p>{asset.description}</p>
      {#if asset.upgrades.length > 0}
        <ul>
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

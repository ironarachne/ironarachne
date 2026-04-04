<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { onMount } from 'svelte';
  import {
    generateEncounter,
    getAllFantasyEncounterTemplates,
    type Encounter,
  } from '$lib/encounters';
  import type { Character } from '$lib/characters/character_types';
  import type { Creature } from '$lib/creatures/creature_types';

  let seed = RNG.randomString(13);
  let rng = new RNG.RNG(seed);
  let encounter: null | Encounter = null;

  let encounterTemplates = getAllFantasyEncounterTemplates().sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  let selectedTemplateName = 'any';

  let forceUniformSpecies = false;

  let lockSeed = false;
  $: if (!lockSeed) {
    rng.setSeed(seed);
  }

  function generate() {
    if (!lockSeed) {
      seed = RNG.randomString(13);
      rng.setSeed(seed);
    }

    let templatesToUse = encounterTemplates;
    if (selectedTemplateName !== 'any') {
      const selected = encounterTemplates.find((t) => t.name === selectedTemplateName);
      if (selected) {
        templatesToUse = [selected];
      }
    }

    encounter = generateEncounter(seed, {
      possibleTemplates: templatesToUse,
      forceUniformSpecies: forceUniformSpecies,
    });
  }

  onMount(() => {
    generate();
  });
</script>

<svelte:head>
  <title>Encounter | Iron Arachne</title>
</svelte:head>

<section class="main">
  <h1>Encounter Generation</h1>

  <p>This generator creates random encounters.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="template">Template</label>
    <select bind:value={selectedTemplateName} id="template">
      <option value="any">Any</option>
      {#each encounterTemplates as template}
        <option value={template.name}>{template.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="force-uniform-species">Force Uniform Species</label>
    <input
      type="checkbox"
      name="force-uniform-species"
      bind:checked={forceUniformSpecies}
      id="force-uniform-species"
    />
  </div>

  <button onclick={generate}>Generate</button>

  {#if encounter}
    <div class="stat-block">
      <div class="encounter-header">
        <h2>{encounter.name}</h2>
      </div>

      {#each encounter.groups as group}
        <div class="group-section">
          <h3>{group.name}</h3>
          <ul>
            {#each group.mobs as mob}
              {@const asChar = mob as unknown as Character}
              {@const asCreature = mob as unknown as Creature}
              <li>
                <strong>{mob.name}</strong>
                {#if asChar.archetype}
                  — {asChar.species.name} {asChar.archetype.name}
                {:else if asCreature.species}
                  — {asCreature.species.name}
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .stat-block {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #fdf6e3;
    border: 2px solid #a82e2e;
    border-radius: 4px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    font-family: serif;
    color: #440000;
  }
  .stat-block h2 {
    color: #a82e2e;
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.8rem;
    text-transform: capitalize;
  }
  .stat-block h3 {
    color: #a82e2e;
    font-size: 1.4rem;
    border-bottom: 1px solid #a82e2e;
    padding-bottom: 0.2rem;
    margin-bottom: 1rem;
    text-transform: capitalize;
  }
  .group-section {
    margin-top: 1.5rem;
  }
  .group-section ul {
    list-style-type: none;
    padding-left: 0;
  }
  .group-section li {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: rgba(168, 46, 46, 0.05);
    border-radius: 3px;
  }
</style>

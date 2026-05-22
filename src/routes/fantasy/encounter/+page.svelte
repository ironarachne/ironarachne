<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import { onMount } from 'svelte';
  import {
    generateEncounter,
    getAllFantasyEncounterTemplates,
    type Encounter,
  } from '$lib/encounters';
  import ArchetypeBadge from '$lib/components/archetype_badge.svelte';
  import SpeciesBadge from '$lib/components/species_badge.svelte';
  import type { Character } from '$lib/characters/character_types';
  import type { Creature } from '$lib/creatures/creature_types';

  let seed = new RNG(Date.now().toString()).randomString(13);
  let rng = new RNG(seed);
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
      seed = new RNG(Date.now().toString()).randomString(13);
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
              {@const mobSpecies = asCreature.species}
              <li class="mob-row">
                <strong>{mob.name}</strong>
                {#if mobSpecies}
                  <SpeciesBadge speciesName={mobSpecies.name} size="sm" />
                  {#if asChar.archetype}
                    <ArchetypeBadge archetypeName={asChar.archetype.name} size="sm" />
                    <span class="mob-meta">— {mobSpecies.name} {asChar.archetype.name}</span>
                  {:else}
                    <span class="mob-meta">— {mobSpecies.name}</span>
                  {/if}
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
    padding: 1rem;
    border: 1px solid var(--granite);
    border-radius: 4px;
    background: color-mix(in srgb, var(--slate) 40%, transparent);
  }

  .stat-block h2 {
    margin-top: 0;
    text-transform: capitalize;
  }

  .group-section {
    margin-top: 1.5rem;
  }

  .group-section ul {
    list-style-type: none;
    padding-left: 0;
    margin-left: 0;
  }

  .group-section li {
    margin-left: 0;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--granite);
    border-radius: 3px;
    background: color-mix(in srgb, var(--charcoal) 85%, white 15%);
  }

  .mob-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .mob-meta {
    color: color-mix(in srgb, currentColor 70%, transparent);
  }
</style>

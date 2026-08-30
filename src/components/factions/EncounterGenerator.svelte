<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import { onMount } from 'svelte';
  import {
    generateEncounter,
    getAllFantasyEncounterTemplates,
    type Encounter,
  } from '$lib/encounters';
  import ArchetypeBadge from '$components/characters/ArchetypeBadge.svelte';
  import SpeciesBadge from '$components/characters/SpeciesBadge.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import type { Character } from '$lib/characters';
  import type { Creature } from '$lib/creatures';

  let seed = $state(new RNG(Date.now().toString()).randomString(13));
  let rng = $state(new RNG(seed));
  let encounter = $state<null | Encounter>(null);

  const encounterTemplates = getAllFantasyEncounterTemplates().sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  let selectedTemplateName = $state('any');

  let forceUniformSpecies = $state(false);

  let lockSeed = $state(false);

  $effect(() => {
    if (!lockSeed) {
      rng.setSeed(seed);
    }
  });

  function generate() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
      rng = new RNG(seed);
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

<GeneratorPage toolPath="/fantasy/encounter" title="Encounter Generation">
  {#snippet description()}
    <p>This generator creates random encounters.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="template"
    label="Template"
    bind:value={selectedTemplateName}
    options={[
      { value: 'any', label: 'Any' },
      ...encounterTemplates.map((t) => ({ value: t.name, label: t.name })),
    ]}
  />

  <CheckboxField
    id="force-uniform-species"
    label="Force Uniform Species"
    bind:checked={forceUniformSpecies}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>

  {#if encounter}
    <!-- A result surface is a panel, not a box with a border on it: the two layers,
         and the keyline, corner and padding are the system's. It wrote its own
         border, radius and padding until #124. -->
    <div class="stat-block panel">
      <div class="panel__field">
        <div class="encounter-header">
          <h2>{encounter.name}</h2>
        </div>
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
</GeneratorPage>

<style>
  /* The keyline, the corner, the padding and the fill are the panel's now — the fill was a
     40% mix of slate, which is a fourth surface level invented in one component. */
  .stat-block {
    margin-top: var(--s8);
  }

  .stat-block h2 {
    margin-top: 0;
    text-transform: capitalize;
  }

  .group-section {
    margin-top: var(--s7);
  }

  .group-section ul {
    list-style-type: none;
    padding-left: 0;
    margin-left: 0;
  }

  .group-section li {
    margin-left: 0;
    margin-bottom: var(--s4);
    /* A row in a list inside a panel, which the panel language says is a row rather than a
       third box: the well the list sits in already says the rows are held. The fill was a mix of
       charcoal and white invented here, and the radius was outside the vocabulary. */
    padding: var(--s4);
  }

  .mob-row {
    display: flex;
    align-items: center;
    gap: var(--s3);
    flex-wrap: wrap;
  }

  .mob-meta {
    color: color-mix(in srgb, currentColor 70%, transparent);
  }
</style>

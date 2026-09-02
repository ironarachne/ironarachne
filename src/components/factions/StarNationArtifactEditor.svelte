<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    getEconomyTypes,
    getGovernmentTypes,
    restoreStarNationDescription,
    setStarNationEconomyType,
    setStarNationGovernmentType,
    setStarNationHomePlanet,
    setStarNationHomeSystemName,
    setStarNationMilitaryQuality,
    setStarNationNumber,
    setStarNationPlanetName,
    setStarNationRegionPopulation,
    setStarNationText,
    STAR_NATION_MILITARY_QUALITY_RANGE,
    STAR_NATION_TECHNOLOGY_LEVEL_RANGE,
    validateStarNationSnapshot,
    type StarNationNumberField,
    type StarNationSnapshot,
  } from '$lib/civilizations';

  /**
   * The editing view for a saved star nation.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   * What is here is every field the generator page prints (requirement 4.1): the nation's name
   * and description, its four figures, its two table rows, its territory, and the home system —
   * its name, its planets' names, which one is the homeworld, and the populations of its regions.
   *
   * **This is the `SnapshotFieldEditor` case docs/readiness-factions.md called it, built bespoke
   * all the same.** Every control here is a text, a number or a select over a named table, which
   * is exactly what decision 5 of docs/tool-readiness.md allows the declared component — and the
   * component is still unbuilt, because the two tools before this that were called flat turned
   * out not to be. Building it against a single consumer would be designing it from one example;
   * this editor is written so that the day it exists, each fieldset below maps to one descriptor.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  const governmentTypes = getGovernmentTypes();
  const economyTypes = getEconomyTypes();

  /**
   * The snapshot as this kind's own validator accepts it, or nothing.
   *
   * The prop is `unknown` because the framework holds payloads of every kind, and narrowing it
   * through `validate` rather than a cast is what keeps this editor from rendering fields over
   * something that is not a star nation.
   */
  const accepted = $derived(validateStarNationSnapshot(snapshot));
  const nation = $derived<StarNationSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: StarNationSnapshot) => StarNationSnapshot): void {
    if (nation === undefined) {
      return;
    }
    onChange(change(nation));
  }

  function editNumber(field: StarNationNumberField, raw: string): void {
    edit((current) => setStarNationNumber(current, field, Number(raw)));
  }
</script>

{#if nation === undefined}
  <Notice tone="danger">
    These contents are stored as a star nation but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="nation-editor">
    <fieldset>
      <legend>Nation</legend>

      <!-- Qualified as "Nation name" rather than "Name", like every other editor: the panel above
           already has a field labelled "Name" that renames the artifact, and two fields with the
           same accessible name in one region is the 6.2 failure. -->
      <div class="input-group input-group--inline">
        <label for="{uid}-name">Nation name</label>
        <input
          id="{uid}-name"
          type="text"
          value={nation.name}
          oninput={(event) =>
            edit((current) => setStarNationText(current, 'name', event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      <!-- The description was assembled from the figures when the nation was rolled, and changing
           a figure below deliberately does not rewrite it: it is the user's prose. The button
           under it rebuilds the sentence on request, which is the one explicit way back. -->
      <div class="input-group input-group--inline">
        <label for="{uid}-description">Nation description</label>
        <textarea
          id="{uid}-description"
          rows="4"
          value={nation.description}
          oninput={(event) =>
            edit((current) => setStarNationText(current, 'description', event.currentTarget.value))}
        ></textarea>
      </div>

      <BaseButton onclick={() => edit(restoreStarNationDescription)}>
        Rewrite description from the figures
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>Figures</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-government">Government type</label>
        <select
          id="{uid}-government"
          value={nation.governmentType.name}
          onchange={(event) =>
            edit((current) => setStarNationGovernmentType(current, event.currentTarget.value))}
        >
          {#each governmentTypes as type (type.name)}
            <option value={type.name}>{type.name}</option>
          {/each}
        </select>
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-economy">Economy type</label>
        <select
          id="{uid}-economy"
          value={nation.economyType.name}
          onchange={(event) =>
            edit((current) => setStarNationEconomyType(current, event.currentTarget.value))}
        >
          {#each economyTypes as type (type.name)}
            <option value={type.name}>{type.name}</option>
          {/each}
        </select>
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-military">Military quality</label>
        <input
          id="{uid}-military"
          type="number"
          min={STAR_NATION_MILITARY_QUALITY_RANGE[0]}
          max={STAR_NATION_MILITARY_QUALITY_RANGE[1]}
          step="1"
          value={nation.military.quality}
          oninput={(event) =>
            edit((current) =>
              setStarNationMilitaryQuality(current, Number(event.currentTarget.value)),
            )}
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-technology">Technology level</label>
        <input
          id="{uid}-technology"
          type="number"
          min={STAR_NATION_TECHNOLOGY_LEVEL_RANGE[0]}
          max={STAR_NATION_TECHNOLOGY_LEVEL_RANGE[1]}
          step="1"
          value={nation.technologyLevel}
          oninput={(event) => editNumber('technologyLevel', event.currentTarget.value)}
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-population">Population</label>
        <input
          id="{uid}-population"
          type="number"
          min="0"
          step="1"
          value={nation.population}
          oninput={(event) => editNumber('population', event.currentTarget.value)}
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Territory</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-systems">Star systems controlled</label>
        <input
          id="{uid}-systems"
          type="number"
          min="1"
          step="1"
          value={nation.systemsControlled}
          oninput={(event) => editNumber('systemsControlled', event.currentTarget.value)}
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-populated">Populated planets in all</label>
        <input
          id="{uid}-populated"
          type="number"
          min="0"
          step="1"
          value={nation.populatedPlanets}
          oninput={(event) => editNumber('populatedPlanets', event.currentTarget.value)}
        />
      </div>

      {#each nation.regionsOfControl as region, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-region-{index}">{region.region_type.name} population</label>
          <input
            id="{uid}-region-{index}"
            type="number"
            min="0"
            step="1"
            value={region.population}
            oninput={(event) =>
              edit((current) =>
                setStarNationRegionPopulation(current, index, Number(event.currentTarget.value)),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Home system</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-system-name">Home system name</label>
        <input
          id="{uid}-system-name"
          type="text"
          value={nation.homeSystem.name}
          oninput={(event) =>
            edit((current) => setStarNationHomeSystemName(current, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-home-planet">Home planet</label>
        <select
          id="{uid}-home-planet"
          value={String(nation.homePlanetIndex)}
          onchange={(event) =>
            edit((current) => setStarNationHomePlanet(current, Number(event.currentTarget.value)))}
        >
          {#each nation.homeSystem.planets as planet, index (index)}
            <option value={String(index)}>{index + 1}: {planet.name}</option>
          {/each}
        </select>
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-home-populated">Populated planets in the home system</label>
        <input
          id="{uid}-home-populated"
          type="number"
          min="0"
          step="1"
          value={nation.homeSystemPopulatedPlanets}
          oninput={(event) => editNumber('homeSystemPopulatedPlanets', event.currentTarget.value)}
        />
      </div>

      <!-- Keyed by position rather than by name: two planets may read the same while one is being
           typed, and a key that changed as the user typed would lose focus on every keystroke. -->
      {#each nation.homeSystem.planets as planet, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-planet-{index}">Planet {index + 1} name</label>
          <input
            id="{uid}-planet-{index}"
            type="text"
            value={planet.name}
            oninput={(event) =>
              edit((current) => setStarNationPlanetName(current, index, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>
      {/each}
    </fieldset>
  </div>
{/if}

<style>
  .nation-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .nation-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the other editors: a fieldset inside an editor panel was
       a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .nation-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .nation-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .nation-editor input[type='text'],
  .nation-editor input[type='number'],
  .nation-editor textarea,
  .nation-editor select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }
</style>

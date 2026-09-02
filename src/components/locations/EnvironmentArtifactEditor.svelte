<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addBiomeListEntry,
    addTerrainListEntry,
    removeBiomeListEntry,
    removeTerrainListEntry,
    setBiomeAquatic,
    setBiomeListEntry,
    setBiomeName,
    setBiomeNumber,
    setClimateNumber,
    setClimateText,
    setClimateWindComponent,
    setEnvironmentDescription,
    setSeasonAdjustment,
    setSeasonName,
    setTerrainListEntry,
    setTerrainNumber,
    setTerrainSlopeComponent,
    setWaterCurrentComponent,
    setWaterNumber,
    setWaterType,
    validateEnvironmentSnapshot,
    type BiomeListField,
    type EnvironmentSnapshot,
    type TerrainListField,
  } from '$lib/environment';

  /**
   * The editing view for a saved environment.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **Bespoke, and not the declared field editor.** `docs/readiness-locations.md` expected this to
   * be a `SnapshotFieldEditor` case, and the payload turned out not to be flat: an environment is
   * four nested records, two of which hold lists of strings and one of which holds a list of
   * *season* records. The descriptor language in decision 5 of `docs/tool-readiness.md` addresses
   * `field: string` — a key on the snapshot — so it cannot reach `terrain.elevationMin`, and its
   * four controls have no way to say "repeat these three fields per row". That decision's own
   * guard is what applies: a kind that needs a fifth control gets a bespoke editor instead.
   *
   * **Nothing here recomputes.** Raising the biome's temperature does not reclassify it and moving
   * the slope does not re-erode the terrain — both would be regenerating over the user's edits,
   * which is what 4.2 forbids. A user who wants the arithmetic back re-rolls.
   *
   * **Ecosystems are absent because they are empty.** `Ecosystems.generate` is a documented stub,
   * so there is nothing to edit; the export drops the section for the same reason. When the
   * sub-generator is written, its fields go here.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  /**
   * The snapshot as this kind's own validator accepts it, or nothing.
   *
   * The prop is `unknown` because the framework holds payloads of every kind, and narrowing it
   * through `validate` rather than a cast is what keeps this editor from rendering fields over
   * something that is not an environment.
   */
  const accepted = $derived(validateEnvironmentSnapshot(snapshot));
  const environment = $derived<EnvironmentSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: EnvironmentSnapshot) => EnvironmentSnapshot): void {
    if (environment === undefined) {
      return;
    }
    onChange(change(environment));
  }

  /** The biome's and the terrain's list sections, so the markup below states each one once. */
  const BIOME_LISTS: { field: BiomeListField; label: string }[] = [
    { field: 'descriptions', label: 'Biome description' },
    { field: 'features', label: 'Biome feature' },
  ];

  const TERRAIN_LISTS: { field: TerrainListField; label: string }[] = [
    { field: 'landforms', label: 'Landform' },
    { field: 'soilTypes', label: 'Soil' },
    { field: 'rockTypes', label: 'Rock' },
  ];

  function terrainListOf(current: EnvironmentSnapshot, field: TerrainListField): string[] {
    return field === 'landforms'
      ? current.terrain.landforms
      : current.terrain.geologicalMakeup[field];
  }
</script>

{#snippet numberRow(id: string, label: string, value: number, apply: (next: number) => void)}
  <div class="input-group input-group--inline">
    <label for={id}>{label}</label>
    <input
      {id}
      type="number"
      step="any"
      {value}
      oninput={(event) => apply(event.currentTarget.valueAsNumber)}
    />
  </div>
{/snippet}

{#snippet textRow(id: string, label: string, value: string, apply: (next: string) => void)}
  <div class="input-group input-group--inline">
    <label for={id}>{label}</label>
    <input
      {id}
      type="text"
      {value}
      oninput={(event) => apply(event.currentTarget.value)}
      autocomplete="off"
    />
  </div>
{/snippet}

{#if environment === undefined}
  <Notice tone="danger">
    These contents are stored as an environment but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="environment-editor">
    <div class="input-group">
      <!-- Qualified as "Environment description" rather than "Description": the panel above has a
           field labelled "Name" that renames the artifact, and the climate has a description of its
           own further down. Two fields with the same accessible name in one region is the 6.2
           failure. -->
      <label for="{uid}-description">Environment description</label>
      <textarea
        id="{uid}-description"
        rows="3"
        value={environment.description}
        oninput={(event) =>
          edit((current) => setEnvironmentDescription(current, event.currentTarget.value))}
      ></textarea>
    </div>

    <fieldset>
      <legend>Biome</legend>

      {@render textRow(`${uid}-biome-name`, 'Biome name', environment.biome.name, (next) =>
        edit((current) => setBiomeName(current, next)),
      )}
      {@render numberRow(
        `${uid}-biome-temperature`,
        'Biome temperature (°C)',
        environment.biome.temperature,
        (next) => edit((current) => setBiomeNumber(current, 'temperature', next)),
      )}
      {@render numberRow(
        `${uid}-biome-altitude`,
        'Biome altitude (−1 to 1)',
        environment.biome.altitude,
        (next) => edit((current) => setBiomeNumber(current, 'altitude', next)),
      )}
      {@render numberRow(
        `${uid}-biome-humidity`,
        'Biome humidity (0 to 1)',
        environment.biome.humidity,
        (next) => edit((current) => setBiomeNumber(current, 'humidity', next)),
      )}

      <label class="environment-editor__check" for="{uid}-biome-aquatic">
        <input
          id="{uid}-biome-aquatic"
          type="checkbox"
          checked={environment.biome.isAquatic}
          onchange={(event) =>
            edit((current) => setBiomeAquatic(current, event.currentTarget.checked))}
        />
        This biome is under water
      </label>

      {#each BIOME_LISTS as list (list.field)}
        {#each environment.biome[list.field] as entry, index (index)}
          <div class="environment-editor__row">
            {@render textRow(
              `${uid}-biome-${list.field}-${index}`,
              `${list.label} ${index + 1}`,
              entry,
              (next) => edit((current) => setBiomeListEntry(current, list.field, index, next)),
            )}
            <BaseButton
              aria-label="Remove {list.label.toLowerCase()} {index + 1}"
              onclick={() => edit((current) => removeBiomeListEntry(current, list.field, index))}
            >
              Remove
            </BaseButton>
          </div>
        {/each}
        <BaseButton onclick={() => edit((current) => addBiomeListEntry(current, list.field))}>
          Add {list.label.toLowerCase()}
        </BaseButton>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Climate</legend>

      {@render textRow(`${uid}-climate-name`, 'Climate name', environment.climate.name, (next) =>
        edit((current) => setClimateText(current, 'name', next)),
      )}

      <div class="input-group">
        <label for="{uid}-climate-description">Climate description</label>
        <textarea
          id="{uid}-climate-description"
          rows="2"
          value={environment.climate.description}
          oninput={(event) =>
            edit((current) => setClimateText(current, 'description', event.currentTarget.value))}
        ></textarea>
      </div>

      {@render numberRow(
        `${uid}-climate-temperature`,
        'Average temperature (°C)',
        environment.climate.temperature,
        (next) => edit((current) => setClimateNumber(current, 'temperature', next)),
      )}
      {@render numberRow(
        `${uid}-climate-temperature-min`,
        'Night temperature (°C)',
        environment.climate.temperatureMin,
        (next) => edit((current) => setClimateNumber(current, 'temperatureMin', next)),
      )}
      {@render numberRow(
        `${uid}-climate-temperature-max`,
        'Midday temperature (°C)',
        environment.climate.temperatureMax,
        (next) => edit((current) => setClimateNumber(current, 'temperatureMax', next)),
      )}
      {@render numberRow(
        `${uid}-climate-humidity`,
        'Climate humidity (0 to 1)',
        environment.climate.humidity,
        (next) => edit((current) => setClimateNumber(current, 'humidity', next)),
      )}
      {@render numberRow(
        `${uid}-climate-cloud`,
        'Cloud cover (0 to 1)',
        environment.climate.cloudCover,
        (next) => edit((current) => setClimateNumber(current, 'cloudCover', next)),
      )}
      {@render numberRow(
        `${uid}-climate-precipitation-amount`,
        'Precipitation amount (0 to 1)',
        environment.climate.precipitationAmount,
        (next) => edit((current) => setClimateNumber(current, 'precipitationAmount', next)),
      )}
      {@render numberRow(
        `${uid}-climate-precipitation-frequency`,
        'Precipitation frequency (0 to 1)',
        environment.climate.precipitationFrequency,
        (next) => edit((current) => setClimateNumber(current, 'precipitationFrequency', next)),
      )}
      {@render numberRow(
        `${uid}-wind-x`,
        'Wind east–west',
        environment.climate.wind[0] ?? 0,
        (next) => edit((current) => setClimateWindComponent(current, 0, next)),
      )}
      {@render numberRow(
        `${uid}-wind-y`,
        'Wind north–south',
        environment.climate.wind[1] ?? 0,
        (next) => edit((current) => setClimateWindComponent(current, 1, next)),
      )}

      {#each environment.climate.seasons as season, index (index)}
        {@render textRow(
          `${uid}-season-${index}-name`,
          `Season ${index + 1} name`,
          season.name,
          (next) => edit((current) => setSeasonName(current, index, next)),
        )}
        {@render numberRow(
          `${uid}-season-${index}-temperature`,
          `Season ${index + 1} temperature shift (°C)`,
          season.temperatureAdjustment,
          (next) =>
            edit((current) => setSeasonAdjustment(current, index, 'temperatureAdjustment', next)),
        )}
        {@render numberRow(
          `${uid}-season-${index}-humidity`,
          `Season ${index + 1} humidity shift`,
          season.humidityAdjustment,
          (next) =>
            edit((current) => setSeasonAdjustment(current, index, 'humidityAdjustment', next)),
        )}
      {/each}
    </fieldset>

    <fieldset>
      <legend>Terrain</legend>

      {@render numberRow(
        `${uid}-terrain-elevation-min`,
        'Lowest elevation (−1 to 1)',
        environment.terrain.elevationMin,
        (next) => edit((current) => setTerrainNumber(current, 'elevationMin', next)),
      )}
      {@render numberRow(
        `${uid}-terrain-elevation-max`,
        'Highest elevation (−1 to 1)',
        environment.terrain.elevationMax,
        (next) => edit((current) => setTerrainNumber(current, 'elevationMax', next)),
      )}
      {@render numberRow(
        `${uid}-terrain-relief`,
        'Relief energy (0 to 1)',
        environment.terrain.reliefEnergy,
        (next) => edit((current) => setTerrainNumber(current, 'reliefEnergy', next)),
      )}
      {@render numberRow(
        `${uid}-slope-x`,
        'Slope east–west',
        environment.terrain.normalVector[0] ?? 0,
        (next) => edit((current) => setTerrainSlopeComponent(current, 0, next)),
      )}
      {@render numberRow(
        `${uid}-slope-y`,
        'Slope north–south',
        environment.terrain.normalVector[1] ?? 0,
        (next) => edit((current) => setTerrainSlopeComponent(current, 1, next)),
      )}

      {#each TERRAIN_LISTS as list (list.field)}
        {#each terrainListOf(environment, list.field) as entry, index (index)}
          <div class="environment-editor__row">
            {@render textRow(
              `${uid}-terrain-${list.field}-${index}`,
              `${list.label} ${index + 1}`,
              entry,
              (next) => edit((current) => setTerrainListEntry(current, list.field, index, next)),
            )}
            <BaseButton
              aria-label="Remove {list.label.toLowerCase()} {index + 1}"
              onclick={() => edit((current) => removeTerrainListEntry(current, list.field, index))}
            >
              Remove
            </BaseButton>
          </div>
        {/each}
        <BaseButton onclick={() => edit((current) => addTerrainListEntry(current, list.field))}>
          Add {list.label.toLowerCase()}
        </BaseButton>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Water</legend>

      {@render textRow(
        `${uid}-water-type`,
        'Water type',
        environment.waterSystem.waterType,
        (next) => edit((current) => setWaterType(current, next)),
      )}
      {@render numberRow(
        `${uid}-water-level`,
        'Water surface level (−1 to 1)',
        environment.waterSystem.surfaceLevel,
        (next) => edit((current) => setWaterNumber(current, 'surfaceLevel', next)),
      )}
      {@render numberRow(
        `${uid}-water-temperature`,
        'Water temperature (°C)',
        environment.waterSystem.temperature,
        (next) => edit((current) => setWaterNumber(current, 'temperature', next)),
      )}
      {@render numberRow(
        `${uid}-current-x`,
        'Current east–west',
        environment.waterSystem.current[0] ?? 0,
        (next) => edit((current) => setWaterCurrentComponent(current, 0, next)),
      )}
      {@render numberRow(
        `${uid}-current-y`,
        'Current north–south',
        environment.waterSystem.current[1] ?? 0,
        (next) => edit((current) => setWaterCurrentComponent(current, 1, next)),
      )}
    </fieldset>
  </div>
{/if}

<style>
  .environment-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .environment-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the encounter, dungeon and character editors: a fieldset
       inside an editor panel was a box inside a box, and the legend and the spacing already group
       these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .environment-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .environment-editor :global(.input-group) {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .environment-editor :global(input[type='text']),
  .environment-editor :global(input[type='number']),
  .environment-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .environment-editor__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--s3);
    width: 100%;
    min-width: 0;
  }

  .environment-editor__check {
    display: flex;
    align-items: center;
    gap: var(--s3);
  }
</style>

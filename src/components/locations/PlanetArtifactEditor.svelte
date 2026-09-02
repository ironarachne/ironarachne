<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    removeCivilization,
    removeMoon,
    setCivilizationNumber,
    setCivilizationText,
    setMoonNumber,
    setMoonText,
    setPlanetFlag,
    setPlanetNumber,
    setPlanetText,
    validatePlanetSnapshot,
    type BodyNumberField,
    type PlanetSnapshot,
  } from '$lib/astronomical_bodies';

  /**
   * The editing view for a saved planet.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **Nothing here recomputes.** Changing a planet's mass does not recompute its gravity, even
   * though the formula sits one import away — a referee who has set a gravity has made a decision,
   * and quietly overruling it is what 4.2 forbids. The physics lives in the generator, and a
   * re-roll is the button next to this one.
   *
   * **There is no preview here**, matching the star nation's editor. The picture is drawn from the
   * roll's seed, which is provenance rather than payload; the surface around this editor holds it.
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
   * something that is not a planet.
   */
  const accepted = $derived(validatePlanetSnapshot(snapshot));
  const planet = $derived<PlanetSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: PlanetSnapshot) => PlanetSnapshot): void {
    if (planet === undefined) {
      return;
    }
    onChange(change(planet));
  }

  /**
   * The measurements, with the units a referee reads them in.
   *
   * Stated once and rendered for the planet and for every moon, because an `AstronomicalBody` is
   * an `AstronomicalBody` — the page compares a moon against ours and the planet against Earth, but
   * what the fields *are* does not change.
   */
  const MEASUREMENTS: { field: BodyNumberField; label: string }[] = [
    { field: 'orbital_distance', label: 'Distance from star (AU)' },
    { field: 'mass', label: 'Mass (×10²⁴ kg)' },
    { field: 'radius', label: 'Radius (km)' },
    { field: 'gravity', label: 'Gravity (m/s²)' },
    { field: 'orbital_period', label: 'Orbital period (days)' },
    { field: 'rotation_period', label: 'Length of day (hours)' },
    { field: 'axis_of_rotation', label: 'Axial tilt (degrees)' },
    { field: 'surface_pressure', label: 'Surface pressure (atm)' },
    { field: 'surface_temperature', label: 'Average temperature (K)' },
    { field: 'albedo', label: 'Albedo' },
    { field: 'luminosity', label: 'Luminosity (×10²⁶ W)' },
  ];
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

{#if planet === undefined}
  <Notice tone="danger">
    These contents are stored as a planet but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="planet-editor">
    <!-- Qualified as "Planet name" rather than "Name": the panel above already has a field
         labelled "Name" that renames the artifact, and every moon has a name of its own further
         down. Two fields with the same accessible name in one region is the 6.2 failure. -->
    {@render textRow(`${uid}-name`, 'Planet name', planet.name, (next) =>
      edit((current) => setPlanetText(current, 'name', next)),
    )}
    {@render textRow(`${uid}-classification`, 'Planet type', planet.classification, (next) =>
      edit((current) => setPlanetText(current, 'classification', next)),
    )}

    <div class="input-group">
      <label for="{uid}-description">Planet description</label>
      <textarea
        id="{uid}-description"
        rows="3"
        value={planet.description}
        oninput={(event) =>
          edit((current) => setPlanetText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    <fieldset>
      <legend>Measurements</legend>
      {#each MEASUREMENTS as measurement (measurement.field)}
        {@render numberRow(
          `${uid}-${measurement.field}`,
          measurement.label,
          planet[measurement.field],
          (next) => edit((current) => setPlanetNumber(current, measurement.field, next)),
        )}
      {/each}

      <label class="planet-editor__check" for="{uid}-atmosphere">
        <input
          id="{uid}-atmosphere"
          type="checkbox"
          checked={planet.has_atmosphere}
          onchange={(event) =>
            edit((current) =>
              setPlanetFlag(current, 'has_atmosphere', event.currentTarget.checked),
            )}
        />
        This planet has an atmosphere
      </label>

      <label class="planet-editor__check" for="{uid}-rings">
        <input
          id="{uid}-rings"
          type="checkbox"
          checked={planet.has_ring_system}
          onchange={(event) =>
            edit((current) =>
              setPlanetFlag(current, 'has_ring_system', event.currentTarget.checked),
            )}
        />
        This planet has a ring system
      </label>
    </fieldset>

    {#if planet.civilization}
      <fieldset>
        <legend>Civilization</legend>

        {@render textRow(`${uid}-civ-name`, 'Civilization name', planet.civilization.name, (next) =>
          edit((current) => setCivilizationText(current, 'name', next)),
        )}

        <div class="input-group">
          <label for="{uid}-civ-description">Civilization description</label>
          <textarea
            id="{uid}-civ-description"
            rows="2"
            value={planet.civilization.description}
            oninput={(event) =>
              edit((current) =>
                setCivilizationText(current, 'description', event.currentTarget.value),
              )}
          ></textarea>
        </div>

        {@render numberRow(
          `${uid}-civ-population`,
          'Population',
          planet.civilization.population,
          (next) => edit((current) => setCivilizationNumber(current, 'population', next)),
        )}
        {@render numberRow(
          `${uid}-civ-technology`,
          'Technology level',
          planet.civilization.technology_level,
          (next) => edit((current) => setCivilizationNumber(current, 'technology_level', next)),
        )}

        <!-- Shown and not edited: the government and economy are rows of a table the description
             and the export read from by name, and a free-text box over one would let a user write
             a government this build cannot describe. -->
        <p class="planet-editor__note">
          {planet.civilization.government_type.name} government, {planet.civilization.economy_type
            .name} economy. Re-roll to change either.
        </p>

        <BaseButton
          aria-label="Remove the civilization from this planet"
          onclick={() => edit((current) => removeCivilization(current))}
        >
          Remove civilization
        </BaseButton>
      </fieldset>
    {/if}

    {#if planet.moons.length === 0}
      <!-- A planet with no moons is the ordinary case, not a fault. -->
      <p class="planet-editor__note">No moons orbit this planet.</p>
    {/if}

    <!-- Keyed by position rather than by name: two moons may read the same while one is being
         typed, and a key that changed as the user typed would lose focus on every keystroke. -->
    {#each planet.moons as moon, index (index)}
      <fieldset>
        <legend>Moon {index + 1}</legend>

        {@render textRow(`${uid}-moon-${index}-name`, `Moon ${index + 1} name`, moon.name, (next) =>
          edit((current) => setMoonText(current, index, 'name', next)),
        )}
        {@render textRow(
          `${uid}-moon-${index}-classification`,
          `Moon ${index + 1} type`,
          moon.classification,
          (next) => edit((current) => setMoonText(current, index, 'classification', next)),
        )}

        <div class="input-group">
          <label for="{uid}-moon-{index}-description">Moon {index + 1} description</label>
          <textarea
            id="{uid}-moon-{index}-description"
            rows="2"
            value={moon.description}
            oninput={(event) =>
              edit((current) =>
                setMoonText(current, index, 'description', event.currentTarget.value),
              )}
          ></textarea>
        </div>

        {#each MEASUREMENTS as measurement (measurement.field)}
          {@render numberRow(
            `${uid}-moon-${index}-${measurement.field}`,
            `Moon ${index + 1} ${measurement.label.toLowerCase()}`,
            moon[measurement.field],
            (next) => edit((current) => setMoonNumber(current, index, measurement.field, next)),
          )}
        {/each}

        <BaseButton
          aria-label="Remove moon {index + 1}"
          onclick={() => edit((current) => removeMoon(current, index))}
        >
          Remove moon {index + 1}
        </BaseButton>
      </fieldset>
    {/each}
  </div>
{/if}

<style>
  .planet-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .planet-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the editors beside it: a fieldset inside an editor panel
       was a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .planet-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .planet-editor :global(.input-group) {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .planet-editor :global(input[type='text']),
  .planet-editor :global(input[type='number']),
  .planet-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .planet-editor__check {
    display: flex;
    align-items: center;
    gap: var(--s3);
  }

  .planet-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>

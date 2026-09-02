<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    removeSystemBody,
    setStarSystemText,
    setSystemBodyNumber,
    setSystemBodyText,
    validateStarSystemSnapshot,
    type StarSystemBodyList,
    type StarSystemSnapshot,
    type SystemBodyNumberField,
  } from '$lib/astronomical_bodies';

  /**
   * The editing view for a saved star system.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **Bespoke, and not the declared field editor.** `docs/readiness-locations.md` expected this to
   * be a `SnapshotFieldEditor` case on the grounds that a star system is "a list of planets plus a
   * name and a description" — and a list of planets is a list of *records*, each with eleven
   * measurements. That is the fifth tool in the pass to reach the same conclusion.
   *
   * **Nothing here recomputes.** Moving a planet's orbital distance does not re-sort the list, even
   * though the generator sorts by orbit: re-sorting under a referee who has just typed would move
   * the row they were working in, and 4.2 forbids regenerating over an edit either way.
   *
   * **There is no preview here**, matching the planet and star-nation editors. The pictures are
   * drawn from the roll's seed, which is provenance rather than payload.
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
   * something that is not a star system.
   */
  const accepted = $derived(validateStarSystemSnapshot(snapshot));
  const system = $derived<StarSystemSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: StarSystemSnapshot) => StarSystemSnapshot): void {
    if (system === undefined) {
      return;
    }
    onChange(change(system));
  }

  /**
   * The measurements a star is described by, and the ones a planet is.
   *
   * They differ because the fields do: a star's surface pressure and albedo mean nothing, and a
   * planet's luminosity is always zero. Both are on the body type because one of the two kinds of
   * body needs each.
   */
  const STAR_MEASUREMENTS: { field: SystemBodyNumberField; label: string }[] = [
    { field: 'radius', label: 'radius (km)' },
    { field: 'mass', label: 'mass (×10³⁰ kg)' },
    { field: 'luminosity', label: 'luminosity (×10²⁶ W)' },
    { field: 'surface_temperature', label: 'surface temperature (K)' },
  ];

  const PLANET_MEASUREMENTS: { field: SystemBodyNumberField; label: string }[] = [
    { field: 'orbital_distance', label: 'distance from star (AU)' },
    { field: 'mass', label: 'mass (×10²⁴ kg)' },
    { field: 'radius', label: 'radius (km)' },
    { field: 'gravity', label: 'gravity (m/s²)' },
    { field: 'orbital_period', label: 'orbital period (days)' },
    { field: 'rotation_period', label: 'length of day (hours)' },
    { field: 'surface_pressure', label: 'surface pressure (atm)' },
    { field: 'surface_temperature', label: 'average temperature (K)' },
  ];

  const LISTS: {
    list: StarSystemBodyList;
    noun: string;
    measurements: { field: SystemBodyNumberField; label: string }[];
  }[] = [
    { list: 'stars', noun: 'Star', measurements: STAR_MEASUREMENTS },
    { list: 'planets', noun: 'Planet', measurements: PLANET_MEASUREMENTS },
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

{#if system === undefined}
  <Notice tone="danger">
    These contents are stored as a star system but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="system-editor">
    <!-- Qualified as "System name" rather than "Name": the panel above already has a field
         labelled "Name" that renames the artifact, and every body has a name of its own further
         down. Two fields with the same accessible name in one region is the 6.2 failure. -->
    {@render textRow(`${uid}-name`, 'System name', system.name, (next) =>
      edit((current) => setStarSystemText(current, 'name', next)),
    )}

    <div class="input-group">
      <label for="{uid}-description">System description</label>
      <textarea
        id="{uid}-description"
        rows="2"
        value={system.description}
        oninput={(event) =>
          edit((current) => setStarSystemText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    {#each LISTS as group (group.list)}
      {#if system[group.list].length === 0}
        <!-- An empty list is an ordinary state: a user may have removed the last one. -->
        <p class="system-editor__note">No {group.noun.toLowerCase()}s in this system.</p>
      {/if}

      <!-- Keyed by position rather than by name: two bodies may read the same while one is being
           typed, and a key that changed as the user typed would lose focus on every keystroke. -->
      {#each system[group.list] as body, index (index)}
        <fieldset>
          <legend>{group.noun} {index + 1}</legend>

          {@render textRow(
            `${uid}-${group.list}-${index}-name`,
            `${group.noun} ${index + 1} name`,
            body.name,
            (next) =>
              edit((current) => setSystemBodyText(current, group.list, index, 'name', next)),
          )}
          {@render textRow(
            `${uid}-${group.list}-${index}-classification`,
            `${group.noun} ${index + 1} type`,
            body.classification,
            (next) =>
              edit((current) =>
                setSystemBodyText(current, group.list, index, 'classification', next),
              ),
          )}

          <div class="input-group">
            <label for="{uid}-{group.list}-{index}-description">
              {group.noun}
              {index + 1} description
            </label>
            <textarea
              id="{uid}-{group.list}-{index}-description"
              rows="2"
              value={body.description}
              oninput={(event) =>
                edit((current) =>
                  setSystemBodyText(
                    current,
                    group.list,
                    index,
                    'description',
                    event.currentTarget.value,
                  ),
                )}
            ></textarea>
          </div>

          {#each group.measurements as measurement (measurement.field)}
            {@render numberRow(
              `${uid}-${group.list}-${index}-${measurement.field}`,
              `${group.noun} ${index + 1} ${measurement.label}`,
              body[measurement.field],
              (next) =>
                edit((current) =>
                  setSystemBodyNumber(current, group.list, index, measurement.field, next),
                ),
            )}
          {/each}

          <BaseButton
            aria-label="Remove {group.noun.toLowerCase()} {index + 1} from this system"
            onclick={() => edit((current) => removeSystemBody(current, group.list, index))}
          >
            Remove {group.noun.toLowerCase()}
            {index + 1}
          </BaseButton>
        </fieldset>
      {/each}
    {/each}
  </div>
{/if}

<style>
  .system-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .system-editor fieldset {
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

  .system-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .system-editor :global(.input-group) {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .system-editor :global(input[type='text']),
  .system-editor :global(input[type='number']),
  .system-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .system-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>

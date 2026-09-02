<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    removeRegionPlace,
    setRealmText,
    setRegionMainRealm,
    setRegionPlaceText,
    setRegionText,
    validateRegionSnapshot,
    type RegionPlaceList,
    type RegionSnapshot,
  } from '$lib/regions';

  /**
   * The editing view for a saved region.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **Bespoke, as the design says** — a region is a list of places with a map beside it, and the
   * sixth tool in the pass to need one rather than the declared field editor.
   *
   * **The map is shown and not edited.** It is a graph whose indices the realms' tiles and the
   * roads both point into; a text box over one of those numbers would detach a realm from its land
   * and nothing would say so until the map was drawn.
   *
   * **The arms are not here.** They have an editor of their own — the heraldry kind's — and the
   * generator page opens it in a modal. A second copy of the site's most intricate component inside
   * this one would be two things to keep in step.
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
   * something that is not a region.
   */
  const accepted = $derived(validateRegionSnapshot(snapshot));
  const region = $derived<RegionSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: RegionSnapshot) => RegionSnapshot): void {
    if (region === undefined) {
      return;
    }
    onChange(change(region));
  }

  const PLACE_LISTS: { list: RegionPlaceList; noun: string }[] = [
    { list: 'settlements', noun: 'Settlement' },
    { list: 'organizations', noun: 'Organization' },
  ];
</script>

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

{#if region === undefined}
  <Notice tone="danger">
    These contents are stored as a region but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="region-editor">
    <!-- Qualified as "Region name" rather than "Name": the panel above already has a field
         labelled "Name" that renames the artifact, and every realm and settlement has a name of
         its own further down. Two fields with the same accessible name in one region is the 6.2
         failure. -->
    {@render textRow(`${uid}-name`, 'Region name', region.name, (next) =>
      edit((current) => setRegionText(current, 'name', next)),
    )}

    <div class="input-group">
      <label for="{uid}-description">Region description</label>
      <textarea
        id="{uid}-description"
        rows="3"
        value={region.description}
        oninput={(event) =>
          edit((current) => setRegionText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    {#if region.realms.length > 0}
      <div class="input-group input-group--inline">
        <label for="{uid}-seat">Seat of the region</label>
        <select
          id="{uid}-seat"
          value={region.mainRealm}
          onchange={(event) =>
            edit((current) => setRegionMainRealm(current, Number(event.currentTarget.value)))}
        >
          {#each region.realms as realm, index (index)}
            <option value={index}>{realm.name === '' ? `Realm ${index + 1}` : realm.name}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Shown and not edited: the map is what the realms' tiles point into. -->
    <p class="region-editor__note">
      The map is {region.map.width} by {region.map.height}, with {region.map.nodes.length} tiles. Re-roll
      to get a different one.
    </p>

    {#each region.realms as realm, index (index)}
      <fieldset>
        <legend>Realm {index + 1}</legend>

        {@render textRow(
          `${uid}-realm-${index}-name`,
          `Realm ${index + 1} name`,
          realm.name,
          (next) => edit((current) => setRealmText(current, index, 'name', next)),
        )}
        {@render textRow(
          `${uid}-realm-${index}-adjective`,
          `Realm ${index + 1} adjective`,
          realm.adjective,
          (next) => edit((current) => setRealmText(current, index, 'adjective', next)),
        )}

        <div class="input-group">
          <label for="{uid}-realm-{index}-description">Realm {index + 1} description</label>
          <textarea
            id="{uid}-realm-{index}-description"
            rows="2"
            value={realm.description}
            oninput={(event) =>
              edit((current) =>
                setRealmText(current, index, 'description', event.currentTarget.value),
              )}
          ></textarea>
        </div>

        <p class="region-editor__note">
          {realm.realmTypeName}, ruled by {realm.authority.firstName}
          {realm.authority.lastName}. Its arms and its ruler are edited where they live.
        </p>
      </fieldset>
    {/each}

    {#each PLACE_LISTS as group (group.list)}
      {#if region[group.list].length === 0}
        <!-- An empty list is an ordinary state: a user may have removed the last one. -->
        <p class="region-editor__note">No {group.noun.toLowerCase()}s in this region.</p>
      {/if}

      <!-- Keyed by position rather than by name: two may read the same while one is being typed,
           and a key that changed as the user typed would lose focus on every keystroke. -->
      {#each region[group.list] as place, index (index)}
        <fieldset>
          <legend>{group.noun} {index + 1}</legend>

          {@render textRow(
            `${uid}-${group.list}-${index}-name`,
            `${group.noun} ${index + 1} name`,
            place.name,
            (next) =>
              edit((current) => setRegionPlaceText(current, group.list, index, 'name', next)),
          )}

          <div class="input-group">
            <label for="{uid}-{group.list}-{index}-description">
              {group.noun}
              {index + 1} description
            </label>
            <textarea
              id="{uid}-{group.list}-{index}-description"
              rows="2"
              value={place.description}
              oninput={(event) =>
                edit((current) =>
                  setRegionPlaceText(
                    current,
                    group.list,
                    index,
                    'description',
                    event.currentTarget.value,
                  ),
                )}
            ></textarea>
          </div>

          <BaseButton
            aria-label="Remove {group.noun.toLowerCase()} {index + 1} from this region"
            onclick={() => edit((current) => removeRegionPlace(current, group.list, index))}
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
  .region-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .region-editor fieldset {
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

  .region-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .region-editor :global(.input-group) {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .region-editor :global(input[type='text']),
  .region-editor textarea,
  .region-editor select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .region-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>

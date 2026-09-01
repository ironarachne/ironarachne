<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addVelgarthGift,
    removeVelgarthGift,
    setVelgarthGiftStrength,
    setVelgarthGiftText,
    validateVelgarthGiftsSnapshot,
    VELGARTH_STRENGTHS,
    type VelgarthGiftsSnapshot,
  } from '$lib/velgarth_gifts';

  /**
   * The editing view for a saved set of Velgarth Gifts.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is one row per Gift and the calls that change it.
   *
   * **This is not the `SnapshotFieldEditor` case docs/readiness-characters.md called it.** That
   * component (decision 5 of docs/tool-readiness.md) is a list of labelled inputs bound to the
   * fields of a *flat* object; a set of Gifts is a list of records, three fields each, with its own
   * add and remove. The decision's own guard is what applies — a payload the descriptor language
   * does not describe gets a bespoke editor rather than a fifth control — so the declared component
   * is still waiting for the first genuinely flat payload in the pass to build it.
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
   * something that is not a set of Gifts.
   */
  const accepted = $derived(validateVelgarthGiftsSnapshot(snapshot));
  const gifts = $derived<VelgarthGiftsSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: VelgarthGiftsSnapshot) => VelgarthGiftsSnapshot): void {
    if (gifts === undefined) {
      return;
    }
    onChange(change(gifts));
  }
</script>

{#if gifts === undefined}
  <Notice tone="danger">
    These contents are stored as a set of Velgarth Gifts but do not read as one, so there is nothing
    safe to edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="gifts-editor">
    {#if gifts.gifts.length === 0}
      <!-- A set with nothing in it is an ordinary state, not a fault: a user may have removed every
           Gift on the way to writing their own. -->
      <p class="gifts-editor__note">No Gifts in this set yet.</p>
    {/if}

    <!-- Keyed by position rather than by name: two rows may read the same while one is being
         typed, and a key that changed as the user typed would lose focus on every keystroke. -->
    {#each gifts.gifts as gift, index (index)}
      <fieldset>
        <legend>Gift {index + 1}</legend>

        <div class="input-group input-group--inline">
          <label for="{uid}-gift-{index}-name">Name</label>
          <input
            id="{uid}-gift-{index}-name"
            type="text"
            value={gift.name}
            oninput={(event) =>
              edit((current) =>
                setVelgarthGiftText(current, index, 'name', event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-gift-{index}-strength">Strength</label>
          <select
            id="{uid}-gift-{index}-strength"
            value={String(gift.strength)}
            onchange={(event) =>
              edit((current) =>
                setVelgarthGiftStrength(current, index, Number(event.currentTarget.value)),
              )}
          >
            {#each VELGARTH_STRENGTHS as strength (strength)}
              <option value={String(strength)}>{strength}</option>
            {/each}
          </select>
        </div>

        <!-- The description is the user's, not a table's: it was assembled from two rows at
             generation time, so there is nothing to derive it from and nothing a rewrite loses.
             Raising the strength above deliberately does not rewrite it. -->
        <div class="input-group input-group--inline">
          <label for="{uid}-gift-{index}-description">What it does</label>
          <textarea
            id="{uid}-gift-{index}-description"
            rows="3"
            value={gift.description}
            oninput={(event) =>
              edit((current) =>
                setVelgarthGiftText(current, index, 'description', event.currentTarget.value),
              )}
          ></textarea>
        </div>

        <BaseButton
          aria-label="Remove Gift {index + 1}"
          onclick={() => edit((current) => removeVelgarthGift(current, index))}
        >
          Remove Gift {index + 1}
        </BaseButton>
      </fieldset>
    {/each}

    <BaseButton onclick={() => edit(addVelgarthGift)}>Add a Gift</BaseButton>
  </div>
{/if}

<style>
  .gifts-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .gifts-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the character editors: a fieldset inside an editor panel
       was a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .gifts-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .gifts-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .gifts-editor input[type='text'],
  .gifts-editor select,
  .gifts-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .gifts-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>

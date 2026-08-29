<script lang="ts">
  import type { Arms } from '$lib/heraldry';
  import {
    appendSavedHeraldry,
    loadSavedHeraldrySnapshots,
    defaultHeraldryGeneratorOptions,
    heraldryFromSnapshot,
    toHeraldrySnapshot,
    type HeraldrySnapshot,
    renderHeraldryDeviceSvg,
  } from '$lib/heraldry';
  import { showAlertModal } from '$lib/ui';
  import type { RNG } from '@ironarachne/rng';
  import BaseButton from '$components/common/BaseButton.svelte';
  import ListButton from '$components/common/ListButton.svelte';

  type Props = {
    arms: Arms;
    seed: string;
    title?: string;
    rng: RNG;
    onDismiss: () => void;
    onReplace: (arms: Arms) => void;
  };

  const { arms, seed, title, rng, onDismiss, onReplace }: Props = $props();

  const previewWidth = 120;
  const previewHeight = 132;

  const defaultGeneratorOptions = defaultHeraldryGeneratorOptions;

  let savedHeraldries = $state<HeraldrySnapshot[]>([]);
  const isCurrentBlazonSaved = $derived(
    savedHeraldries.some((saved) => saved.blazon === arms.blazon),
  );

  $effect(() => {
    // These bare reads are load-bearing: they register `arms` and `seed` as dependencies so the
    // saved list refreshes when either changes. `refreshSavedHeraldries` does not read them.
    /* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
    arms;
    /* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
    seed;
    refreshSavedHeraldries();
  });

  function refreshSavedHeraldries() {
    savedHeraldries = loadSavedHeraldrySnapshots();
  }

  function saveCurrentHeraldry() {
    const result = appendSavedHeraldry(toHeraldrySnapshot(arms, seed, defaultGeneratorOptions()));
    if (!result.ok) {
      void showAlertModal({
        message: 'This heraldry is already saved.',
      });
      return;
    }
    refreshSavedHeraldries();
    void showAlertModal({
      message: 'Heraldry saved.',
      style: 'success',
    });
  }

  function replaceWithSavedHeraldry(snapshot: HeraldrySnapshot) {
    const restored = heraldryFromSnapshot(snapshot);
    onReplace(restored.arms);
  }
</script>

<div class="panel__field">
  <header class="panel__header">
    <div class="panel__header-field">
      <h2 id="modal-dialog-title" class="panel__title">{title ?? 'Heraldry'}</h2>
    </div>
  </header>

  <div class="panel__body">
    <p class="heraldry-persistence__blazon">{arms.blazon}</p>

    <div class="heraldry-persistence__preview">
      <!-- Renders app-generated markup (no external or user-supplied input). -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html renderHeraldryDeviceSvg(arms.device, previewWidth, previewHeight, rng)}
    </div>

    <!-- A dialog is a question, so its answers sit where the eye finishes. -->
    <div class="panel__footer">
      <BaseButton onclick={saveCurrentHeraldry} disabled={isCurrentBlazonSaved}>Save</BaseButton>
      <BaseButton onclick={onDismiss}>Close</BaseButton>
    </div>

    <div class="heraldry-persistence__saved">
      <h3>Replace with saved heraldry</h3>

      {#if savedHeraldries.length === 0}
        <p class="heraldry-persistence__empty">No saved heraldry yet.</p>
      {:else}
        <!-- A well: a run of rows that has to read as held by the dialog rather than as continuing
             past its edge, and the one surface allowed to be cut off mid-row. The rows are list
             rows, so a saved coat of arms is picked the same way an artifact or a tool is —
             the row itself is the choice, rather than a row with a button on the end of it. -->
        <ul class="well heraldry-persistence__list">
          {#each savedHeraldries as saved, index (index)}
            <li>
              <ListButton
                onclick={() => replaceWithSavedHeraldry(saved)}
                class="heraldry-persistence__row"
              >
                <span class="heraldry-persistence__row-preview">
                  <!-- Renders app-generated markup (no external or user-supplied input). -->
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html renderHeraldryDeviceSvg(
                    heraldryFromSnapshot(saved).arms.device,
                    48,
                    53,
                    rng,
                  )}
                </span>
                <span class="heraldry-persistence__row-details">
                  <span class="heraldry-persistence__row-name">{saved.name}</span>
                  <span class="heraldry-persistence__row-seed">Seed: {saved.seed}</span>
                </span>
              </ListButton>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>

<style>
  /* The frame, the plate, the well and the rows are all the system's. What is left here is the
     preview's own geometry, which is a picture's size rather than a spacing decision, and the way
     a row lays its three parts out. */

  .heraldry-persistence__blazon {
    color: var(--ink-muted);
    font: var(--t-small);
    margin: 0;
    max-width: var(--measure);
  }

  /* The device's own aspect, not a spacing step: a shield is 120 by 132. */
  .heraldry-persistence__preview {
    height: 132px;
    margin-inline: auto;
    width: 120px;
  }

  .heraldry-persistence__saved {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-height: 0;
  }

  .heraldry-persistence__saved h3 {
    margin: 0;
  }

  .heraldry-persistence__empty {
    color: var(--ink-muted);
    font: var(--t-small);
    margin: 0;
  }

  .heraldry-persistence__list {
    display: flex;
    flex-direction: column;
    gap: var(--s1);
    list-style: none;
    margin: 0;
    max-height: 16rem;
  }

  :global(.heraldry-persistence__row) {
    width: 100%;
  }

  .heraldry-persistence__row-preview {
    flex: 0 0 48px;
    height: 53px;
    width: 48px;
  }

  .heraldry-persistence__row-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .heraldry-persistence__row-name {
    overflow-wrap: anywhere;
  }

  .heraldry-persistence__row-seed {
    color: var(--ink-muted);
    font: var(--t-small);
    overflow-wrap: anywhere;
  }
</style>

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

<div class="modal-dialog-content modal-dialog-content--message heraldry-persistence-modal">
  <h2 id="modal-dialog-title" class="modal-dialog-title">
    {title ?? 'Heraldry'}
  </h2>

  <p class="heraldry-persistence-blazon">{arms.blazon}</p>

  <div class="heraldry-persistence-preview">
    <!-- Renders app-generated markup (no external or user-supplied input). -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html renderHeraldryDeviceSvg(arms.device, previewWidth, previewHeight, rng)}
  </div>

  <div class="modal-dialog-actions heraldry-persistence-actions">
    <BaseButton onclick={saveCurrentHeraldry} disabled={isCurrentBlazonSaved}>Save</BaseButton>
    <BaseButton onclick={onDismiss}>Close</BaseButton>
  </div>

  <h3 class="heraldry-persistence-saved-heading">Replace with saved heraldry</h3>

  {#if savedHeraldries.length === 0}
    <p class="heraldry-persistence-empty">No saved heraldry yet.</p>
  {:else}
    <ul class="heraldry-persistence-list">
      {#each savedHeraldries as saved, index (index)}
        <li class="heraldry-persistence-item">
          <div class="heraldry-persistence-item-preview">
            <!-- Renders app-generated markup (no external or user-supplied input). -->
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html renderHeraldryDeviceSvg(heraldryFromSnapshot(saved).arms.device, 48, 53, rng)}
          </div>
          <div class="heraldry-persistence-item-details">
            <p class="heraldry-persistence-item-name">{saved.name}</p>
            <p class="heraldry-persistence-item-seed">Seed: {saved.seed}</p>
          </div>
          <BaseButton onclick={() => replaceWithSavedHeraldry(saved)}>Use</BaseButton>
        </li>
      {/each}
    </ul>
  {/if}
</div>

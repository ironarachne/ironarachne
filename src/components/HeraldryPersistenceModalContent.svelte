<script lang="ts">
  import type { Arms } from '$lib/heraldry/arms';
  import {
    appendSavedHeraldry,
    loadSavedHeraldrySnapshots,
  } from '$lib/heraldry/heraldry_saved_state';
  import {
    defaultHeraldryGeneratorOptions,
    heraldryFromSnapshot,
    toHeraldrySnapshot,
    type HeraldrySnapshot,
  } from '$lib/heraldry/heraldry_snapshot';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry/renderers/svg';
  import { showAlertModal } from '$lib/ui/modal';
  import type { RNG } from '@ironarachne/rng';

  type Props = {
    arms: Arms;
    seed: string;
    title?: string;
    rng: RNG;
    onDismiss: () => void;
    onReplace: (arms: Arms) => void;
  };

  let { arms, seed, title, rng, onDismiss, onReplace }: Props = $props();

  const previewWidth = 120;
  const previewHeight = 132;

  const defaultGeneratorOptions = defaultHeraldryGeneratorOptions;

  let savedHeraldries = $state<HeraldrySnapshot[]>([]);
  const isCurrentBlazonSaved = $derived(
    savedHeraldries.some((saved) => saved.blazon === arms.blazon),
  );

  $effect(() => {
    arms;
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
    {@html renderHeraldryDeviceSvg(arms.device, previewWidth, previewHeight, rng)}
  </div>

  <div class="modal-dialog-actions heraldry-persistence-actions">
    <button type="button" onclick={saveCurrentHeraldry} disabled={isCurrentBlazonSaved}>Save</button
    >
    <button type="button" onclick={onDismiss}>Close</button>
  </div>

  <h3 class="heraldry-persistence-saved-heading">Replace with saved heraldry</h3>

  {#if savedHeraldries.length === 0}
    <p class="heraldry-persistence-empty">No saved heraldry yet.</p>
  {:else}
    <ul class="heraldry-persistence-list">
      {#each savedHeraldries as saved, index (index)}
        <li class="heraldry-persistence-item">
          <div class="heraldry-persistence-item-preview">
            {@html renderHeraldryDeviceSvg(heraldryFromSnapshot(saved).arms.device, 48, 53, rng)}
          </div>
          <div class="heraldry-persistence-item-details">
            <p class="heraldry-persistence-item-name">{saved.name}</p>
            <p class="heraldry-persistence-item-seed">Seed: {saved.seed}</p>
          </div>
          <button type="button" onclick={() => replaceWithSavedHeraldry(saved)}>Use</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

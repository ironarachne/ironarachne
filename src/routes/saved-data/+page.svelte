<script lang="ts">
  import { onMount } from 'svelte';

  import { deleteSavedCultureByName, loadSavedCultureSnapshots } from '$lib/culture/culture_saved_state';
  import type { CultureSnapshot } from '$lib/culture/culture_snapshot';
  import { deleteSavedHeraldryByBlazon, loadSavedHeraldrySnapshots } from '$lib/heraldry/heraldry_saved_state';
  import type { HeraldrySnapshot } from '$lib/heraldry/heraldry_snapshot';
  import {
    cultureGeneratorHref,
    heraldryGeneratorHref,
    religionGeneratorHref,
  } from '$lib/persistent_save/saved_data_links';
  import { deleteSavedReligionBySeed, loadSavedReligionSnapshots } from '$lib/religion/religion_saved_state';
  import type { ReligionSnapshot } from '$lib/religion/religion_snapshot';
  import { showConfirmModal } from '$lib/ui/modal';

  let heraldryEntries = $state<HeraldrySnapshot[]>([]);
  let cultureEntries = $state<CultureSnapshot[]>([]);
  let religionEntries = $state<ReligionSnapshot[]>([]);
  let heraldryPreviewSvgs = $state<Record<string, string | null>>({});
  let loadError = $state<string | null>(null);

  const hasAnySavedData = $derived(
    heraldryEntries.length + cultureEntries.length + religionEntries.length > 0,
  );

  onMount(() => {
    void refreshEntries();
  });

  async function refreshEntries() {
    loadError = null;
    heraldryEntries = loadSavedHeraldrySnapshots();
    cultureEntries = loadSavedCultureSnapshots();
    religionEntries = loadSavedReligionSnapshots();

    if (heraldryEntries.length === 0) {
      heraldryPreviewSvgs = {};
      return;
    }

    try {
      const { buildHeraldryPreviewMap } = await import('$lib/persistent_save/saved_data_preview.js');
      heraldryPreviewSvgs = buildHeraldryPreviewMap(heraldryEntries);
    } catch {
      loadError = 'Could not render one or more heraldry previews.';
      heraldryPreviewSvgs = {};
    }
  }

  async function downloadHeraldrySvg(snapshot: HeraldrySnapshot) {
    const { downloadHeraldrySvg: downloadSvg } = await import(
      '$lib/persistent_save/saved_data_download.js'
    );
    downloadSvg(snapshot);
  }

  async function downloadHeraldryPng(snapshot: HeraldrySnapshot) {
    const { downloadHeraldryPng: downloadPng } = await import(
      '$lib/persistent_save/saved_data_download.js'
    );
    downloadPng(snapshot);
  }

  async function downloadCultureJson(snapshot: CultureSnapshot) {
    const { downloadCultureJson: downloadJson } = await import(
      '$lib/persistent_save/saved_data_download.js'
    );
    downloadJson(snapshot);
  }

  async function downloadReligionJson(snapshot: ReligionSnapshot) {
    const { downloadReligionJson: downloadJson } = await import(
      '$lib/persistent_save/saved_data_download.js'
    );
    downloadJson(snapshot);
  }

  async function confirmDeleteHeraldry(snapshot: HeraldrySnapshot) {
    const confirmed = await showConfirmModal({
      title: 'Delete saved data',
      message: `Delete "${snapshot.name}"? This cannot be undone.`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    if (deleteSavedHeraldryByBlazon(snapshot.blazon)) {
      await refreshEntries();
    }
  }

  async function confirmDeleteCulture(snapshot: CultureSnapshot) {
    const confirmed = await showConfirmModal({
      title: 'Delete saved data',
      message: `Delete "${snapshot.name}"? This cannot be undone.`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    if (deleteSavedCultureByName(snapshot.name)) {
      await refreshEntries();
    }
  }

  async function confirmDeleteReligion(snapshot: ReligionSnapshot) {
    const confirmed = await showConfirmModal({
      title: 'Delete saved data',
      message: `Delete "${snapshot.name}"? This cannot be undone.`,
      okLabel: 'Delete',
      cancelLabel: 'Cancel',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    if (deleteSavedReligionBySeed(snapshot.seed)) {
      await refreshEntries();
    }
  }
</script>

<svelte:head>
  <title>Saved Data | Iron Arachne</title>
</svelte:head>

<section class="saved-data-page">
  <h1>Saved Data</h1>

  <p>
    Manage heraldry, cultures, and religions saved in this browser. Open an item in its generator,
    download it, or delete it.
  </p>

  {#if loadError}
    <p class="saved-data-error">{loadError}</p>
  {/if}

  {#if !hasAnySavedData}
    <p class="saved-data-empty">
      Nothing saved yet. Save items from the
      <a href="/heraldry">heraldry</a>,
      <a href="/culture">culture</a>, or
      <a href="/fantasy/religion">religion</a> generators.
    </p>
  {:else}
    {#if heraldryEntries.length > 0}
      <h2>Heraldry</h2>
      <ul class="saved-data-list">
        {#each heraldryEntries as snapshot (snapshot.blazon)}
          <li class="saved-data-item">
            <div class="saved-data-item-preview">
              {#if heraldryPreviewSvgs[snapshot.blazon]}
                {@html heraldryPreviewSvgs[snapshot.blazon]}
              {:else}
                <p class="saved-data-preview-unavailable">Preview unavailable</p>
              {/if}
            </div>
            <div class="saved-data-item-details">
              <p class="saved-data-item-name">{snapshot.name}</p>
              <p class="saved-data-item-meta">Seed: {snapshot.seed}</p>
            </div>
            <div class="saved-data-item-actions">
              <a class="saved-data-action-link" href={heraldryGeneratorHref(snapshot)}>Open</a>
              <button type="button" onclick={() => downloadHeraldrySvg(snapshot)}>Download SVG</button>
              <button type="button" onclick={() => downloadHeraldryPng(snapshot)}>Download PNG</button>
              <button type="button" onclick={() => confirmDeleteHeraldry(snapshot)}>Delete</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    {#if cultureEntries.length > 0}
      <h2>Cultures</h2>
      <ul class="saved-data-list">
        {#each cultureEntries as snapshot (snapshot.name)}
          <li class="saved-data-item">
            <div class="saved-data-item-details">
              <p class="saved-data-item-name">{snapshot.name}</p>
            </div>
            <div class="saved-data-item-actions">
              <a class="saved-data-action-link" href={cultureGeneratorHref(snapshot)}>Open</a>
              <button type="button" onclick={() => downloadCultureJson(snapshot)}>Download JSON</button>
              <button type="button" onclick={() => confirmDeleteCulture(snapshot)}>Delete</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    {#if religionEntries.length > 0}
      <h2>Religions</h2>
      <ul class="saved-data-list">
        {#each religionEntries as snapshot (snapshot.seed)}
          <li class="saved-data-item">
            <div class="saved-data-item-details">
              <p class="saved-data-item-name">{snapshot.name}</p>
              <p class="saved-data-item-meta">Seed: {snapshot.seed}</p>
            </div>
            <div class="saved-data-item-actions">
              <a class="saved-data-action-link" href={religionGeneratorHref(snapshot)}>Open</a>
              <button type="button" onclick={() => downloadReligionJson(snapshot)}>Download JSON</button>
              <button type="button" onclick={() => confirmDeleteReligion(snapshot)}>Delete</button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</section>

<style>
  .saved-data-page p {
    max-width: 42rem;
  }

  .saved-data-empty,
  .saved-data-error {
    margin-top: 1rem;
  }

  .saved-data-error {
    color: var(--crimson, #c44);
  }

  .saved-data-list {
    list-style: none;
    margin: 0 0 2rem;
    padding: 0;
  }

  .saved-data-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .saved-data-item:last-child {
    border-bottom: none;
  }

  .saved-data-item-preview {
    flex: 0 0 auto;
    width: 120px;
  }

  .saved-data-preview-unavailable {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .saved-data-item-details {
    flex: 1 1 auto;
    min-width: 0;
  }

  .saved-data-item-name,
  .saved-data-item-meta {
    margin: 0;
  }

  .saved-data-item-name {
    font-weight: 600;
  }

  .saved-data-item-meta {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .saved-data-item-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .saved-data-action-link {
    display: inline-block;
    text-decoration: none;
  }
</style>

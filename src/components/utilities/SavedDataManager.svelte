<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';

  import {
    deleteSavedCultureByName,
    loadSavedCultureSnapshots,
  } from '$lib/culture/culture_saved_state';
  import type { CultureSnapshot } from '$lib/culture/culture_snapshot';
  import {
    deleteSavedHeraldryByBlazon,
    loadSavedHeraldrySnapshots,
  } from '$lib/heraldry/heraldry_saved_state';
  import type { HeraldrySnapshot } from '$lib/heraldry/heraldry_snapshot';
  import {
    cultureGeneratorHref,
    heraldryGeneratorHref,
    religionGeneratorHref,
  } from '$lib/persistent_save/saved_data_links';
  import {
    deleteSavedReligionBySeed,
    loadSavedReligionSnapshots,
  } from '$lib/religion/religion_saved_state';
  import type { ReligionSnapshot } from '$lib/religion/religion_snapshot';
  import { showConfirmModal } from '$lib/ui/modal';
  import SavedDataListItem from '$components/utilities/SavedDataListItem.svelte';

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
      const { buildHeraldryPreviewMap } =
        await import('$lib/persistent_save/saved_data_preview.js');
      heraldryPreviewSvgs = buildHeraldryPreviewMap(heraldryEntries);
    } catch {
      loadError = 'Could not render one or more heraldry previews.';
      heraldryPreviewSvgs = {};
    }
  }

  async function downloadHeraldrySvg(snapshot: HeraldrySnapshot) {
    const { downloadHeraldrySvg: downloadSvg } =
      await import('$lib/persistent_save/saved_data_download.js');
    downloadSvg(snapshot);
  }

  async function downloadHeraldryPng(snapshot: HeraldrySnapshot) {
    const { downloadHeraldryPng: downloadPng } =
      await import('$lib/persistent_save/saved_data_download.js');
    downloadPng(snapshot);
  }

  async function downloadCultureJson(snapshot: CultureSnapshot) {
    const { downloadCultureJson: downloadJson } =
      await import('$lib/persistent_save/saved_data_download.js');
    downloadJson(snapshot);
  }

  async function downloadReligionJson(snapshot: ReligionSnapshot) {
    const { downloadReligionJson: downloadJson } =
      await import('$lib/persistent_save/saved_data_download.js');
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

  // The *GeneratorHref helpers put the route through `resolve()` before appending the query
  // string, so these targets are already base-path correct. The lint rule only recognises a
  // literal `resolve()` call at the navigation site, hence the disables.

  function openHeraldry(snapshot: HeraldrySnapshot) {
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(heraldryGeneratorHref(snapshot));
  }

  function openCulture(snapshot: CultureSnapshot) {
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(cultureGeneratorHref(snapshot));
  }

  function openReligion(snapshot: ReligionSnapshot) {
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(religionGeneratorHref(snapshot));
  }
</script>

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
      <a href={resolve('/heraldry')}>heraldry</a>,
      <a href={resolve('/culture')}>culture</a>, or
      <a href={resolve('/fantasy/religion')}>religion</a> generators.
    </p>
  {:else}
    {#if heraldryEntries.length > 0}
      <h2>Heraldry</h2>
      <ul class="saved-data-list">
        {#each heraldryEntries as snapshot (snapshot.blazon)}
          <SavedDataListItem
            name={snapshot.name}
            meta="Seed: {snapshot.seed}"
            previewHtml={heraldryPreviewSvgs[snapshot.blazon] ?? null}
            openLabel="Open"
            downloadLabel="Download SVG"
            onOpen={() => openHeraldry(snapshot)}
            onDownload={() => downloadHeraldrySvg(snapshot)}
            onDelete={() => confirmDeleteHeraldry(snapshot)}
          >
            <button type="button" onclick={() => downloadHeraldryPng(snapshot)}>Download PNG</button
            >
          </SavedDataListItem>
        {/each}
      </ul>
    {/if}

    {#if cultureEntries.length > 0}
      <h2>Cultures</h2>
      <ul class="saved-data-list">
        {#each cultureEntries as snapshot (snapshot.name)}
          <SavedDataListItem
            name={snapshot.name}
            openLabel="Open"
            downloadLabel="Download JSON"
            onOpen={() => openCulture(snapshot)}
            onDownload={() => downloadCultureJson(snapshot)}
            onDelete={() => confirmDeleteCulture(snapshot)}
          />
        {/each}
      </ul>
    {/if}

    {#if religionEntries.length > 0}
      <h2>Religions</h2>
      <ul class="saved-data-list">
        {#each religionEntries as snapshot (snapshot.seed)}
          <SavedDataListItem
            name={snapshot.name}
            meta="Seed: {snapshot.seed}"
            openLabel="Open"
            downloadLabel="Download JSON"
            onOpen={() => openReligion(snapshot)}
            onDownload={() => downloadReligionJson(snapshot)}
            onDelete={() => confirmDeleteReligion(snapshot)}
          />
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
</style>

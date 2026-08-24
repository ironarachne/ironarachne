<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import { hydrateArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import { formatBytes } from '$lib/format';
  import { hydrateProjects, listProjects, onProjectsChanged } from '$lib/projects';
  import {
    buildStoragePanelView,
    exportCell,
    exportHeadline,
    readStorageStatus,
    usageSentence,
    type StoragePanelView,
  } from '$lib/storage_status';
  import { exportWholeVault } from '$lib/vault_file';

  /**
   * What is in this browser, how long it has been the only copy, and what to do about it.
   *
   * The order of the sections is the design rather than a layout choice: export recency leads
   * because fullness predicts inconvenience while export recency predicts loss. A user at 12% of
   * quota who has never exported is one cleared browser away from losing everything, and a meter
   * reports them as comfortable. See docs/storage-panel.md.
   *
   * Nothing here is styled as an error, including "not protected". It is a true fact about a real
   * browser, and a panel that shouts at someone about a risk they cannot act on differently is how
   * a storage display teaches people to ignore it.
   */
  type Props = {
    /** Where a row's name points, so the table can hand a reader to the project it names. */
    projectAnchor: (projectId: string) => string;
    /** Section 4 — the transfer controls the page already owns. */
    children?: Snippet;
  };

  const { projectAnchor, children }: Props = $props();

  let view: StoragePanelView | null = $state(null);
  let busy = $state(false);
  let problem: string | null = $state(null);
  let notes: string[] = $state([]);
  /** Set when the browser refused the download, so the file can still be copied out by hand. */
  let unsavedFile: { fileName: string; text: string } | null = $state(null);

  async function refresh(): Promise<void> {
    const read = await readStorageStatus();
    if (!read.ok) {
      // An unreadable vault and an empty one are different answers, and only one of them means the
      // user has lost nothing — so this reports rather than rendering zeroes.
      view = null;
      problem = `Storage could not be read (${read.reason}). Your work is still here.`;
      return;
    }
    view = buildStoragePanelView(read.value, listProjects());
  }

  onMount(async () => {
    // Both indexes: the table attributes bytes to projects, and an unhydrated artifact index would
    // report every project as empty.
    await hydrateProjects();
    await hydrateArtifacts();
    await refresh();
  });

  // Live, because everything here moves as the user works: saving an artifact changes the sizes,
  // and exporting changes the figure the panel leads with.
  onMount(() => onProjectsChanged(() => void refresh()));
  onMount(() => onArtifactsChanged(() => void refresh()));

  /**
   * The primary action, and the only thing on this page that protects the work.
   *
   * The flow itself — build, hand to the browser, and stamp only if the browser took it — is
   * `exportWholeVault`, in the library, because the backup controls below run the same one.
   */
  async function exportEverything(): Promise<void> {
    if (busy) {
      return;
    }
    busy = true;
    problem = null;
    notes = [];
    unsavedFile = null;
    try {
      const result = await exportWholeVault();
      const fileName = result.fileName ?? 'the backup file';
      if (result.status === 'failed') {
        problem = `The vault could not be exported (${result.reason}). Nothing was changed.`;
        return;
      }
      if (result.status === 'blocked') {
        unsavedFile = { fileName, text: result.text ?? '' };
        problem = `This browser would not save ${fileName}. The file is below — copy it somewhere safe.`;
        return;
      }
      notes = [
        `Saved ${fileName}. Keep it somewhere that is not this browser — clearing site data takes everything else with it.`,
        ...result.issues,
      ];
      // The figure this panel leads with has just changed.
      await refresh();
    } finally {
      busy = false;
    }
  }
</script>

<!-- A literal id, not one from `$props.id()`: the workshop links to this section from another
     route, and a generated id is unknowable from anywhere but this page. -->
<section class="storage" id="storage">
  <h2>Storage</h2>
  <p class="storage__lede">
    Everything you make lives in this browser and nowhere else. A file is the only copy that
    survives clearing site data, a new machine, or a browser deciding on its own to reclaim the
    space.
  </p>

  <!-- 1. Last export. First, because it is the number that predicts loss. -->
  <div class="storage__lead">
    <p class="storage__headline">
      {view === null ? 'Reading storage…' : exportHeadline(view.lastExport)}
    </p>
    <button
      type="button"
      class="storage__primary"
      onclick={() => void exportEverything()}
      disabled={busy}
    >
      Export everything
    </button>
  </div>

  {#if problem !== null}
    <p class="storage__problem" role="alert">{problem}</p>
  {/if}

  {#if unsavedFile !== null}
    <label class="storage__fallback">
      <span>{unsavedFile.fileName}</span>
      <textarea readonly rows="6" value={unsavedFile.text}></textarea>
    </label>
  {/if}

  {#if notes.length > 0}
    <ul class="storage__notes" role="status">
      {#each notes as note (note)}
        <li>{note}</li>
      {/each}
    </ul>
  {/if}

  {#if view !== null}
    <!-- 2. Protection. A fact with its limit attached, never a badge that reads as safety. -->
    <div class="storage__section">
      <h3>Protection</h3>
      <p class="storage__protection">{view.protection.headline}</p>
      <p class="storage__meaning">{view.protection.meaning}</p>
    </div>

    <!-- 3. Usage. The proportion, then where the space went. -->
    <div class="storage__section">
      <h3>Usage</h3>
      <p class="storage__usage">{usageSentence(view.usage)}</p>

      {#if view.projects.length > 0}
        <table class="storage__table">
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Artifacts</th>
              <th scope="col">Size</th>
              <th scope="col">Last exported</th>
            </tr>
          </thead>
          <tbody>
            {#each view.projects as row (row.projectId)}
              <tr>
                <td data-label="Project">
                  <!-- A fragment on the page the reader is already on; there is nothing for
                       resolve() to add, and a base path would point it off the page. -->
                  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                  <a href={projectAnchor(row.projectId)}>{row.name}</a>
                </td>
                <td data-label="Artifacts">{row.artifactCount}</td>
                <!-- A sum of sizes recorded at write time, so it is exact and rendered exactly —
                     unlike the estimate above it, which is not. -->
                <td data-label="Size">{formatBytes(row.byteSize)}</td>
                <td data-label="Last exported">{exportCell(row.lastExport)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="storage__empty">No projects yet, so nothing is taking up room.</p>
      {/if}
    </div>
  {/if}

  <!-- 4. Actions. -->
  <div class="storage__section">
    {@render children?.()}
    <p class="storage__meaning">
      Deleting a project is on its card above, where the rest of what you can do to a project is.
    </p>
  </div>
</section>

<style>
  .storage {
    border-top: 1px solid var(--granite);
    margin-top: 2rem;
    padding-top: 1rem;
  }

  .storage h2 {
    font-size: 1.3rem;
    margin: 0;
  }

  .storage h3 {
    color: var(--gold);
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    margin: 0 0 0.35rem;
    text-transform: uppercase;
  }

  .storage__lede,
  .storage__meaning,
  .storage__usage,
  .storage__empty {
    max-width: var(--measure);
  }

  .storage__lede {
    font-size: 0.9rem;
    margin: 0.35rem 0 0;
  }

  .storage__section {
    margin-top: 1.25rem;
  }

  .storage__lead {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .storage__headline {
    font-size: 1.1rem;
    font-weight: bold;
    margin: 0;
  }

  .storage__primary {
    border-color: var(--gold);
    font-weight: bold;
  }

  .storage__protection {
    margin: 0;
  }

  .storage__meaning {
    font-size: 0.9rem;
    margin: 0.25rem 0 0;
    opacity: 0.85;
  }

  .storage__usage {
    margin: 0 0 0.6rem;
  }

  .storage__empty {
    font-style: italic;
    margin: 0;
    opacity: 0.8;
  }

  .storage__problem,
  .storage__notes {
    border: 1px solid var(--tan);
    border-radius: 4px;
    font-size: 0.9rem;
    margin: 0.75rem 0 0;
    padding: 0.5rem 0.6rem;
  }

  .storage__notes {
    padding-left: 1.6rem;
  }

  .storage__notes li {
    overflow-wrap: anywhere;
  }

  .storage__fallback {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    gap: 0.25rem;
    margin-top: 0.75rem;
  }

  .storage__fallback textarea {
    font-family: monospace;
    font-size: 0.75rem;
    min-width: 0;
    width: 100%;
  }

  .storage__table {
    border-collapse: collapse;
    width: 100%;
  }

  .storage__table th {
    font-size: 0.8rem;
    letter-spacing: 0.03em;
    text-align: left;
    text-transform: uppercase;
  }

  .storage__table th,
  .storage__table td {
    border-bottom: 1px solid var(--granite);
    padding: 0.35rem 0.6rem 0.35rem 0;
  }

  .storage__table td {
    font-size: 0.9rem;
    overflow-wrap: anywhere;
  }

  @media (max-width: 40rem) {
    /* A stack of labelled rows rather than a table that scrolls sideways: the page must never
       scroll horizontally, and four columns cannot fit a phone honestly. */
    .storage__table thead {
      display: none;
    }

    .storage__table tr {
      border-bottom: 1px solid var(--granite);
      display: block;
      padding: 0.4rem 0;
    }

    .storage__table td {
      border: none;
      display: flex;
      gap: 0.75rem;
      justify-content: space-between;
      padding: 0.1rem 0;
    }

    .storage__table td::before {
      content: attr(data-label);
      font-size: 0.75rem;
      letter-spacing: 0.03em;
      opacity: 0.75;
      text-transform: uppercase;
    }
  }
</style>

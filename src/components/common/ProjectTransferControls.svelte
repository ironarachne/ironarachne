<script lang="ts">
  import Download from '$lib/download';
  import { recordProjectExport } from '$lib/storage_status';
  import {
    buildProjectExportFile,
    describeImportSummary,
    importExportFile,
    type ImportSummary,
  } from '$lib/vault_file';
  import { ARTIFACT_KINDS } from '$lib/workshop';

  type Props = {
    /** The open project. Export needs one; import does not, and creates one from the file. */
    projectId?: string;
    /**
     * Told where an import put things, so the caller can take the user there. A project import
     * that leaves someone hunting through a list for what arrived has told them less than it knew.
     */
    onImported?: (summary: ImportSummary) => void;
  };

  const { projectId, onImported }: Props = $props();

  let importInput: HTMLInputElement | undefined = $state();
  let busy = $state(false);
  let error: string | null = $state(null);
  let notes: string[] = $state([]);

  function reset() {
    error = null;
    notes = [];
  }

  /**
   * Build the file, hand it to the browser, and only then record that the project was exported.
   *
   * The order matters: the stamp is what tells a user how long their work has been this browser's
   * only copy, so stamping an export that failed would replace a true warning with a false
   * reassurance.
   */
  async function exportProject() {
    if (projectId === undefined || busy) {
      return;
    }
    busy = true;
    reset();
    try {
      const built = await buildProjectExportFile(projectId);
      if (!built.ok) {
        error = `That could not be exported (${built.reason}). Nothing was changed.`;
        return;
      }
      const url = URL.createObjectURL(new Blob([built.value.text], { type: 'application/json' }));
      Download(url, built.value.fileName);
      URL.revokeObjectURL(url);
      // The stamp's own result is deliberately dropped: the file is already saved, and telling
      // someone their export failed because a bookkeeping write did would be worse than the stale
      // "last exported" figure it costs. It is not the user's work.
      await recordProjectExport(projectId);
      notes = [
        `Saved ${built.value.fileName}. Keep it somewhere that is not this browser — it is the only copy that survives clearing site data.`,
        ...built.value.issues,
      ];
    } finally {
      busy = false;
    }
  }

  function chooseFile() {
    importInput?.click();
  }

  /**
   * Import whatever the file turns out to be.
   *
   * One control for both a project file and a single artifact, because the file declares what it
   * is: a user who picked the file they meant should not also have to have picked the right
   * button. A whole-vault file is refused here by name rather than misread.
   */
  async function importFile(file: File) {
    if (busy) {
      return;
    }
    busy = true;
    reset();
    try {
      const result = await importExportFile(ARTIFACT_KINDS, await file.text(), {
        ...(projectId === undefined ? {} : { targetProjectId: projectId }),
      });
      if (!result.ok) {
        error = result.message;
        return;
      }
      notes = describeImportSummary(result.summary);
      onImported?.(result.summary);
    } catch {
      // Reading the file itself failed — a folder dropped on a file input, or a file the browser
      // could not open. Nothing was read, so nothing was written.
      error = `“${file.name}” could not be read. Nothing was changed.`;
    } finally {
      busy = false;
    }
  }

  function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    // Cleared straight away so choosing the same file twice fires the change event both times.
    input.value = '';
    if (file !== undefined) {
      void importFile(file);
    }
  }
</script>

<div class="project-transfer">
  <div class="project-transfer__row">
    {#if projectId !== undefined}
      <button type="button" onclick={exportProject} disabled={busy}>Export project</button>
    {/if}
    <button type="button" onclick={chooseFile} disabled={busy}>Import from file</button>
    <input
      bind:this={importInput}
      type="file"
      accept="application/json,.json"
      style="display: none"
      onchange={handleFileChange}
    />
  </div>

  {#if error !== null}
    <p class="project-transfer__error" role="alert">{error}</p>
  {/if}

  {#if notes.length > 0}
    <!-- Every line the summary had to say, kept on screen rather than flashed: "import complete"
         is a way of not saying what happened. -->
    <ul class="project-transfer__notes" role="status">
      {#each notes as note (note)}
        <li>{note}</li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .project-transfer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  .project-transfer__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .project-transfer__error,
  .project-transfer__notes {
    margin: 0;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .project-transfer__notes {
    padding-left: 1.6rem;
    list-style-type: disc;
  }

  .project-transfer__notes li {
    overflow-wrap: anywhere;
  }
</style>

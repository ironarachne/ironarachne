<script lang="ts">
  import { onMount } from 'svelte';

  import { downloadTextFile } from '$lib/download';
  import {
    discardQuarantinedArtifact,
    readQuarantinedArtifacts,
    type QuarantineRecord,
  } from '$lib/quarantine';
  import { showConfirmModal } from '$lib/ui';
  import { otherVaultTabsOpen } from '$lib/vault_db';
  import {
    buildVaultExportFile,
    describeImportSummary,
    importExportFile,
    inspectExportFile,
    readExportFileText,
    type ImportMode,
    type ImportProgress,
    type ImportSummary,
  } from '$lib/vault_file';
  import { ARTIFACT_KINDS } from '$lib/workshop';

  type Props = {
    /** The open project, so a single-artifact file has somewhere to go. */
    projectId?: string;
    /** Told when the vault changed under the caller, so it can re-read what it is showing. */
    onVaultChanged?: (summary: ImportSummary) => void;
  };

  const { projectId, onVaultChanged }: Props = $props();

  const uid = $props.id();
  const modeId = `${uid}-mode`;

  let importInput: HTMLInputElement | undefined = $state();
  let busy = $state(false);
  let mode: ImportMode = $state('merge');
  let progress: ImportProgress | null = $state(null);
  let error: string | null = $state(null);
  let notes: string[] = $state([]);
  /** Set when the browser refused the download, so the file can still be copied out by hand. */
  let unsavedFile: { fileName: string; text: string } | null = $state(null);
  let quarantined: QuarantineRecord[] = $state([]);
  let controller: AbortController | null = $state(null);

  onMount(() => {
    void refreshQuarantine();
  });

  async function refreshQuarantine() {
    const held = await readQuarantinedArtifacts();
    quarantined = held.ok ? held.value : [];
  }

  function reset() {
    error = null;
    notes = [];
    unsavedFile = null;
  }

  /**
   * Save a file, or keep it on screen when the browser will not take it.
   *
   * A blocked download is not a dead end here: for an export the file *is* the product, so the
   * fallback shows the text to copy rather than reporting that a backup failed.
   */
  function saveFile(file: { fileName: string; text: string }): boolean {
    if (downloadTextFile(file.text, file.fileName)) {
      return true;
    }
    unsavedFile = file;
    error = `This browser would not save ${file.fileName}. The file is below — copy it somewhere safe.`;
    return false;
  }

  function chooseFile() {
    importInput?.click();
  }

  /**
   * Restoring is destructive, so it is confirmed in the user's own terms — what they have now,
   * counted — rather than in the abstract. The counts come from the vault as it stands, which is
   * the only moment they can be taken.
   */
  async function confirmRestore(): Promise<boolean> {
    const held = await buildVaultExportFile();
    const counts =
      held.ok && held.value.envelope.scope === 'vault'
        ? `${held.value.envelope.body.projects.length} projects and ${held.value.envelope.body.artifacts.length} artifacts`
        : 'everything in this browser';
    return showConfirmModal({
      title: 'Restore from a backup',
      message: `This replaces what you have with what is in the file, removing ${counts}. A backup of what you have now downloads first, and that file is the only way back.`,
      okLabel: 'Restore',
      dangerous: true,
    });
  }

  /**
   * A backup taken from this browser, being added rather than restored, leaves the user with two
   * copies of everything. Merging it is a legitimate thing to want; doing it without saying so is
   * not, which is what `vaultId` is in the envelope for.
   */
  async function confirmOwnBackup(text: string): Promise<boolean> {
    const inspection = await inspectExportFile(text);
    if (!inspection.ok || !inspection.fromThisVault || mode !== 'merge') {
      return true;
    }
    return showConfirmModal({
      title: 'This is your own backup',
      message: `This file came out of this browser. Adding it leaves you with a second copy of ${inspection.projects} projects and ${inspection.artifacts} artifacts. If you meant to put this browser back the way the file has it, choose “replaces everything” instead.`,
      okLabel: 'Add a second copy',
    });
  }

  /** Two tabs writing the vault clobber each other, and a restore is the worst version of it. */
  async function confirmOtherTabs(): Promise<boolean> {
    if (!(await otherVaultTabsOpen())) {
      return true;
    }
    return showConfirmModal({
      title: 'This site is open in another tab',
      message:
        'Another tab has Iron Arachne open, and two tabs writing at once can undo each other. Close the other tab first, or carry on if you are sure.',
      okLabel: 'Import anyway',
      dangerous: true,
    });
  }

  async function importFile(file: File) {
    if (busy) {
      return;
    }
    reset();

    // The file is read before anything is asked, so every question below can be about what is
    // actually in it rather than about what the button was labelled.
    let text: string;
    try {
      text = await readExportFileText(new Uint8Array(await file.arrayBuffer()));
    } catch {
      error = `“${file.name}” could not be read. Nothing was changed.`;
      return;
    }

    if (mode === 'restore' && !(await confirmRestore())) {
      return;
    }
    if (!(await confirmOwnBackup(text))) {
      return;
    }
    if (!(await confirmOtherTabs())) {
      return;
    }

    busy = true;
    controller = new AbortController();
    try {
      const result = await importExportFile(ARTIFACT_KINDS, text, {
        mode,
        ...(projectId === undefined ? {} : { targetProjectId: projectId }),
        onProgress: (next) => (progress = next),
        signal: controller.signal,
        // The pre-restore export is the undo, so a restore does not run unless it was saved.
        onBackup: (backup) => saveFile(backup),
      });
      if (!result.ok) {
        error = result.message;
        return;
      }
      notes = describeImportSummary(result.summary);
      await refreshQuarantine();
      onVaultChanged?.(result.summary);
    } catch (thrown: unknown) {
      // The import reports its own failures; reaching here means something threw, which is a bug
      // rather than a bad file. Nothing was written either way — the commit is one transaction.
      console.error(thrown);
      error = `Something went wrong importing “${file.name}”. Nothing was changed.`;
    } finally {
      busy = false;
      progress = null;
      controller = null;
    }
  }

  function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file !== undefined) {
      void importFile(file);
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(notes.join('\n'));
    } catch {
      // Nothing to say: the lines are already on screen and selectable, which is the fallback.
    }
  }

  async function discard(record: QuarantineRecord) {
    const confirmed = await showConfirmModal({
      title: 'Throw away an unreadable item',
      message: `“${record.name === '' ? record.kind : record.name}” cannot be read by this version. Throwing it away is permanent, and a later version might have been able to open it.`,
      okLabel: 'Throw away',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    await discardQuarantinedArtifact(record.recordId);
    await refreshQuarantine();
  }
</script>

<section class="vault-transfer">
  <!-- Export is the storage panel's, one section above: it is the primary action there, under the
       "last exported" figure that gives someone a reason to press it. What is left here is the way
       back in — see docs/storage-panel.md. -->
  <h2>Restore from a backup</h2>
  <p class="vault-transfer__lede">
    Bring a file back into this browser. Adding puts it alongside what is already here; restoring
    replaces everything with what the file holds.
  </p>

  <div class="vault-transfer__row">
    <div class="input-group input-group--inline">
      <label for={modeId}>Importing</label>
      <select id={modeId} bind:value={mode} disabled={busy}>
        <option value="merge">adds to what is here</option>
        <option value="restore">replaces everything (restore)</option>
      </select>
    </div>
    <button type="button" onclick={chooseFile} disabled={busy}>Import from file…</button>
    <input
      bind:this={importInput}
      type="file"
      accept="application/json,.json,.gz"
      style="display: none"
      onchange={handleFileChange}
    />
  </div>

  {#if progress !== null}
    <p class="vault-transfer__progress" role="status">
      {#if progress.stage === 'staging'}
        Reading {progress.done} of {progress.total}…
      {:else if progress.stage === 'writing'}
        Saving…
      {:else}
        Opening the file…
      {/if}
      {#if progress.stage !== 'writing'}
        <!-- Interruptible right up to the commit, and nothing is written until then, so stopping
             costs nothing. -->
        <button type="button" onclick={() => controller?.abort()}>Stop</button>
      {/if}
    </p>
  {/if}

  {#if error !== null}
    <p class="vault-transfer__error" role="alert">{error}</p>
  {/if}

  {#if unsavedFile !== null}
    <label class="vault-transfer__fallback">
      <span>{unsavedFile.fileName}</span>
      <textarea readonly rows="6" value={unsavedFile.text}></textarea>
    </label>
  {/if}

  {#if notes.length > 0}
    <div class="vault-transfer__summary" role="status">
      <ul>
        {#each notes as note (note)}
          <li>{note}</li>
        {/each}
      </ul>
      <button type="button" onclick={copySummary}>Copy this summary</button>
    </div>
  {/if}

  {#if quarantined.length > 0}
    <!-- Kept, listed, and marked unreadable rather than dropped: a later version may understand
         them, and they travel in every export until then. -->
    <div class="vault-transfer__quarantine">
      <h3>Could not be read ({quarantined.length})</h3>
      <p>
        This version does not understand these, so they are being kept as they arrived. They travel
        in your exports, and a later version may be able to open them.
      </p>
      <ul>
        {#each quarantined as record (record.recordId)}
          <li>
            <span>{record.name === '' ? record.kind || 'An unnamed record' : record.name}</span>
            <span class="vault-transfer__reason">{record.message}</span>
            <button type="button" onclick={() => void discard(record)}>Throw away</button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</section>

<style>
  .vault-transfer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    background: var(--slate);
  }

  .vault-transfer h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  .vault-transfer h3 {
    margin: 0;
    font-size: 0.85rem;
    color: var(--gold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .vault-transfer__lede {
    margin: 0;
    font-size: 0.9rem;
  }

  .vault-transfer__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset and the room to shrink. */
  .vault-transfer .input-group {
    margin: 0;
    min-width: 0;
  }

  .vault-transfer select {
    min-width: 0;
    flex: 1 1 10rem;
  }

  .vault-transfer__progress,
  .vault-transfer__error,
  .vault-transfer__summary,
  .vault-transfer__quarantine {
    margin: 0;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .vault-transfer__progress {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .vault-transfer__summary,
  .vault-transfer__quarantine {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .vault-transfer ul {
    margin: 0;
    padding-left: 1.1rem;
  }

  .vault-transfer li {
    overflow-wrap: anywhere;
  }

  .vault-transfer__quarantine li {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.35rem;
  }

  .vault-transfer__quarantine p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.85;
  }

  .vault-transfer__reason {
    font-size: 0.8rem;
    font-style: italic;
    opacity: 0.8;
  }

  .vault-transfer__fallback {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  .vault-transfer__fallback textarea {
    width: 100%;
    min-width: 0;
    font-family: monospace;
    font-size: 0.75rem;
  }
</style>

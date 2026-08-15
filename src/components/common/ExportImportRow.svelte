<script lang="ts">
  type Props = {
    /**
     * Omitted by a tool that has nothing complete to offer. The culture generator is the standing
     * case: it saves into projects now, so an "export saved" button there would write a file of
     * whatever happens to be left in the old scope and call it a backup.
     */
    onExport?: () => void;
    onImport: (file: File) => void;
    accept?: string;
  };

  const { onExport, onImport, accept = 'application/json,.json' }: Props = $props();

  let importInput: HTMLInputElement | undefined = $state();

  function triggerImport() {
    importInput?.click();
  }

  function handleFileChange(ev: Event) {
    const input = ev.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      onImport(file);
    }
  }
</script>

<div class="input-group export-import-row">
  {#if onExport !== undefined}
    <button type="button" onclick={onExport}>Export saved (JSON)</button>
  {/if}
  <button type="button" onclick={triggerImport}>Import saves from file</button>
  <input
    bind:this={importInput}
    type="file"
    {accept}
    style="display: none"
    onchange={handleFileChange}
  />
</div>

<style>
  .export-import-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
</style>

<script lang="ts">
  import { downloadProjectPdf } from '$lib/pdf';
  import BaseButton from '$components/common/BaseButton.svelte';

  type Props = { projectId: string };
  const { projectId }: Props = $props();
  let busy = $state(false);
  let error = $state<string | null>(null);
  let notice = $state<string | null>(null);

  async function download() {
    if (busy) return;
    busy = true;
    error = null;
    notice = null;
    try {
      const result = await downloadProjectPdf(projectId);
      if (result === undefined) {
        error = 'That project could not be rendered.';
      } else if (result.warnings.length > 0) {
        const count = result.incompleteEntries.length;
        notice = `Saved ${result.filename} with ${count} incomplete ${count === 1 ? 'entry' : 'entries'}: ${result.incompleteEntries.join(', ')}. ${result.warnings.join(' ')}`;
      }
    } catch {
      error = 'That project could not be rendered.';
    } finally {
      busy = false;
    }
  }
</script>

<BaseButton onclick={download} disabled={busy}>Download project PDF</BaseButton>
{#if error !== null}<span class="project-pdf-button__error" role="alert">{error}</span>{/if}
{#if notice !== null}<span class="project-pdf-button__notice" role="status">{notice}</span>{/if}

<style>
  .project-pdf-button__error {
    font: var(--t-small);
    color: var(--color-danger, inherit);
  }

  .project-pdf-button__notice {
    font: var(--t-small);
  }
</style>

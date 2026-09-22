<script lang="ts">
  import { downloadProjectPdf } from '$lib/pdf';
  import BaseButton from '$components/common/BaseButton.svelte';

  type Props = { projectId: string };
  const { projectId }: Props = $props();
  let busy = $state(false);
  let error = $state<string | null>(null);

  async function download() {
    if (busy) return;
    busy = true;
    error = null;
    try {
      if ((await downloadProjectPdf(projectId)) === undefined) {
        error = 'That project could not be rendered.';
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

<style>
  .project-pdf-button__error {
    font: var(--t-small);
    color: var(--color-danger, inherit);
  }
</style>

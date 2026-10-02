<script lang="ts">
  import * as Regions from '$lib/regions';
  import type { RegionSnapshot } from '$lib/regions';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import BaseButton from '$components/common/BaseButton.svelte';

  const { snapshot }: { snapshot: RegionSnapshot } = $props();

  function exportMarkdown() {
    if (snapshot === null) return;
    downloadTextFile(
      Regions.regionToMarkdown(snapshot),
      `${Regions.regionFileStem(snapshot)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (snapshot === null) return;
    await downloadTextPdf(
      Regions.regionDisplayName(snapshot),
      Regions.regionToText(snapshot),
      `${Regions.regionFileStem(snapshot)}.pdf`,
    );
  }

  /** The map, which is what a region is (6.3). It had neither an export nor a picture until now. */
  function exportMapSvg() {
    if (snapshot === null) return;
    downloadTextFile(
      Regions.regionToMapSvg(snapshot),
      `${Regions.regionFileStem(snapshot)}.svg`,
      'image/svg+xml',
    );
  }
</script>

<div class="actions" role="group" aria-label="Export displayed region">
  <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
  <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
  <BaseButton onclick={exportMapSvg}>Download Map (SVG)</BaseButton>
</div>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block: 1rem;
  }
</style>

<script lang="ts">
  type Props = {
    onclick: () => void;
    downloading?: boolean;
    label?: string;
  };

  const { onclick, downloading = false, label = 'Download PDF' }: Props = $props();
</script>

<button type="button" {onclick} disabled={downloading}>
  {#if downloading}
    Downloading...
  {:else}
    {label}
  {/if}
</button>

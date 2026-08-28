<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  type Props = {
    onclick: () => void;
    downloading?: boolean;
    label?: string;
  };

  const { onclick, downloading = false, label = 'Download PDF' }: Props = $props();
</script>

<BaseButton {onclick} disabled={downloading}>
  {#if downloading}
    Downloading...
  {:else}
    {label}
  {/if}
</BaseButton>

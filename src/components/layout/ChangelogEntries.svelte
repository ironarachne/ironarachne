<script lang="ts">
  import entries from '$lib/change_log/entries';
  import * as Dates from '$lib/dates';

  type Props = {
    limit?: number;
  };

  const { limit }: Props = $props();

  const displayedEntries = $derived(limit !== undefined ? entries.slice(0, limit) : entries);
</script>

{#each displayedEntries as entry}
  <div>
    <!-- Renders app-generated markup (no external or user-supplied input). -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <h2>{@html Dates.getNiceDate(entry.date)}</h2>
    {#if entry.summary != ''}
      <p>{entry.summary}</p>
    {/if}
    <ul>
      {#each entry.updates as text}
        <li>{text}</li>
      {/each}
    </ul>
  </div>
{/each}

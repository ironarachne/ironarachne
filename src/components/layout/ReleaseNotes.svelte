<script lang="ts">
  import { mostRecent, releaseNoteEntries, sections } from '$lib/release_notes';
  import * as Dates from '$lib/dates';

  type Props = {
    limit?: number;
  };

  const { limit }: Props = $props();

  const displayedEntries = $derived(
    limit !== undefined ? mostRecent(limit, releaseNoteEntries) : releaseNoteEntries,
  );
</script>

{#each displayedEntries as entry}
  <div>
    <h2>
      <!-- Renders app-generated markup (no external or user-supplied input). -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html Dates.getNiceDate(entry.date)}
      {#if entry.version !== undefined}
        <span class="version">v{entry.version}</span>
      {/if}
    </h2>
    <p>{entry.summary}</p>
    {#each sections(entry) as section}
      <h3>{section.label}</h3>
      <ul>
        {#each section.items as text}
          <li>{text}</li>
        {/each}
      </ul>
    {/each}
  </div>
{/each}

<style>
  .version {
    font-size: 0.7em;
    font-weight: normal;
    vertical-align: middle;
    white-space: nowrap;
  }

  h3 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
</style>

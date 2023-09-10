<script lang="ts">
  import entries from "$lib/change_log/entries";
  import * as Dates from "$lib/dates";
</script>

<svelte:head>
  <title>Change Log | Iron Arachne</title>
</svelte:head>

<section class="changelog main">
  <h1>Change Log</h1>
  {#each entries as entry}
    <div>
      <h2>{@html Dates.getNiceDate(entry.date)}</h2>
      {#if entry.summary != ""}
        <p>{entry.summary}</p>
      {/if}
      <ul>
        {#each entry.updates as text}
          <li>{text}</li>
        {/each}
      </ul>
    </div>
  {/each}
</section>

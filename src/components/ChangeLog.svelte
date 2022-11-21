<script lang="ts">
  import * as Entries from "../modules/updates/entries";

  let updates = Entries.all();
</script>

<svelte:head>
  <title>Change Log | Iron Arachne</title>
</svelte:head>

<section class="changelog main">
  <h1>Change Log</h1>
  {#each updates as update}
    <div>
      <h2>{@html update.niceDate()}</h2>
      <ul>
        {#each update.updates as text}
          <li>{text}</li>
        {/each}
      </ul>
    </div>
  {/each}
</section>

<script lang="ts">
  import * as Entries from "../modules/updates/entries";

  let updates = Entries.all();
</script>

<svelte:head>
  <title>Change Log | Iron Arachne</title>
</svelte:head>

<section class="changelog main">
  <h2>Change Log</h2>
  {#each updates as update}
    <div>
      <h3>{@html update.niceDate()}</h3>
      <ul>
        {#each update.updates as text}
          <li>{text}</li>
        {/each}
      </ul>
    </div>
  {/each}
</section>

<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<svelte:head>
  <title>Saved Data | Iron Arachne</title>
</svelte:head>

<!--
  The load function redirects before this renders, so this is the fallback for the case where it
  does not — a browser that cannot run the router leaves someone on a page that still tells them
  where their work went, rather than on a blank one.
-->
<section class="main">
  <h1>Saved Data has moved</h1>
  <p>
    What used to be here is now the <a href={resolve('/vault')}>result vault</a>, which lists
    everything you have saved across every project, and hands each one to the workshop to edit.
  </p>
</section>

<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<svelte:head>
  <title>Release Notes | Iron Arachne</title>
</svelte:head>

<!--
  The load function redirects before this renders, so this is the fallback for the case where it
  does not — a browser that cannot run the router lands on a page that still points at what it came
  for, rather than on a blank one.
-->
<section class="main">
  <h1>The change log is now the release notes</h1>
  <p>
    What used to be here is at <a href={resolve('/release-notes')}>Release Notes</a>, where every
    entry is split into new features, improvements, bug fixes, and housekeeping.
  </p>
</section>

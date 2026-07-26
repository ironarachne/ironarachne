<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';
  import { toolsInDomain } from '$lib/tools';

  const sections = [
    {
      heading: 'Locations & Places',
      tools: toolsInDomain('locations'),
    },
  ];
</script>

<svelte:head>
  <title>Locations &amp; Places | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Locations &amp; Places" {sections} />

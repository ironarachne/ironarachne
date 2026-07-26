<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';
  import { toolsInDomain } from '$lib/tools';

  const sections = [
    {
      heading: 'Factions & Groups',
      tools: toolsInDomain('factions'),
    },
  ];
</script>

<svelte:head>
  <title>Factions &amp; Groups | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Factions &amp; Groups" {sections} />

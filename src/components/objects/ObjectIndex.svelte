<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';
  import { toolsInDomain } from '$lib/tools';

  const sections = [
    {
      heading: 'Objects & Items',
      tools: toolsInDomain('objects'),
    },
  ];
</script>

<svelte:head>
  <title>Objects &amp; Items | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Objects &amp; Items" {sections} />

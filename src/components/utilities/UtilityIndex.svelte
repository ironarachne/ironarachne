<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';
  import { toolsInDomain } from '$lib/tools';

  const sections = [
    {
      heading: 'Utilities & Reference',
      tools: toolsInDomain('utilities'),
    },
  ];
</script>

<svelte:head>
  <title>Utilities &amp; Reference | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Utilities &amp; Reference" {sections} />

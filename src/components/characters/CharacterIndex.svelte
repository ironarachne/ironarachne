<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';
  import { toolsByPath } from '$lib/tools';

  const sections = [
    {
      heading: 'Character Builders',
      tools: toolsByPath(['/fantasy/adnd/character/build']),
    },
    {
      heading: 'Character Generators',
      tools: toolsByPath([
        '/character',
        '/fantasy/adnd/character',
        '/fantasy/dcc/character',
        '/swn/character',
        '/unchartedworlds/character',
      ]),
    },
    {
      heading: 'Related Generators',
      tools: toolsByPath(['/heraldry', '/velgarth-gifts']),
    },
  ];
</script>

<svelte:head>
  <title>Characters &amp; People | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Characters &amp; People" {sections} />

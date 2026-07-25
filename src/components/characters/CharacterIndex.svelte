<script lang="ts">
  import { resolve } from '$app/paths';
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Character Builders',
      links: [{ href: resolve('/fantasy/adnd/character/build'), label: 'AD&amp;D 2E Character' }],
    },
    {
      heading: 'Character Generators',
      links: [
        { href: resolve('/character'), label: 'Character' },
        { href: resolve('/fantasy/adnd/character'), label: 'AD&amp;D 2E Character' },
        { href: resolve('/fantasy/dcc/character'), label: 'Dungeon Crawl Classics Character' },
        { href: resolve('/swn/character'), label: 'Stars Without Number Character' },
        { href: resolve('/unchartedworlds/character'), label: 'Uncharted Worlds Character' },
      ],
    },
    {
      heading: 'Related Generators',
      links: [
        { href: resolve('/heraldry'), label: 'Heraldry' },
        { href: resolve('/velgarth-gifts'), label: 'Velgarth Gifts' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Characters &amp; People | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Characters &amp; People" {sections} />

<script lang="ts">
  import NavIndexPage from './NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Character Builders',
      links: [{ href: '/fantasy/adnd/character/build', label: 'AD&amp;D 2E Character' }],
    },
    {
      heading: 'Character Generators',
      links: [
        { href: '/character', label: 'Character' },
        { href: '/fantasy/adnd/character', label: 'AD&amp;D 2E Character' },
        { href: '/fantasy/dcc/character', label: 'Dungeon Crawl Classics Character' },
        { href: '/swn/character', label: 'Stars Without Number Character' },
        { href: '/unchartedworlds/character', label: 'Uncharted Worlds Character' },
      ],
    },
    {
      heading: 'Related Generators',
      links: [
        { href: '/heraldry', label: 'Heraldry' },
        { href: '/velgarth-gifts', label: 'Velgarth Gifts' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Characters &amp; People | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Characters &amp; People" {sections} />

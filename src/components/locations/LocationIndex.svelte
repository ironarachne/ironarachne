<script lang="ts">
  import { resolve } from '$app/paths';
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Locations &amp; Places',
      links: [
        { href: resolve('/chop-shop'), label: 'Cyberpunk Chop Shop' },
        { href: resolve('/fantasy/dungeon'), label: 'Dungeon' },
        { href: resolve('/environment'), label: 'Environment' },
        { href: resolve('/planet'), label: 'Planet' },
        { href: resolve('/region'), label: 'Region' },
        { href: resolve('/fantasy/settlement'), label: 'Settlement' },
        { href: resolve('/star-system'), label: 'Star System' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Locations &amp; Places | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Locations &amp; Places" {sections} />

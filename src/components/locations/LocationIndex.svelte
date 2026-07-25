<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Locations &amp; Places',
      links: [
        { href: '/chop-shop', label: 'Cyberpunk Chop Shop' },
        { href: '/fantasy/dungeon', label: 'Dungeon' },
        { href: '/environment', label: 'Environment' },
        { href: '/planet', label: 'Planet' },
        { href: '/region', label: 'Region' },
        { href: '/fantasy/settlement', label: 'Settlement' },
        { href: '/star-system', label: 'Star System' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Locations &amp; Places | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Locations &amp; Places" {sections} />

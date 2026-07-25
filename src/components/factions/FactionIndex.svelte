<script lang="ts">
  import { resolve } from '$app/paths';
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Factions &amp; Groups',
      links: [
        { href: resolve('/arms-manufacturer'), label: 'Arms Manufacturer' },
        { href: resolve('/culture'), label: 'Culture' },
        { href: resolve('/fantasy/encounter'), label: 'Fantasy Encounter' },
        { href: resolve('/fantasy/family'), label: 'Fantasy Family' },
        { href: resolve('/fantasy/organization'), label: 'Fantasy Organization' },
        { href: resolve('/fantasy/religion'), label: 'Fantasy Religion' },
        { href: resolve('/star-nation'), label: 'Star Nation' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Factions &amp; Groups | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Factions &amp; Groups" {sections} />

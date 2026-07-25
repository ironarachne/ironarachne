<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Factions &amp; Groups',
      links: [
        { href: '/arms-manufacturer', label: 'Arms Manufacturer' },
        { href: '/culture', label: 'Culture' },
        { href: '/fantasy/encounter', label: 'Fantasy Encounter' },
        { href: '/fantasy/family', label: 'Fantasy Family' },
        { href: '/fantasy/organization', label: 'Fantasy Organization' },
        { href: '/fantasy/religion', label: 'Fantasy Religion' },
        { href: '/star-nation', label: 'Star Nation' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Factions &amp; Groups | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Factions &amp; Groups" {sections} />

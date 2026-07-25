<script lang="ts">
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Objects &amp; Items',
      links: [
        { href: '/drug', label: 'Cyberpunk Drug' },
        { href: '/fantasy/equipment', label: 'Fantasy Equipment Lists' },
        { href: '/fantasy/equipment-generator', label: 'Fantasy Equipment' },
        { href: '/fantasy/merchant', label: 'Fantasy Merchant' },
        { href: '/fantasy/potion-generator', label: 'Fantasy Potion Generator' },
        { href: '/fantasy/weapon', label: 'Fantasy Weapon' },
        { href: '/fantasy/treasure-hoard', label: 'Fantasy Treasure Hoard' },
        { href: '/spooky-ship', label: 'Spooky Starship' },
        { href: '/swn/starship', label: 'Stars Without Number Starship' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Objects &amp; Items | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Objects &amp; Items" {sections} />

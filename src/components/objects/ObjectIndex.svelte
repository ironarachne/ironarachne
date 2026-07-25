<script lang="ts">
  import { resolve } from '$app/paths';
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Objects &amp; Items',
      links: [
        { href: resolve('/drug'), label: 'Cyberpunk Drug' },
        { href: resolve('/fantasy/equipment'), label: 'Fantasy Equipment Lists' },
        { href: resolve('/fantasy/equipment-generator'), label: 'Fantasy Equipment' },
        { href: resolve('/fantasy/merchant'), label: 'Fantasy Merchant' },
        { href: resolve('/fantasy/potion-generator'), label: 'Fantasy Potion Generator' },
        { href: resolve('/fantasy/weapon'), label: 'Fantasy Weapon' },
        { href: resolve('/fantasy/treasure-hoard'), label: 'Fantasy Treasure Hoard' },
        { href: resolve('/spooky-ship'), label: 'Spooky Starship' },
        { href: resolve('/swn/starship'), label: 'Stars Without Number Starship' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Objects &amp; Items | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Objects &amp; Items" {sections} />

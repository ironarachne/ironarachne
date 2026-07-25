<script lang="ts">
  import { resolve } from '$app/paths';
  import NavIndexPage from '$components/layout/NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Utilities &amp; Reference',
      links: [
        { href: resolve('/saved-data'), label: 'Saved data' },
        { href: resolve('/language'), label: 'Language' },
        { href: resolve('/species-stats'), label: 'Species Height and Weight Calculator' },
        { href: resolve('/word-generator-cheat-sheet'), label: 'Word Generator Cheat Sheet' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Utilities &amp; Reference | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Utilities &amp; Reference" {sections} />

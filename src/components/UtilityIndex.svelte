<script lang="ts">
  import NavIndexPage from './NavIndexPage.svelte';

  const sections = [
    {
      heading: 'Utilities &amp; Reference',
      links: [
        { href: '/saved-data', label: 'Saved data' },
        { href: '/language', label: 'Language' },
        { href: '/species-stats', label: 'Species Height and Weight Calculator' },
        { href: '/word-generator-cheat-sheet', label: 'Word Generator Cheat Sheet' }
      ]
    }
  ];
</script>

<svelte:head>
  <title>Utilities &amp; Reference | Iron Arachne</title>
</svelte:head>

<NavIndexPage title="Utilities &amp; Reference" {sections} />

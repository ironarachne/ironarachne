<script lang="ts">
  type NavSection = {
    heading: string;
    links: { href: string; label: string }[];
  };

  type Props = {
    title: string;
    sections: NavSection[];
  };

  let { title, sections }: Props = $props();
</script>

<section class="navigation">
  <h1>{title}</h1>
  {#each sections as section}
    <h2>{section.heading}</h2>
    <nav>
      {#each section.links as link}
        <a href={link.href}>{@html link.label}</a>
      {/each}
    </nav>
  {/each}
</section>

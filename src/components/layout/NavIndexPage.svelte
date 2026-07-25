<script lang="ts">
  type NavSection = {
    heading: string;
    links: { href: string; label: string }[];
  };

  type Props = {
    title: string;
    sections: NavSection[];
  };

  const { title, sections }: Props = $props();
</script>

<section class="navigation">
  <h1>{title}</h1>
  {#each sections as section}
    <h2>{section.heading}</h2>
    <nav>
      {#each section.links as link}
        <!-- Callers build `href` by passing a route literal through `resolve()`, so these are
             already base-path correct; the rule cannot see through the prop boundary. `label`
             is a curated in-repo string (it carries entities such as &amp;), never user input. -->
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve, svelte/no-at-html-tags -->
        <a href={link.href}>{@html link.label}</a>
      {/each}
    </nav>
  {/each}
</section>

<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Tool } from '$lib/tools';

  type NavSection = {
    heading: string;
    tools: Tool[];
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
      {#each section.tools as tool}
        <!-- `resolve` is typed against one specific route id at a time, so a value typed as the
             union of every route id does not satisfy it. Catalog paths are all parameterless
             static routes, so narrowing to an arbitrary member of the union is safe. -->
        <a href={resolve(tool.path as '/')}>{tool.label}</a>
      {/each}
    </nav>
  {/each}
</section>

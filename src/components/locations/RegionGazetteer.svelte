<script lang="ts">
  import { regionToDocument, type RegionSnapshot } from '$lib/regions';

  const { snapshot }: { snapshot: RegionSnapshot } = $props();
  const document = $derived(regionToDocument(snapshot));
  const notableIds = $derived(new Set(snapshot.facts.notables.map((fact) => fact.id)));
</script>

<div class="gazetteer" aria-label="Regional gazetteer">
  <h2>{document.title}</h2>
  {#each document.paragraphs as paragraph}
    <p data-gazetteer-text>{paragraph}</p>
  {/each}
  {#each document.sections as section}
    <section aria-label={section.heading}>
      <h3>{section.heading}</h3>
      {#each section.lines as line, index}
        {@const factId = section.factIds?.[index]}
        <article data-notable-id={factId && notableIds.has(factId) ? factId : undefined}>
          <p data-gazetteer-text>{line}</p>
        </article>
      {/each}
    </section>
  {/each}
</div>

<style>
  article {
    margin-block: 0.75rem;
  }

  article p {
    margin-bottom: 0.25rem;
  }

  .gazetteer {
    overflow-wrap: anywhere;
  }
</style>

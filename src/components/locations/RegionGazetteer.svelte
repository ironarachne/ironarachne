<script lang="ts">
  import { regionToUiDocument, type RegionSnapshot } from '$lib/regions';

  const { snapshot }: { snapshot: RegionSnapshot } = $props();
  const document = $derived(regionToUiDocument(snapshot));
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
      {#each section.entries as entry}
        {@const factId = entry.factId}
        <article
          data-fact-id={factId}
          data-notable-id={factId && notableIds.has(factId) ? factId : undefined}
        >
          {#if entry.heading}<h4>{entry.heading}</h4>{/if}
          {#if entry.body}<p data-gazetteer-text>{entry.body}</p>{/if}
          {#each entry.paragraphs ?? [] as paragraph}
            <p data-gazetteer-text>{paragraph}</p>
          {/each}
          {#if entry.character?.length}
            <h5>{entry.characterHeading}</h5>
            {#each entry.character as paragraph}
              <p data-gazetteer-text>{paragraph}</p>
            {/each}
          {/if}
          {#if entry.hook}
            <h5>{entry.hookHeading}</h5>
            <p data-gazetteer-text>{entry.hook}</p>
          {/if}
          {#if entry.warning}<p data-gazetteer-text>{entry.warning}</p>{/if}
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

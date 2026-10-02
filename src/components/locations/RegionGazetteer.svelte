<script lang="ts">
  import {
    regionToDocument,
    regionSupportingFacts,
    regionFactExplanation,
    type RegionSnapshot,
  } from '$lib/regions';

  const { snapshot }: { snapshot: RegionSnapshot } = $props();
  const uid = $props.id();
  let activeFact = $state<string | undefined>();
  const document = $derived(regionToDocument(snapshot));
  const facts = $derived(regionSupportingFacts(snapshot));
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
          {#if factId}
            <a
              href="#{uid}-fact-{encodeURIComponent(factId)}"
              onclick={() => {
                activeFact = factId;
              }}>Supporting explanation</a
            >
          {/if}
        </article>
      {/each}
    </section>
  {/each}
  {#if facts.length > 0}
    <details open={activeFact !== undefined}>
      <summary>Explore supporting facts</summary>
      {#each facts as fact (fact.id)}
        <details id="{uid}-fact-{fact.id}" open={activeFact === fact.id}>
          <summary>{fact.name || 'Unnamed fact'}</summary>
          <p>{fact.description}</p>
          {#each regionFactExplanation(snapshot, fact) as explanation}
            <p>{explanation}</p>
          {/each}
        </details>
      {/each}
    </details>
  {/if}
</div>

<style>
  article {
    margin-block: 0.75rem;
  }

  article p {
    margin-bottom: 0.25rem;
  }

  details {
    margin-block: 0.75rem;
  }

  .gazetteer {
    overflow-wrap: anywhere;
  }
</style>

<script lang="ts">
  import RegionEvidenceInspector from '$components/locations/RegionEvidenceInspector.svelte';
  import {
    regionToUiDocument,
    landscapePlaceAnchor,
    landscapeOwnerHeading,
    type RegionSnapshot,
  } from '$lib/regions';

  const { snapshot }: { snapshot: RegionSnapshot } = $props();
  const uid = $props.id();
  let inspectionOpen = $state(false);
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
      {#if section.landscapeReferences?.length}
        <nav aria-label="Named landscapes">
          <h4>Named landscapes</h4>
          <ul>
            {#each section.landscapeReferences as reference}
              <li>
                <a href={`#${uid}-${landscapePlaceAnchor(reference.placeId)}`}>{reference.label}</a>
                — {landscapeOwnerHeading(reference.owner)}
              </li>
            {/each}
          </ul>
        </nav>
      {/if}
      {#each section.entries as entry}
        {@const factId = entry.factId}
        <article
          id={entry.anchorId ? `${uid}-${entry.anchorId}` : undefined}
          data-fact-id={factId}
          data-landscape-place={entry.anchorId}
          data-notable-id={factId && notableIds.has(factId) ? factId : undefined}
        >
          {#if entry.heading}<h4>{entry.heading}</h4>{/if}
          {#if entry.location}<p>Location: {entry.location}</p>{/if}
          {#if entry.relatedAnchorId}<a href={`#${uid}-${entry.relatedAnchorId}`}>View settlement</a
            >{/if}
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
          {#each entry.references ?? [] as reference}
            <p><a href={`#${uid}-${reference.anchorId}`}>{reference.label}</a></p>
          {/each}
          {#if entry.hook}
            <h5>{entry.hookHeading}</h5>
            <p data-gazetteer-text>{entry.hook}</p>
          {/if}
          {#if entry.inspectionFactIds?.length}
            <a
              class="inspect-place"
              href={`#${uid}-evidence`}
              onclick={() => (inspectionOpen = true)}>Inspect facts</a
            >
          {/if}
          {#if entry.warning}<p data-gazetteer-text>{entry.warning}</p>{/if}
        </article>
      {/each}
    </section>
  {/each}
</div>
<RegionEvidenceInspector {snapshot} id={`${uid}-evidence`} bind:expanded={inspectionOpen} />

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

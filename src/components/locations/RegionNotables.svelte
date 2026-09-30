<script lang="ts">
  import type { NotableFact } from '$lib/regions';

  const { places }: { places: NotableFact[] } = $props();
</script>

{#each ['landmark', 'hazard'] as kind}
  {@const selected = places.filter((fact) => fact.kind === kind)}
  {#if selected.length > 0}
    <section aria-label={kind === 'landmark' ? 'Landmarks' : 'Hazards'}>
      <h3>{kind === 'landmark' ? 'Landmarks' : 'Hazards'}</h3>
      {#each selected as place (place.id)}
        <article data-notable-id={place.id}>
          <h4>{place.name}</h4>
          <p>{place.description}</p>
          {#if place.reason?.status === 'stale'}
            <p>The recorded reason needs review after changes to its supporting facts.</p>
          {/if}
        </article>
      {/each}
    </section>
  {/if}
{/each}

<script lang="ts">
  import {
    regionInspectionFacts,
    activityEvidenceCurrent,
    regionOverviewCurrent,
    regionSourceQualifications,
    type RegionSnapshot,
  } from '$lib/regions';
  let {
    snapshot,
    id,
    expanded = $bindable(false),
  }: { snapshot: RegionSnapshot; id?: string; expanded?: boolean } = $props();
  const facts = $derived(regionInspectionFacts(snapshot));
</script>

<details {id} class="inspection" bind:open={expanded}>
  <summary>Inspect evidence and qualifications</summary>
  {#if expanded}
    <p>
      These records explain what the generator established, inferred or left unknown. They are
      included in the raw artifact export.
    </p>
    {#if snapshot.overviewReason}
      <details>
        <summary
          >Introduction evidence{regionOverviewCurrent(snapshot, snapshot.overviewReason)
            ? ''
            : ' — needs review'}</summary
        >
        <pre>{JSON.stringify(snapshot.overviewReason, null, 2)}</pre>
      </details>
    {/if}
    {#each snapshot.settlements.filter((entry) => entry.descriptionReason) as entry (entry.id)}
      <details>
        <summary
          >{entry.snapshot.name || 'Unnamed settlement'} description evidence{regionOverviewCurrent(
            snapshot,
            entry.descriptionReason,
          )
            ? ''
            : ' — needs review'}</summary
        >
        <p>{entry.snapshot.description}</p>
        <pre>{JSON.stringify(entry.descriptionReason, null, 2)}</pre>
      </details>
    {/each}
    {#if snapshot.gazetteer && snapshot.gazetteer.version !== 1 && snapshot.gazetteer.landscapePlaces.length}
      <details>
        <summary>Landscape reading identities and aliases</summary>
        <pre>{JSON.stringify(snapshot.gazetteer.landscapePlaces, null, 2)}</pre>
      </details>
    {/if}
    {#if (snapshot.gazetteer?.version === 3 || snapshot.gazetteer?.version === 4) && snapshot.gazetteer.notableReadings.length}
      <details>
        <summary>Notable reading identities and suggested adventures</summary>
        <pre>{JSON.stringify(snapshot.gazetteer.notableReadings, null, 2)}</pre>
      </details>
    {/if}
    {#if snapshot.gazetteer?.version === 4 && snapshot.gazetteer.roadReadings.length}
      <details>
        <summary>Road reading identities and shared details</summary>
        <pre>{JSON.stringify(
            {
              readings: snapshot.gazetteer.roadReadings,
              blocks: snapshot.gazetteer.blocks.filter(
                (block) => block.destination.section === 'travel',
              ),
            },
            null,
            2,
          )}</pre>
      </details>
    {/if}
    {#each facts as fact (fact.id)}
      <details>
        <summary
          >{fact.name || 'Unnamed fact'}{fact.reason?.status === 'stale' ||
          ('support' in fact && !activityEvidenceCurrent(snapshot.facts, snapshot.map, fact))
            ? ' — needs review'
            : ''}</summary
        >
        {#if !fact.assessments}<p>No explicit assessments were saved for this fact.</p>{/if}
        {#each fact.assessments ?? [] as assessment (assessment.topic)}
          <p><strong>{assessment.topic}: {assessment.status}</strong> — {assessment.explanation}</p>
        {/each}
        {#each regionSourceQualifications(snapshot, fact) as qualification}<p>
            {qualification}
          </p>{/each}
        <pre>{JSON.stringify(fact, null, 2)}</pre>
      </details>
    {/each}
  {/if}
</details>

<style>
  .inspection {
    margin-block: 1.5rem;
    overflow-wrap: anywhere;
  }
  details details {
    margin-block: 0.75rem;
  }
  summary {
    cursor: pointer;
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 0.8rem;
  }
</style>

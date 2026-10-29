<script lang="ts">
  import {
    regionInspectionFacts,
    activityEvidenceCurrent,
    regionOverviewCurrent,
    regionSourceQualifications,
    type RegionSnapshot,
  } from '$lib/regions';
  const { snapshot }: { snapshot: RegionSnapshot } = $props();
  let expanded = $state(false);
  const facts = $derived(regionInspectionFacts(snapshot));
</script>

<details class="inspection" bind:open={expanded}>
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

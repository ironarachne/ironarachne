<script lang="ts">
  import {
    regionInspectionFacts,
    historySourceEntries,
    historyEventAnchor,
    getHistoryEventsNeedingReview,
    activityEvidenceCurrent,
    regionOverviewCurrent,
    regionSourceQualifications,
    type RegionSnapshot,
  } from '$lib/regions';
  let {
    snapshot,
    id,
    expanded = $bindable(false),
    anchorPrefix,
    focusId,
  }: {
    snapshot: RegionSnapshot;
    id?: string;
    expanded?: boolean;
    anchorPrefix?: string;
    focusId?: string;
  } = $props();
  const facts = $derived(regionInspectionFacts(snapshot));
  const historySources = $derived(historySourceEntries(snapshot));
  const historyReview = $derived(
    new Set(getHistoryEventsNeedingReview(snapshot).map((event) => event.id)),
  );
</script>

<details {id} class="inspection" bind:open={expanded}>
  <summary>Inspect evidence and qualifications</summary>
  {#if expanded}
    <p>
      These records explain what the generator established, inferred or left unknown. They are
      included in the raw artifact export.
    </p>
    {#if snapshot.history.events.length}
      <h4>History evidence</h4>
      <p>
        These saved accounts are backstory. Present facts constrain what they may say; they do not
        prove that an event happened.
      </p>
      {#each [...snapshot.history.events].sort((a, b) => a.time.order - b.time.order) as event (event.id)}
        {@const anchor = `${historyEventAnchor(event.id)}-evidence`}
        <details
          id={anchorPrefix ? `${anchorPrefix}-${anchor}` : undefined}
          open={focusId === anchor}
        >
          <summary
            >{event.name || `Event ${event.time.order + 1}`}{historyReview.has(event.id)
              ? ' — needs review'
              : ''}</summary
          >
          <p>{event.origin === 'authored' ? 'Authored history' : 'Generated backstory'}</p>
          {#if event.description}<p>{event.description}</p>{/if}
          <p>Rule: {event.evidence.reason.ruleId}</p>
          <p>
            Causal parents: {event.causedByEventIds
              .map((id) => snapshot.history.events.find((e) => e.id === id)?.name || id)
              .join('; ') || 'None recorded'}
          </p>
          <h5>Compatibility checked against</h5>
          <pre>{JSON.stringify(
              {
                historyVersion: snapshot.history.version,
                id: event.id,
                time: event.time,
                causedByEventIds: event.causedByEventIds,
                participants: event.participants,
                outcome: event.outcome,
                consequences: event.consequences,
                evidence: event.evidence,
              },
              null,
              2,
            )}</pre>
        </details>
      {/each}
      {#if snapshot.history.actors.length}
        <details>
          <summary>Historical actors</summary>
          <p>
            These are historical polities or communities, separate from the region's current realms
            and inhabitants.
          </p>
          {#each snapshot.history.actors as actor (actor.id)}<p>
              {actor.name} — historical {actor.kind}, {actor.origin}
            </p>
            <pre>{JSON.stringify(actor, null, 2)}</pre>{/each}
        </details>
      {/if}
      <h4>Present facts explained by history</h4>
      {#each historySources as source (source.anchorId)}
        <details
          id={anchorPrefix ? `${anchorPrefix}-${source.anchorId}` : undefined}
          open={focusId === source.anchorId}
        >
          <summary>{source.label}</summary>
          <pre>{JSON.stringify(source.record ?? 'Source unavailable', null, 2)}</pre>
        </details>
      {/each}
    {/if}
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
    {#if (snapshot.gazetteer?.version === 3 || snapshot.gazetteer?.version === 4 || snapshot.gazetteer?.version === 5 || snapshot.gazetteer?.version === 6) && snapshot.gazetteer.notableReadings.length}
      <details>
        <summary>Notable reading identities and suggested adventures</summary>
        <pre>{JSON.stringify(snapshot.gazetteer.notableReadings, null, 2)}</pre>
      </details>
    {/if}
    {#if (snapshot.gazetteer?.version === 4 || snapshot.gazetteer?.version === 5 || snapshot.gazetteer?.version === 6) && snapshot.gazetteer.roadReadings.length}
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
    {#if snapshot.gazetteer?.version === 5 || snapshot.gazetteer?.version === 6}
      <details>
        <summary>Settlement portraits and possible work</summary>
        <pre>{JSON.stringify(
            {
              readings: snapshot.gazetteer.settlementReadings,
              blocks: snapshot.gazetteer.blocks.filter(
                (block) => block.destination.section === 'settlement',
              ),
            },
            null,
            2,
          )}</pre>
      </details>
    {/if}
    {#if snapshot.gazetteer?.version === 6}
      <details>
        <summary>Organization contacts and supported profiles</summary>
        <pre>{JSON.stringify(
            {
              readings: snapshot.gazetteer.organizationReadings,
              blocks: snapshot.gazetteer.blocks.filter(
                (block) => block.destination.section === 'organization',
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

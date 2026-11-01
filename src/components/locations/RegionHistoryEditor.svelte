<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import { showConfirmModal, showAlertModal } from '$lib/ui';
  import {
    getHistoryEventsNeedingReview,
    setRegionHistoryEventText,
    setRegionHistoryEventDate,
    reorderRegionHistoryEvents,
    setRegionHistoricalActorName,
    getHistoryEventRemovalImpact,
    removeRegionHistoryEvent,
    historyRemovalMessage,
    type RegionSnapshot,
  } from '$lib/regions';
  const {
    snapshot,
    onChange,
  }: { snapshot: RegionSnapshot; onChange: (next: RegionSnapshot) => void } = $props();
  const uid = $props.id();
  const events = $derived([...snapshot.history.events].sort((a, b) => a.time.order - b.time.order));
  const review = $derived(new Set(getHistoryEventsNeedingReview(snapshot).map((e) => e.id)));
  let error = $state('');
  function apply(change: (current: RegionSnapshot) => RegionSnapshot): boolean {
    try {
      const next = change(snapshot);
      if (next !== snapshot) onChange(next);
      error = '';
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      error = message.includes('backwards')
        ? 'Dates must follow event order, from older to more recent.'
        : /causal|founding|dissolution/.test(message)
          ? 'Keep causes and foundings before the later events that depend on them.'
          : message.includes('nonempty')
            ? 'Enter a name for the historical actor.'
            : message.includes('nonnegative')
              ? 'Enter a whole number of years, zero or greater.'
              : 'This change would make the saved history inconsistent.';
      return false;
    }
  }
  function move(id: string, direction: number) {
    const ids = events.map((e) => e.id),
      index = ids.indexOf(id),
      other = index + direction;
    if (other < 0 || other >= ids.length) return;
    [ids[index], ids[other]] = [ids[other], ids[index]];
    apply((current) => reorderRegionHistoryEvents(current, ids));
  }
  async function remove(id: string) {
    const impact = getHistoryEventRemovalImpact(snapshot, id),
      message = historyRemovalMessage(snapshot, impact);
    if (impact.protectedEventIds.length || impact.protectedActorIds.length) {
      await showAlertModal({ title: 'History is protected', message });
      return;
    }
    if (
      await showConfirmModal({
        title: 'Remove history event',
        message: `${message} This does not generate replacement history.`,
        okLabel: 'Remove history event',
        dangerous: true,
      })
    )
      apply((current) => removeRegionHistoryEvent(current, id));
  }
</script>

<details class="history-editor">
  <summary>Edit history</summary>
  <p>
    Edits keep saved words elsewhere. Review authored prose for consistency; it is never rewritten
    automatically. Dates are optional years before this region's present.
  </p>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if !events.length}<p>No history recorded.</p>{/if}
  {#each events as event, index (event.id)}
    {@const ordinal = event.time.order + 1}
    <fieldset data-history-editor-event={event.id}>
      <legend>History event {ordinal}</legend>
      {#if review.has(event.id)}<p>
          Needs review: supporting information changed or could not be checked. Saved text is
          retained.
        </p>{/if}
      <div class="input-group">
        <label for={`${uid}-${index}-name`}>History event {ordinal} name</label>
        <input
          id={`${uid}-${index}-name`}
          value={event.name}
          oninput={(change) =>
            apply((current) =>
              setRegionHistoryEventText(current, event.id, 'name', change.currentTarget.value),
            )}
        />
      </div>
      <div class="input-group">
        <label for={`${uid}-${index}-text`}>History event {ordinal} description</label>
        <textarea
          id={`${uid}-${index}-text`}
          rows="3"
          value={event.description}
          oninput={(change) =>
            apply((current) =>
              setRegionHistoryEventText(
                current,
                event.id,
                'description',
                change.currentTarget.value,
              ),
            )}
        ></textarea>
      </div>
      <div class="input-group">
        <label for={`${uid}-${index}-date`}>History event {ordinal} years before present</label>
        <input
          id={`${uid}-${index}-date`}
          type="number"
          min="0"
          step="1"
          value={event.time.yearsBeforePresent ?? ''}
          onchange={(change) => {
            const input = change.currentTarget,
              value = input.value.trim() === '' ? null : Number(input.value);
            if (!apply((current) => setRegionHistoryEventDate(current, event.id, value)))
              input.value = String(event.time.yearsBeforePresent ?? '');
          }}
        />
      </div>
      <div class="history-actions">
        <BaseButton
          disabled={index === 0}
          aria-label={`Move history event ${ordinal} earlier`}
          onclick={() => move(event.id, -1)}>Move earlier</BaseButton
        >
        <BaseButton
          disabled={index === events.length - 1}
          aria-label={`Move history event ${ordinal} later`}
          onclick={() => move(event.id, 1)}>Move later</BaseButton
        >
        <BaseButton aria-label={`Remove history event ${ordinal}`} onclick={() => remove(event.id)}
          >Remove event</BaseButton
        >
      </div>
    </fieldset>
  {/each}
  {#if snapshot.history.actors.length}<h4>Historical actors</h4>
    <p>
      These actors belong to the past; they are separate from current realms and inhabitants.
    </p>{/if}
  {#each snapshot.history.actors as actor, index (actor.id)}
    <div class="input-group">
      <label for={`${uid}-actor-${index}`}>Historical actor {index + 1} name</label>
      <input
        id={`${uid}-actor-${index}`}
        value={actor.name}
        onchange={(change) => {
          const input = change.currentTarget;
          if (!apply((current) => setRegionHistoricalActorName(current, actor.id, input.value)))
            input.value = actor.name;
        }}
      />
    </div>
  {/each}
</details>

<style>
  .history-editor {
    margin-block: 1rem;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  summary {
    cursor: pointer;
  }
  fieldset {
    min-width: 0;
    border: 0;
    padding: 1rem 0;
  }
  .input-group {
    min-width: 0;
    margin-block: 0.5rem;
  }
  input,
  textarea {
    min-width: 0;
    width: 100%;
  }
  .history-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>

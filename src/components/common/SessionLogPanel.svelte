<script lang="ts">
  import { onMount } from 'svelte';

  import {
    clearSessionLog,
    listSessionLog,
    onSessionLogChanged,
    runAccessibleName,
    runAge,
    runHeadline,
    describeRunSettings,
    type SessionLogEntry,
  } from '$lib/session_log';
  import { findToolByPath } from '$lib/tools';
  import { showConfirmModal } from '$lib/ui';
  import { hasToolPanel } from '$lib/workshop';

  type Props = {
    /** Called when the user asks for a run back. Absent leaves the entries unpressable. */
    onReplay?: (entry: SessionLogEntry) => void;
  };

  const { onReplay }: Props = $props();

  let entries: SessionLogEntry[] = $state([]);
  /**
   * The clock, sampled rather than read during render.
   *
   * "4 min ago" has to become "5 min ago" without anything else happening on the page, and a
   * `Date.now()` in the markup would only be re-read when something else made the component
   * redraw — so a log left alone would say "just now" for an hour.
   */
  let now = $state(Date.now());

  /**
   * Entries whose tool the bench can still mount.
   *
   * The same rule the bench applies to a panel whose target is gone: an entry that cannot be
   * replayed is a row that looks like a way back and is not.
   */
  const visible = $derived(
    entries.filter((entry) => {
      const tool = findToolByPath(entry.toolPath);
      return tool !== undefined && hasToolPanel(tool.path);
    }),
  );

  function refresh() {
    entries = listSessionLog();
    now = Date.now();
  }

  onMount(() => {
    refresh();
    const stopListening = onSessionLogChanged(refresh);
    const tick = setInterval(() => {
      now = Date.now();
    }, 30_000);
    return () => {
      stopListening();
      clearInterval(tick);
    };
  });

  function toolLabel(entry: SessionLogEntry): string {
    return findToolByPath(entry.toolPath)?.label ?? entry.toolPath;
  }

  /**
   * Clearing asks first.
   *
   * A bench arrangement may be dropped silently because it is not work. This is a step closer:
   * these seeds are the only remaining route back to results the user chose not to save, and the
   * button sits one mis-click from a list of them. The prompt costs one click on an action nobody
   * performs in a hurry.
   */
  async function clear() {
    const confirmed = await showConfirmModal({
      title: 'Clear this session',
      message: `Forget all ${visible.length} of these rolls? Anything you have not saved cannot be brought back afterwards.`,
      okLabel: 'Clear',
      dangerous: true,
    });
    if (confirmed) {
      clearSessionLog();
    }
  }
</script>

<section class="session-log">
  <div class="session-log__header">
    <!-- Short, because the column is 14rem wide and a two-line heading pushes Clear onto a line
         of its own. What the list is of is said by the note under it and by each entry's tool
         name, so the heading does not have to carry it. -->
    <h2>This session</h2>
    <button type="button" class="session-log__clear" onclick={() => void clear()}>Clear</button>
  </div>

  <!-- The one thing in this column that is not an entry, and it is not optional. Under
       docs/storage-disclosure.md a user has to be able to see what protects their work, and a list
       that looks like saved things but empties on refresh is precisely the trap that rule exists to
       prevent. -->
  <p class="session-log__note">
    Kept until you reload — nothing here is stored. Save a result to keep it.
  </p>

  <div class="session-log__list">
    {#if visible.length === 0}
      <p class="session-log__empty">Nothing rolled yet.</p>
    {:else}
      <ul>
        {#each visible as entry (entry.id)}
          {@const label = toolLabel(entry)}
          {@const settings = describeRunSettings(entry.config)}
          <li>
            <!-- A button, not a link. #80 asks for "a link that goes to the tool", and inside a
                 single-route workshop that action is not navigation: it mounts a panel and signals
                 it. An anchor to /fantasy/settlement would take the user off the bench, which is
                 the opposite of what the log is for. -->
            <button
              type="button"
              class="session-log__entry"
              aria-label={runAccessibleName(entry, label, now)}
              title={`seed ${entry.seed}${settings === '' ? '' : `\n${settings}`}`}
              onclick={() => onReplay?.(entry)}
            >
              <span class="session-log__headline">{runHeadline(entry)}</span>
              <span class="session-log__meta">{label} · {runAge(entry.at, now)}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .session-log {
    /* A sidebar, not a third bench: `flex-grow: 0` is the point of this line. The log never takes
       any of the surplus width, so it stays narrower than either neighbour however wide the
       window gets. Reading is all it does, and two short lines do not need more. */
    flex: 0 1 14rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    background: var(--slate);
  }

  .session-log__header {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: baseline;
    justify-content: space-between;
  }

  .session-log h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  .session-log__clear {
    flex-shrink: 0;
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
  }

  .session-log__note {
    margin: 0;
    font-size: 0.8rem;
    font-style: italic;
    color: var(--gold);
    line-height: 1.4;
  }

  .session-log__list {
    /* The list is what scrolls, so fifty rolls do not push the bench off the bottom of the page. */
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    max-height: var(--session-log-max-height, 24rem);
  }

  .session-log ul {
    margin: 0;
    padding: 0;
  }

  .session-log li {
    list-style-type: none;
    margin: 0;
  }

  .session-log__entry {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    width: 100%;
    margin: 0 0 0.15rem;
    padding: 0.3rem 0.5rem;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    color: white;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.3;
    text-align: left;
  }

  .session-log__entry:hover {
    border: 1px solid var(--iron-arachne-green);
    background: color-mix(in srgb, var(--iron-arachne-green) 15%, transparent);
  }

  .session-log__entry:active {
    transform: none;
    background: color-mix(in srgb, var(--iron-arachne-green) 30%, transparent);
    color: white;
  }

  .session-log__headline {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .session-log__meta {
    font-size: 0.75rem;
    opacity: 0.8;
    overflow-wrap: anywhere;
  }

  .session-log__empty {
    margin: 0;
    font-style: italic;
    opacity: 0.8;
  }
</style>

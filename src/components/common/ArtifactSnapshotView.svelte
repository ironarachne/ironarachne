<script lang="ts">
  type Props = {
    /** The stored snapshot to show. */
    snapshot: unknown;
  };

  const { snapshot }: Props = $props();

  /**
   * How deep the generic view descends before it stops and says how much is below.
   *
   * This is what an artifact looks like when its kind has registered no editor: the snapshot
   * itself, honestly, rather than a pretence at a view of it. A snapshot can be a culture's six
   * name generators and every pattern in them, which is not something to unroll on screen.
   */
  const MAX_DEPTH = 4;
  /** How many entries of a long list are shown before it says how many more there are. */
  const MAX_ENTRIES = 12;

  function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /** Turns a snapshot's field name into something readable: `musicStyle` becomes "Music Style". */
  function fieldLabel(key: string): string {
    const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }
</script>

{#snippet snapshotValue(value: unknown, depth: number)}
  {#if value === null || value === undefined || value === ''}
    <span class="artifact-snapshot__absent">—</span>
  {:else if Array.isArray(value)}
    {#if depth >= MAX_DEPTH}
      <span class="artifact-snapshot__absent">{value.length} entries</span>
    {:else}
      <ul class="artifact-snapshot__list">
        {#each value.slice(0, MAX_ENTRIES) as entry, index (index)}
          <li>{@render snapshotValue(entry, depth + 1)}</li>
        {/each}
        {#if value.length > MAX_ENTRIES}
          <li class="artifact-snapshot__absent">…and {value.length - MAX_ENTRIES} more</li>
        {/if}
      </ul>
    {/if}
  {:else if isPlainObject(value)}
    {#if depth >= MAX_DEPTH}
      <span class="artifact-snapshot__absent">{Object.keys(value).length} fields</span>
    {:else}
      <dl class="artifact-snapshot__fields">
        {#each Object.entries(value) as [key, nested] (key)}
          <dt>{fieldLabel(key)}</dt>
          <dd>{@render snapshotValue(nested, depth + 1)}</dd>
        {/each}
      </dl>
    {/if}
  {:else}
    {String(value)}
  {/if}
{/snippet}

<div class="artifact-snapshot">
  {@render snapshotValue(snapshot, 0)}
</div>

<style>
  .artifact-snapshot {
    min-width: 0;
  }

  .artifact-snapshot__fields {
    margin: 0;
  }

  .artifact-snapshot__fields dt {
    margin-top: 0.35rem;
    color: var(--gold);
    font-size: 0.8rem;
  }

  .artifact-snapshot__fields dd {
    margin: 0;
    min-width: 0;
    padding-left: 0.75rem;
    overflow-wrap: anywhere;
  }

  .artifact-snapshot__list {
    margin: 0;
    padding-left: 1.1rem;
  }

  .artifact-snapshot__absent {
    font-style: italic;
    opacity: 0.7;
  }
</style>

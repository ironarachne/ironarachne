<script lang="ts">
  import { onMount } from 'svelte';

  import {
    listArtifactBacklinks,
    onArtifactsChanged,
    resolveArtifactReferences,
    type ArtifactBacklink,
    type ArtifactSummary,
    type ResolvedArtifactReference,
  } from '$lib/artifacts';

  /**
   * What an artifact points at, and what points at it.
   *
   * Both directions, in the place the artifact is shown, because a broken reference has to be
   * visible where the user meets the artifact rather than only in a validation pass someone has to
   * remember to run (docs/workshop.md, "Composition"). The backward direction is the same list the
   * delete prompt is built from, and it answers "which of my regions use this culture?" on its own.
   */
  type Props = {
    projectId: string;
    /** The artifact whose links these are. */
    summary: ArtifactSummary;
  };

  const { projectId, summary }: Props = $props();

  let references: ResolvedArtifactReference[] = $state([]);
  let backlinks: ArtifactBacklink[] = $state([]);

  function refresh() {
    references = resolveArtifactReferences(projectId, summary);
    backlinks = listArtifactBacklinks(projectId, summary.id);
  }

  // Its own subscription rather than the panel's: what points *at* this artifact changes when some
  // other artifact is saved or deleted, which is a change the panel showing this one never hears
  // about. Reading is synchronous against the hydrated index, so a refresh costs nothing.
  onMount(() => {
    refresh();
    return onArtifactsChanged(refresh);
  });

  $effect(() => {
    void summary;
    refresh();
  });

  /** `naming-culture` becomes "Naming culture" — a role is a plain string owned by its kind. */
  function roleLabel(role: string): string {
    const spaced = role.replace(/[_-]+/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }
</script>

{#if references.length > 0 || backlinks.length > 0}
  <div class="artifact-references">
    {#if references.length > 0}
      <h4>Built from</h4>
      <ul>
        {#each references as resolved (resolved.reference.role + resolved.reference.targetId)}
          <li>
            <span class="artifact-references__role">{roleLabel(resolved.reference.role)}</span>
            {#if resolved.target === undefined}
              <!-- Deleting a referenced artifact is allowed and the link is left dangling on
                   purpose, so this is the ordinary way a reference ends up looking. Saying which
                   role is missing is what the required role on a reference buys. -->
              <span class="artifact-references__broken">missing — this was deleted</span>
            {:else}
              <span>{resolved.target.name}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if backlinks.length > 0}
      <h4>Used by</h4>
      <ul>
        {#each backlinks as backlink (backlink.referrer.id)}
          <li>
            <span>{backlink.referrer.name}</span>
            <span class="artifact-references__role">
              {backlink.references.map((reference) => roleLabel(reference.role)).join(', ')}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

<style>
  .artifact-references {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
    font-size: 0.9rem;
  }

  .artifact-references h4 {
    margin: 0.35rem 0 0.1rem;
    color: var(--gold);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .artifact-references ul {
    margin: 0;
    padding: 0;
  }

  .artifact-references li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.4rem;
    list-style-type: none;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .artifact-references__role {
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.75;
  }

  .artifact-references__broken {
    padding: 0 0.35rem;
    border: 1px solid var(--tan);
    border-radius: 3px;
    font-style: italic;
  }
</style>

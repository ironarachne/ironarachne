<script lang="ts" generics="TValue">
  import { onMount } from 'svelte';

  import type { ArtifactKind } from '$lib/artifact_kinds';
  import {
    hydrateArtifacts,
    listArtifactsOfKind,
    onArtifactsChanged,
    type ArtifactReference,
    type ArtifactSummary,
  } from '$lib/artifacts';
  import { getActiveProject, hydrateProjects, onProjectsChanged } from '$lib/projects';
  import { artifactKindEntry, loadArtifactValue } from '$lib/workshop';

  /**
   * "Use a saved X?" for any registered kind.
   *
   * One component, driven by the artifact kind registry, in place of the three hand-built pickers
   * this replaces: a new kind gets this affordance without a new component and without anything
   * here learning what the kind is. The value handed back is rebuilt by the kind's own codec, so
   * a generator receives the live thing its library works with rather than a stored snapshot.
   *
   * Composition is opt-in (rule 1, docs/workshop.md). This is an offer: the checkbox starts off,
   * and a generator that is handed nothing generates its own inputs exactly as it did before.
   */
  type Props = {
    /** The kind to offer. Anything in the registry works; nothing here knows which. */
    kind: ArtifactKind;
    /**
     * What the chosen artifact is *for*, recorded on the reference. Required, per decision 1 in
     * docs/workshop.md: two references of the same kind are otherwise indistinguishable, and it is
     * what lets a broken one read as "capital: missing" rather than "a settlement is missing".
     */
    role: string;
    checkboxLabel?: string;
    selectLabel?: string;
    /** Whether the offer has been taken up. */
    enabled?: boolean;
    /** The chosen artifact's id. */
    artifactId?: string;
    /** The chosen artifact, rebuilt into the live value its library works with. */
    value?: TValue;
    /**
     * The link to record when the consumer saves what it made. Set only once the value has
     * actually been loaded: a reference is a record of what a tool was handed, and one written
     * for an artifact that could not be read would claim an input that was never used.
     */
    reference?: ArtifactReference;
    /**
     * Why the chosen artifact is not on offer, or `null` when nothing is wrong.
     *
     * Shown here regardless; exposed because a consumer needs to tell "still loading" from "this
     * one cannot be used". A generator that waits for the value before rolling would otherwise
     * wait forever on an artifact that is never going to arrive.
     */
    problem?: string | null;
  };

  let {
    kind,
    role,
    checkboxLabel,
    selectLabel,
    enabled = $bindable(false),
    artifactId = $bindable(),
    value = $bindable(),
    reference = $bindable(),
    problem = $bindable(null),
  }: Props = $props();

  // Two of these on one page — a generator in a panel and the same one on its own route — must not
  // collide on label `for`.
  const uid = $props.id();
  const checkboxId = `${uid}-use`;
  const selectId = `${uid}-artifact`;

  const kindName = $derived(artifactKindEntry(kind)?.displayName?.toLowerCase() ?? kind);

  let projectId: string | undefined = $state();
  let choices: ArtifactSummary[] = $state([]);
  /** Whether the store has been read at all. Before it has, an empty list means "not looked yet". */
  let looked = $state(false);

  function refresh() {
    projectId = getActiveProject()?.id;
    choices = projectId === undefined ? [] : listArtifactsOfKind(projectId, kind);
    looked = true;
  }

  // Nothing is read before mount: the vault database does not exist while the site is being
  // prerendered, and a picker that differed between the server-rendered markup and the first
  // client render would flicker on every generator page. The subscriptions are what keep the list
  // current when a tool in the next panel saves something of this kind.
  onMount(() => {
    void Promise.all([hydrateProjects(), hydrateArtifacts()]).then(refresh);
    const stopWatchingArtifacts = onArtifactsChanged(refresh);
    const stopWatchingProjects = onProjectsChanged(refresh);
    return () => {
      stopWatchingArtifacts();
      stopWatchingProjects();
    };
  });

  /**
   * Keeps the selection honest: an artifact deleted from another panel, or a project switch that
   * changes what is on offer, drops a choice that no longer exists rather than leaving a name on
   * screen that names nothing. Nothing is loaded for a target that is gone, which is the picker's
   * share of "the target is gone is an ordinary state".
   *
   * It waits for the store to have been read, because a consumer may set a selection before then —
   * the religion generator does, restoring one from a saved snapshot — and an empty list at that
   * point means "not looked yet", not "no such artifact".
   */
  $effect(() => {
    if (looked && artifactId !== undefined && !choices.some((choice) => choice.id === artifactId)) {
      artifactId = undefined;
    }
  });

  /**
   * Loads the chosen artifact whenever the choice changes, and clears the value when the offer is
   * declined — a stale value left behind would be handed to the next generate as though the user
   * had asked for it.
   */
  $effect(() => {
    const chosenProject = projectId;
    const chosen = artifactId;
    if (!enabled || chosenProject === undefined || chosen === undefined) {
      value = undefined;
      reference = undefined;
      problem = null;
      return;
    }

    let current = true;
    void loadArtifactValue(chosenProject, chosen).then((result) => {
      // A slower load for an artifact the user has since moved off must not overwrite a faster one.
      if (!current) {
        return;
      }
      if (!result.ok) {
        value = undefined;
        reference = undefined;
        problem =
          result.reason === 'missing-target'
            ? `That ${kindName} is no longer in this project.`
            : `That ${kindName} could not be read (${result.reason}). ${result.message}`;
        return;
      }
      value = result.value as TValue;
      reference = { targetId: chosen, targetKind: kind, role };
      problem = null;
    });
    return () => {
      current = false;
    };
  });
</script>

{#if choices.length > 0}
  <div class="input-group">
    <label for={checkboxId}>{checkboxLabel ?? `Use a saved ${kindName}?`}</label>
    <input id={checkboxId} type="checkbox" bind:checked={enabled} />
  </div>
  <div class="input-group">
    <label for={selectId}>{selectLabel ?? `Saved ${kindName}`}</label>
    <select id={selectId} bind:value={artifactId} disabled={!enabled}>
      <option value={undefined}>Choose one…</option>
      {#each choices as choice (choice.id)}
        <option value={choice.id}>{choice.name}</option>
      {/each}
    </select>
  </div>

  {#if problem !== null}
    <p class="saved-artifact-picker__problem" role="alert">{problem}</p>
  {/if}
{/if}

<style>
  .saved-artifact-picker__problem {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    font-style: italic;
  }
</style>

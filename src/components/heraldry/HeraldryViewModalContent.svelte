<script lang="ts">
  import { onMount } from 'svelte';

  import { hydrateArtifacts, listArtifactsOfKind, type ArtifactSummary } from '$lib/artifacts';
  import { getActiveProject, hydrateProjects } from '$lib/projects';
  import type { Arms, RestoredHeraldry } from '$lib/heraldry';
  import { HERALDRY_ARTIFACT_KIND, renderHeraldryDeviceSvg } from '$lib/heraldry';
  import { loadArtifactValue } from '$lib/workshop';
  import type { RNG } from '@ironarachne/rng';
  import BaseButton from '$components/common/BaseButton.svelte';
  import ListButton from '$components/common/ListButton.svelte';
  import Notice from '$components/common/Notice.svelte';

  /**
   * A coat of arms, shown at a size worth looking at, with the option of wearing a different one.
   *
   * **The saved list comes from the vault, not from `localStorage`.** It used to read
   * `generator.heraldry`, the per-generator scope `heraldry_saved_state.ts` owned; #51 retired that
   * module, so what this offers now is the coats of arms saved as artifacts in the open project.
   * `src/lib/legacy_adoption` is what carries anything still sitting in the old scope across.
   *
   * The modal no longer saves. Keeping a coat of arms is what the heraldry generator's save control
   * does, and a character's own arms travel inside the character's payload.
   */
  type Props = {
    arms: Arms;
    seed: string;
    title?: string;
    rng: RNG;
    onDismiss: () => void;
    onReplace: (arms: Arms) => void;
  };

  const { arms, seed: _seed, title, rng, onDismiss, onReplace }: Props = $props();

  const previewWidth = 120;
  const previewHeight = 132;

  let projectId: string | undefined = $state();
  let choices: ArtifactSummary[] = $state([]);
  let problem: string | null = $state(null);

  // Nothing is read before mount: the vault database does not exist while the site is being
  // prerendered, and a dialog that differed between the server-rendered markup and the first client
  // render would flicker as it opened.
  onMount(() => {
    void Promise.all([hydrateProjects(), hydrateArtifacts()]).then(() => {
      projectId = getActiveProject()?.id;
      choices =
        projectId === undefined ? [] : listArtifactsOfKind(projectId, HERALDRY_ARTIFACT_KIND);
    });
  });

  async function wear(choice: ArtifactSummary): Promise<void> {
    const chosenProject = projectId;
    if (chosenProject === undefined) {
      return;
    }
    const result = await loadArtifactValue(chosenProject, choice.id);
    if (!result.ok) {
      problem = `Those arms could not be read (${result.reason}). ${result.message}`;
      return;
    }
    onReplace((result.value as RestoredHeraldry).arms);
  }
</script>

<div class="panel__field">
  <header class="panel__header">
    <div class="panel__header-field">
      <h2 id="modal-dialog-title" class="panel__title">{title ?? 'Heraldry'}</h2>
    </div>
  </header>

  <div class="panel__body">
    <p class="heraldry-view__blazon">{arms.blazon}</p>

    <div class="heraldry-view__preview">
      <!-- Renders app-generated markup (no external or user-supplied input). -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html renderHeraldryDeviceSvg(arms.device, previewWidth, previewHeight, rng)}
    </div>

    <!-- A dialog is a question, so its answers sit where the eye finishes. -->
    <div class="panel__footer">
      <BaseButton onclick={onDismiss}>Close</BaseButton>
    </div>

    {#if choices.length > 0}
      <div class="heraldry-view__saved">
        <h3>Wear a saved coat of arms</h3>

        <!-- A well: a run of rows that has to read as held by the dialog rather than as continuing
             past its edge, and the one surface allowed to be cut off mid-row. The rows are list
             rows, so a saved coat of arms is picked the same way an artifact or a tool is —
             the row itself is the choice, rather than a row with a button on the end of it. -->
        <ul class="well heraldry-view__list">
          {#each choices as choice (choice.id)}
            <li>
              <ListButton onclick={() => void wear(choice)} class="heraldry-view__row">
                <span class="heraldry-view__row-name">{choice.name}</span>
              </ListButton>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if problem !== null}
      <Notice tone="danger">{problem}</Notice>
    {/if}
  </div>
</div>

<style>
  /* The frame, the plate, the well and the rows are all the system's. What is left here is the
     preview's own geometry, which is a picture's size rather than a spacing decision. */

  .heraldry-view__blazon {
    color: var(--ink-muted);
    font: var(--t-small);
    margin: 0;
    max-width: var(--measure);
  }

  /* The device's own aspect, not a spacing step: a shield is 120 by 132. */
  .heraldry-view__preview {
    height: 132px;
    margin-inline: auto;
    width: 120px;
  }

  .heraldry-view__saved {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-height: 0;
  }

  .heraldry-view__saved h3 {
    margin: 0;
  }

  .heraldry-view__list {
    display: flex;
    flex-direction: column;
    gap: var(--s1);
    list-style: none;
    margin: 0;
    max-height: 16rem;
  }

  :global(.heraldry-view__row) {
    width: 100%;
  }

  .heraldry-view__row-name {
    overflow-wrap: anywhere;
  }
</style>

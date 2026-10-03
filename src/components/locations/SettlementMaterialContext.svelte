<script lang="ts">
  import { onMount } from 'svelte';
  import { onArtifactsChanged } from '$lib/artifacts';
  import { getActiveProject, onProjectsChanged } from '$lib/projects';
  import { regionMaterialSources, toRegionSnapshot, type Region } from '$lib/regions';
  import {
    regionalMaterialReference,
    settlementMaterialSection,
    unavailableRegionalMaterials,
    type RegionalMaterialLink,
    type RegionalMaterialPresentation,
  } from '$lib/settlements';
  import { resolveRegionalMaterials } from '$lib/workshop';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  type Props = {
    link: RegionalMaterialLink | null;
    onChange: (link: RegionalMaterialLink | null) => void;
    projectId?: string;
    presentation?: RegionalMaterialPresentation | null;
  };
  let { link, onChange, projectId, presentation = $bindable(null) }: Props = $props();
  const uid = $props.id();
  let enabled = $state(false);
  let pickedId: string | undefined = $state();
  let pickedRegion: Region | undefined = $state();
  let epoch = $state(0);
  let mounted = $state(false);
  const sources = $derived(
    pickedRegion ? regionMaterialSources(toRegionSnapshot(pickedRegion)) : [],
  );
  const section = $derived(presentation ? settlementMaterialSection(presentation) : null);
  onMount(() => {
    mounted = true;
    let lastProjectId = projectId ?? getActiveProject()?.id;
    const stopArtifacts = onArtifactsChanged(() => {
      epoch += 1;
    });
    const stopProjects = onProjectsChanged(() => {
      const activeId = projectId ?? getActiveProject()?.id;
      if (projectId === undefined && activeId !== lastProjectId) {
        onChange(null);
        enabled = false;
        pickedId = undefined;
      }
      lastProjectId = activeId;
      epoch += 1;
    });
    return () => {
      stopArtifacts();
      stopProjects();
    };
  });
  $effect(() => {
    const _epoch = epoch;
    const selected = link;
    const scope = projectId ?? getActiveProject()?.id;
    if (!mounted || !selected) {
      presentation = null;
      return;
    }
    presentation = unavailableRegionalMaterials('Loading regional material context…');
    let current = true;
    if (!scope) {
      presentation = unavailableRegionalMaterials('No project is open for this reference.');
      return;
    }
    void resolveRegionalMaterials(scope, selected, [regionalMaterialReference(selected)])
      .then((result) => {
        if (current) presentation = result;
      })
      .catch(() => {
        if (current) presentation = unavailableRegionalMaterials();
      });
    return () => {
      current = false;
    };
  });
  function chooseSource(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    const source = sources.find((entry) => JSON.stringify(entry.target) === value);
    if (source && enabled && pickedId && pickedRegion)
      onChange({ regionTargetId: pickedId, sourceSettlement: source.target });
  }
</script>

<fieldset class="regional-materials">
  <legend>Regional material reference</legend>
  <SavedArtifactPicker
    kind="region"
    role="material-context"
    scopeProjectId={projectId}
    checkboxLabel="Choose materials from a saved region?"
    selectLabel="Material source region"
    bind:enabled
    bind:artifactId={pickedId}
    bind:value={pickedRegion}
  />
  {#if enabled && pickedRegion && pickedId}
    <div class="input-group">
      <label for="{uid}-material-source">Source settlement</label>
      <select
        id="{uid}-material-source"
        onchange={chooseSource}
        value={link?.regionTargetId === pickedId ? JSON.stringify(link.sourceSettlement) : ''}
      >
        <option value="">Choose a source…</option>
        {#each sources as source (JSON.stringify(source.target))}
          <option value={JSON.stringify(source.target)}>{source.name}</option>
        {/each}
      </select>
    </div>
    {#if !sources.length}<p>This region has no source settlements.</p>{/if}
  {/if}
  {#if link}
    <BaseButton onclick={() => onChange(null)}>Clear material context</BaseButton>
  {/if}
  {#if section}
    <section aria-label="Regional material details">
      <h3>{section.heading}</h3>
      {#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}
      {#if section.items.length}<ul>
          {#each section.items as item}<li>{item}</li>{/each}
        </ul>{/if}
    </section>
  {/if}
</fieldset>

<style>
  .regional-materials {
    border: 0;
    padding: var(--s3) 0;
    min-width: 0;
  }
  .regional-materials select {
    max-width: 100%;
    min-width: 0;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import { getRendererDecision, invalidateRendererSession } from '$lib/renderers/renderer_decision';
  import {
    readRendererPreference,
    writeBackendOverride,
    writeQualityOverride,
  } from '$lib/renderers/renderer_preference_storage';
  import { parseRendererBackend } from '$lib/renderers/renderer_backend';
  import type { RenderQuality } from '$lib/renderers/astronomical_scene_types';
  import type { RendererDecision } from '$lib/renderers/renderer_decision_types';

  /**
   * How the previews are drawn is decided for the visitor, and these are the overrides for when
   * that decision is wrong. Asking someone up front whether their GPU is any good is asking them
   * to debug the site, so both controls default to "Automatic" and the line underneath says what
   * was decided and why.
   */
  type Props = {
    /** Called after an override changes, so the page can redraw with the new decision. */
    onchange?: () => void;
  };

  let { onchange }: Props = $props();

  let backendValue = $state('auto');
  let qualityValue = $state('auto');
  let decision = $state<RendererDecision | undefined>();

  const REASON_TEXT: Record<RendererDecision['reason'], string> = {
    capable: 'this machine can run the shaders',
    webgl_unavailable: 'this browser cannot run WebGL',
    context_lost: 'the WebGL context was lost',
    software_rasterizer: 'WebGL here is drawn by the CPU, not a GPU',
    budget_exceeded: 'the first preview took too long to draw',
    // Deliberately not "you chose it": one override is enough to make the reason `user_override`,
    // and someone who only picked a backend did not choose the detail level it came with.
    user_override: 'of your override',
  };

  const BACKEND_LABEL = { webgl: 'WebGL', canvas2d: 'Canvas 2D' };
  const QUALITY_LABEL = { full: 'full detail', reduced: 'reduced detail' };

  const status = $derived(
    decision === undefined
      ? ''
      : `${BACKEND_LABEL[decision.backend]} at ${QUALITY_LABEL[decision.quality]}, because ${REASON_TEXT[decision.reason]}.`,
  );

  function refreshDecision() {
    decision = getRendererDecision(document);
  }

  function applyBackend() {
    writeBackendOverride(parseRendererBackend(backendValue));
    invalidateRendererSession();
    onchange?.();
    refreshDecision();
  }

  function applyQuality() {
    writeQualityOverride(qualityValue === 'auto' ? undefined : (qualityValue as RenderQuality));
    invalidateRendererSession();
    onchange?.();
    refreshDecision();
  }

  onMount(() => {
    const preference = readRendererPreference();
    backendValue = preference.backendOverride ?? 'auto';
    qualityValue = preference.qualityOverride ?? 'auto';
    refreshDecision();
  });
</script>

<SelectField
  id="rendererBackend"
  label="Renderer"
  bind:value={backendValue}
  onchange={applyBackend}
  options={[
    { value: 'auto', label: 'Automatic' },
    { value: 'webgl', label: 'WebGL' },
    { value: 'canvas2d', label: 'Canvas 2D' },
  ]}
/>

<SelectField
  id="rendererQuality"
  label="Detail"
  bind:value={qualityValue}
  onchange={applyQuality}
  options={[
    { value: 'auto', label: 'Automatic' },
    { value: 'full', label: 'Full' },
    { value: 'reduced', label: 'Reduced' },
  ]}
/>

{#if status}
  <p class="renderer-status">Drawing previews with {status}</p>
{/if}

<style>
  .renderer-status {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 1rem;
  }
</style>

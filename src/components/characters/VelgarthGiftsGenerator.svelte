<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Velgarth from '$lib/velgarth_gifts';
  import type { Gift } from '$lib/velgarth_gifts';
  import Download from '$lib/download';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/velgarth-gifts';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. The page used to build a whole new
   * `RNG` from `Date.now()` on every press to take one string from it, which is the same defect
   * requirement 2.2 names elsewhere in the pass wearing a smaller coat.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  /**
   * The rolled Gifts.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the list in
   * a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`. The same trap is written up in `$lib/workshop`'s
   * README beside `saveToolArtifact`.
   */
  let gifts = $state.raw<Gift[]>([]);

  const giftsSnapshot = $derived(
    gifts.length === 0 ? null : Velgarth.toVelgarthGiftsSnapshot(gifts),
  );

  const defaultArtifactName = $derived(Velgarth.velgarthGiftsDisplayName(gifts));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    gifts = Velgarth.rollVelgarthGifts(seed);
  }

  function exportMarkdown() {
    if (gifts.length === 0) {
      return;
    }
    const markdown = Velgarth.velgarthGiftsToMarkdown(gifts);
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${Velgarth.velgarthGiftsFileStem(gifts)}.md`);
    URL.revokeObjectURL(url);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Velgarth Gifts Generator">
  {#snippet description()}
    <p>This gives you a set of Gifts for a character from Mercedes Lackey's Velgarth setting.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={Velgarth.VELGARTH_GIFTS_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={giftsSnapshot}
    {seed}
    defaultName={defaultArtifactName}
  />

  {#if gifts.length > 0}
    <div class="gift-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
    </div>
  {/if}

  {#each gifts as gift}
    <div class="gift">
      <h2>{Velgarth.velgarthGiftHeading(gift)}</h2>
      <p>{gift.description}</p>
    </div>
  {/each}
</GeneratorPage>

<style>
  .gift-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>

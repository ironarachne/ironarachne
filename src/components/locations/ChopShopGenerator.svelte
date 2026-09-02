<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as ChopShop from '$lib/chopshop';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/chop-shop';

  /**
   * The page's own RNG, which is what a new seed is drawn from. Seeded from the clock once, at
   * mount, and never again: this page used to draw a fresh seed from the clock on every press and
   * showed it to nobody, which is the requirement 2.3 failure docs/readiness-locations.md names.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let shop = $state.raw<ChopShop.ChopShop | null>(null);
  const shopSnapshot = $derived(shop === null ? null : ChopShop.toChopShopSnapshot(shop));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    shop = ChopShop.rollChopShop(seed);
  }

  function exportMarkdown() {
    if (shop === null) return;
    downloadTextFile(
      ChopShop.chopShopToMarkdown(shop),
      `${ChopShop.CHOP_SHOP_FILE_STEM}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (shop === null) return;
    await downloadTextPdf(
      ChopShop.CHOP_SHOP_DISPLAY_NAME,
      ChopShop.chopShopToText(shop),
      `${ChopShop.CHOP_SHOP_FILE_STEM}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Chop Shop Generator">
  {#snippet description()}
    <p>This is a cyberpunk chop shop generator.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={ChopShop.CHOP_SHOP_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={shopSnapshot}
    {seed}
    defaultName={ChopShop.CHOP_SHOP_DISPLAY_NAME}
  />

  {#if shop}
    <div class="shop-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
    </div>

    <p class="shop">{shop.text}</p>
  {/if}
</GeneratorPage>

<style>
  .shop-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>

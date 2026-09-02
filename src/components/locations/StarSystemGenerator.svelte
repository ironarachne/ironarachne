<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import { browser } from '$app/environment';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import RendererOverrideControls from '$components/common/RendererOverrideControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import type { ArtifactReference } from '$lib/artifacts';
  import * as Bodies from '$lib/astronomical_bodies';
  import type {
    PlanetSnapshot,
    StarSystem,
    StarSystemGeneratorConfigRecord,
  } from '$lib/astronomical_bodies';
  import { buildStarSystemScene, renderSceneToSvg } from '$lib/renderers';
  import {
    renderPlanetPreviewImage,
    renderStarPreviewImage,
    renderStarSystemPreviewImage,
  } from '$lib/renderers/astronomical_preview';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';

  const TOOL_PATH = '/star-system';

  const width = 128;
  const height = 128;

  /** The size the SVG download is written at: a wide strip, and scalable past it. */
  const EXPORT_HEIGHT = 512;

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to also be the generator's RNG,
   * reseeded from the seed box on every press and handed to the config; `star_system_roll.ts` owns
   * that now, so the two paths cannot drift.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let planetCountControl = $state(Bodies.STAR_SYSTEM_ANY);
  let starType = $state(Bodies.STAR_SYSTEM_ANY);

  /** The saved planet to place in the system, when the user has offered one (5.1). */
  let useReferencedPlanet = $state(false);
  let referencedPlanet = $state<PlanetSnapshot | undefined>(undefined);
  let planetReference = $state<ArtifactReference | undefined>(undefined);

  /**
   * The rolled system.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`.
   */
  let system = $state.raw<StarSystem | undefined>(undefined);

  /** The body the picker supplied, as the roll placed it, and whether this roll used one. */
  let referencedBody = $state.raw<StarSystem['planets'][number] | undefined>(undefined);
  let usedReferencedPlanet = $state(false);
  let systemCompositeSrc = $state('');

  let starImageSrcs = $state<string[]>([]);
  let planetImageSrcs = $state<string[]>([]);

  const planetCountOptions = [
    { value: Bodies.STAR_SYSTEM_ANY, label: 'Random' },
    ...Array.from({ length: Bodies.STAR_SYSTEM_MAX_PLANET_COUNT }, (_entry, index) => ({
      value: (index + 1).toString(),
      label: (index + 1).toString(),
    })),
  ];

  const starTypeOptions = [
    { value: Bodies.STAR_SYSTEM_ANY, label: 'Random' },
    ...Bodies.starTypeNames().map((name) => ({ value: name, label: name })),
  ];

  /** What the roll records about itself: the page's two controls, as provenance (3.6). */
  const generatorConfig = $derived<StarSystemGeneratorConfigRecord>({
    ...(planetCountControl === Bodies.STAR_SYSTEM_ANY
      ? {}
      : { planetCount: parseInt(planetCountControl, 10) }),
    ...(starType === Bodies.STAR_SYSTEM_ANY ? {} : { starType }),
  });

  /**
   * What is stored.
   *
   * A referenced planet is **not** in it. The link lives on the artifact's reference, per rule 2 of
   * docs/workshop.md: a system holding its own copy of a planet somebody later edits would show
   * the stale one forever. What follows is worth knowing rather than discovering — a system saved
   * with a referenced planet reads back with one fewer planet in its own list, and the panel's
   * reference list is where the link shows.
   */
  const snapshot = $derived(
    system === undefined
      ? null
      : Bodies.toStarSystemSnapshot(
          usedReferencedPlanet
            ? { ...system, planets: system.planets.filter((planet) => planet !== referencedBody) }
            : system,
        ),
  );

  const document_ = $derived(snapshot === null ? null : Bodies.starSystemToDocument(snapshot));

  const defaultArtifactName = $derived(
    system === undefined ? '' : Bodies.starSystemDisplayName(system),
  );

  const references = $derived(
    usedReferencedPlanet && planetReference !== undefined ? [planetReference] : [],
  );

  /**
   * Image seeds come from the page's seed and each body's ordinal, not from a fresh RNG draw.
   *
   * They used to be drawn as this ran, so every rebuild produced different pictures of the same
   * system: changing the renderer redrew every body rather than redrawing it differently, and the
   * seed control — whose whole promise is that a seed reproduces what you saw — did not reproduce
   * the previews.
   *
   * A missing renderer is an ordinary state rather than a failure (2.5): the backend is chosen for
   * us, Canvas2D needs no GPU, and every figure below is written out regardless.
   */
  function rebuildSystemPreviewImages() {
    if (!browser || system === undefined) return;
    const current = system;
    const compositeW = width * (current.stars.length + current.planets.length) * 0.5;
    systemCompositeSrc = renderStarSystemPreviewImage(
      document,
      current,
      compositeW,
      height,
      Bodies.starSystemPreviewSeed(seed, 'composite'),
    );
    starImageSrcs = current.stars.map((star, index) =>
      renderStarPreviewImage(
        document,
        star,
        width,
        height,
        Bodies.starSystemPreviewSeed(seed, `star${index}`),
      ),
    );
    planetImageSrcs = current.planets.map((planet, index) =>
      renderPlanetPreviewImage(
        document,
        planet,
        width,
        height,
        Bodies.starSystemPreviewSeed(seed, `planet${index}`),
      ),
    );
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    const rolled = Bodies.rollStarSystem(seed, generatorConfig);

    if (useReferencedPlanet && referencedPlanet !== undefined) {
      const body = Bodies.planetBodyFromSnapshot(referencedPlanet);
      system = Bodies.withReferencedPlanet(rolled, body);
      referencedBody = body;
      usedReferencedPlanet = true;
    } else {
      system = rolled;
      referencedBody = undefined;
      usedReferencedPlanet = false;
    }

    rebuildSystemPreviewImages();
  }

  function exportMarkdown() {
    if (snapshot === null) {
      return;
    }
    downloadTextFile(
      Bodies.starSystemToMarkdown(snapshot),
      `${Bodies.starSystemFileStem(snapshot)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (snapshot === null) {
      return;
    }
    await downloadTextPdf(
      Bodies.starSystemDisplayName(snapshot),
      Bodies.starSystemToText(snapshot),
      `${Bodies.starSystemFileStem(snapshot)}.pdf`,
    );
  }

  /**
   * The system as a scalable image, which is #17's half of the stellar SVG work.
   *
   * The same strip the composite preview draws, written as vectors rather than pixels. #16 asks
   * for something else — an orbital view, planets on their orbits around the star — and that is a
   * picture `AstronomicalScene` deliberately cannot describe: a system's layout resolves to
   * absolute positions inside the scene builder, on purpose, so an orbital diagram needs a shape
   * `docs/renderers.md` would have to grow first. It stays open.
   */
  function exportSvg() {
    if (system === undefined || snapshot === null) {
      return;
    }
    const bodyCount = system.stars.length + system.planets.length;
    const scene = buildStarSystemScene(
      system,
      EXPORT_HEIGHT * Math.max(1, bodyCount) * 0.5,
      EXPORT_HEIGHT,
      Bodies.starSystemPreviewSeed(seed, 'composite'),
    );
    downloadTextFile(
      renderSceneToSvg(scene, Bodies.starSystemDisplayName(snapshot)),
      `${Bodies.starSystemFileStem(snapshot)}.svg`,
      'image/svg+xml',
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Star System Generator">
  {#snippet description()}
    <p>
      A star, its planets, and the figures for each. The previews pick how to draw themselves from
      what this machine can do; every number below is written out regardless.
    </p>
  {/snippet}

  <RendererOverrideControls onchange={rebuildSystemPreviewImages} />

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="planetCountControl"
    label="Planet Count"
    bind:value={planetCountControl}
    options={planetCountOptions}
  />

  <SelectField id="starType" label="Star Type" bind:value={starType} options={starTypeOptions} />

  <SavedArtifactPicker
    kind={Bodies.PLANET_ARTIFACT_KIND}
    role="planet"
    checkboxLabel="Put a saved planet in this system"
    selectLabel="Planet"
    bind:enabled={useReferencedPlanet}
    bind:value={referencedPlanet}
    bind:reference={planetReference}
  />

  <div class="actions">
    <BaseButton onclick={generate}>Generate</BaseButton>
    <BaseButton onclick={exportMarkdown} disabled={!system}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={!system}>Download PDF</BaseButton>
    <BaseButton onclick={exportSvg} disabled={!system}>Download SVG</BaseButton>
  </div>

  <SaveArtifactButton
    kind={Bodies.STAR_SYSTEM_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    {snapshot}
    {seed}
    config={generatorConfig}
    defaultName={defaultArtifactName}
    {references}
  />

  {#if usedReferencedPlanet}
    <p class="referenced-note">
      This system uses a saved planet. It is linked rather than copied, so the saved system holds
      the planets it rolled and a reference to that one.
    </p>
  {/if}

  {#if system && document_}
    <h2>{document_.title}</h2>

    {#if browser && systemCompositeSrc}
      <div class="composite">
        <img alt="{system.name} composite" src={systemCompositeSrc} />
      </div>
    {/if}

    {#each document_.paragraphs as paragraph, index (index)}
      <p>{paragraph}</p>
    {/each}

    <h3>Stars</h3>

    {#each system.stars as star, starIndex (starIndex)}
      <article class="media-banner">
        <div class="image-container">
          <img alt="{star.name} image" src={starImageSrcs[starIndex] ?? ''} />
        </div>
        <div>
          <h5>{star.name}</h5>
          <p>{star.description}</p>
          <StatBlock>
            {#each document_.sections[starIndex]?.lines.filter((line) => line.label !== undefined) ?? [] as line, index (index)}
              <Stat label={line.label ?? ''}>{line.value}</Stat>
            {/each}
          </StatBlock>
        </div>
      </article>
    {/each}

    <h3>Planets</h3>

    {#each system.planets as planet, planetIndex (planetIndex)}
      {@const section = document_.sections[system.stars.length + planetIndex]}
      <article class="media-banner">
        <div class="image-container">
          <img alt="{planet.name} image" src={planetImageSrcs[planetIndex] ?? ''} />
        </div>
        <div>
          <h5>{planet.name}</h5>
          <p>{planet.description}</p>
          <StatBlock>
            {#each section?.lines.filter((line) => line.label !== undefined) ?? [] as line, index (index)}
              <Stat label={line.label ?? ''}>{line.value}</Stat>
            {/each}
          </StatBlock>
        </div>
      </article>
    {/each}
  {/if}
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .composite {
    width: 100%;
    margin-bottom: 2rem;
  }

  .composite img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  .referenced-note {
    font: var(--t-small);
    color: var(--ink-muted);
    margin: var(--s3) 0 0;
  }

  article.media-banner {
    display: grid;
    grid-template-columns: 128px auto;
    column-gap: 1rem;
  }
</style>

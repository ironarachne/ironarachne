import {
  artifactSourceFingerprint,
  dataUrlToBlob,
  textToDataUrl,
  type ArtifactAssetDraft,
} from '$lib/artifacts';

export const ASTRONOMICAL_PREVIEW_RENDERER_ID = 'astronomical-system-composite';
export const ASTRONOMICAL_PREVIEW_RENDERER_VERSION = '1';
export const PLANET_PREVIEW_RENDERER_ID = 'planet-preview';
export const REGION_MAP_RENDERER_ID = 'region-map';
export const DUNGEON_MAP_RENDERER_ID = 'dungeon-map';
export const HERALDRY_PREVIEW_RENDERER_ID = 'heraldry-device';
export const ORGANIZATION_EMBLEM_RENDERER_ID = 'organization-emblem';
export const MERCHANT_MARK_RENDERER_ID = 'merchant-mark';
const VISUAL_RENDERER_VERSION = '1';

export type ArtifactPreviewContext = {
  document: Document;
  seed?: string;
};

export function hasArtifactPreviewProvider(kind: string): boolean {
  return [
    'star-nation',
    'star-system',
    'planet',
    'region',
    'dungeon',
    'heraldry',
    'organization',
    'merchant',
  ].includes(kind);
}

export function artifactPreviewRenderer(
  kind: string,
): { rendererId: string; rendererVersion: string } | undefined {
  const rendererId =
    kind === 'star-nation' || kind === 'star-system'
      ? ASTRONOMICAL_PREVIEW_RENDERER_ID
      : kind === 'planet'
        ? PLANET_PREVIEW_RENDERER_ID
        : kind === 'region'
          ? REGION_MAP_RENDERER_ID
          : kind === 'dungeon'
            ? DUNGEON_MAP_RENDERER_ID
            : kind === 'heraldry'
              ? HERALDRY_PREVIEW_RENDERER_ID
              : kind === 'organization'
                ? ORGANIZATION_EMBLEM_RENDERER_ID
                : kind === 'merchant'
                  ? MERCHANT_MARK_RENDERER_ID
                  : undefined;
  return rendererId === undefined
    ? undefined
    : {
        rendererId,
        rendererVersion:
          rendererId === ASTRONOMICAL_PREVIEW_RENDERER_ID
            ? ASTRONOMICAL_PREVIEW_RENDERER_VERSION
            : VISUAL_RENDERER_VERSION,
      };
}

export async function renderArtifactPreview(
  kind: string,
  snapshot: unknown,
  context: ArtifactPreviewContext,
): Promise<ArtifactAssetDraft | undefined> {
  const seed = context.seed ?? `artifact:${kind}`;
  let dataUrl: string;
  let width: number;
  let height: number;

  if (kind === 'star-nation') {
    const [
      { starNationFromSnapshot },
      { renderStarSystemPreviewImage },
      { starNationPreviewSeed },
    ] = await Promise.all([
      import('$lib/civilizations/star_nation_snapshot.js'),
      import('$lib/renderers/astronomical_preview.js'),
      import('$lib/civilizations/star_nation_roll.js'),
    ]);
    const nation = starNationFromSnapshot(snapshot as Parameters<typeof starNationFromSnapshot>[0]);
    const system = nation.homeSystem;
    if (system.stars.length === 0 && system.planets.length === 0) {
      return undefined;
    }
    width = 64 * (system.stars.length + system.planets.length);
    height = 64;
    dataUrl = renderStarSystemPreviewImage(
      context.document,
      system,
      width,
      height,
      starNationPreviewSeed(seed),
    );
  } else if (kind === 'star-system') {
    const [
      { starSystemFromSnapshot },
      { renderStarSystemPreviewImage },
      { starSystemPreviewSeed },
    ] = await Promise.all([
      import('$lib/astronomical_bodies/star_system_snapshot.js'),
      import('$lib/renderers/astronomical_preview.js'),
      import('$lib/astronomical_bodies/star_system_roll.js'),
    ]);
    const system = starSystemFromSnapshot(snapshot as Parameters<typeof starSystemFromSnapshot>[0]);
    width = 128 * (system.stars.length + system.planets.length) * 0.5;
    height = 128;
    dataUrl = renderStarSystemPreviewImage(
      context.document,
      system,
      width,
      height,
      starSystemPreviewSeed(seed, 'composite'),
    );
  } else if (kind === 'planet') {
    const [{ planetBodyFromSnapshot }, { renderPlanetPreviewImage }] = await Promise.all([
      import('$lib/astronomical_bodies/planet_snapshot.js'),
      import('$lib/renderers/astronomical_preview.js'),
    ]);
    width = 400;
    height = 400;
    dataUrl = renderPlanetPreviewImage(
      context.document,
      planetBodyFromSnapshot(snapshot as Parameters<typeof planetBodyFromSnapshot>[0]),
      width,
      height,
      seed,
    );
  } else if (kind === 'region') {
    const { regionToMapSvg } = await import('$lib/regions/region_presentation.js');
    dataUrl = textToDataUrl(
      regionToMapSvg(snapshot as Parameters<typeof regionToMapSvg>[0]),
      'image/svg+xml',
    );
    width = 1888;
    height = 1200;
  } else if (kind === 'dungeon') {
    const [{ dungeonFromSnapshot }, { renderClassicModuleMapToCanvas }] = await Promise.all([
      import('$lib/dungeon/dungeon_rehydrate.js'),
      import('$lib/dungeon/render/classic_module_map.js'),
    ]);
    const canvas = context.document.createElement('canvas');
    width = 800;
    height = 600;
    canvas.width = width;
    canvas.height = height;
    renderClassicModuleMapToCanvas(
      dungeonFromSnapshot(snapshot as Parameters<typeof dungeonFromSnapshot>[0]),
      canvas,
    );
    dataUrl = canvas.toDataURL('image/png');
  } else if (kind === 'heraldry') {
    const [{ heraldryFromSnapshot }, { renderHeraldryDeviceSvg }, { RNG }] = await Promise.all([
      import('$lib/heraldry/heraldry_rehydrate.js'),
      import('$lib/heraldry/renderers/svg.js'),
      import('@ironarachne/rng'),
    ]);
    const restored = heraldryFromSnapshot(snapshot as Parameters<typeof heraldryFromSnapshot>[0]);
    width = 600;
    height = 660;
    dataUrl = textToDataUrl(
      renderHeraldryDeviceSvg(restored.arms.device, width, height, new RNG(restored.seed)),
      'image/svg+xml',
    );
  } else if (kind === 'organization') {
    const [{ renderOrganizationEmblemSvg }, { RNG }] = await Promise.all([
      import('$lib/organizations/organization_emblem.js'),
      import('@ironarachne/rng'),
    ]);
    const organization = snapshot as {
      visualIdentity: { emblem: Parameters<typeof renderOrganizationEmblemSvg>[0] };
    };
    const svg = renderOrganizationEmblemSvg(organization.visualIdentity.emblem, new RNG(seed));
    if (svg === null) return undefined;
    width = 200;
    height = 220;
    dataUrl = textToDataUrl(svg, 'image/svg+xml');
  } else if (kind === 'merchant') {
    const { renderMerchantMarkSvg } =
      await import('$lib/merchant_marks/render_merchant_mark_svg.js');
    const merchant = snapshot as { mark: Parameters<typeof renderMerchantMarkSvg>[0] | null };
    if (merchant.mark === null) return undefined;
    width = 120;
    height = 120;
    dataUrl = textToDataUrl(renderMerchantMarkSvg(merchant.mark, width, height), 'image/svg+xml');
  } else {
    return undefined;
  }

  const renderer = artifactPreviewRenderer(kind);
  if (renderer === undefined) return undefined;

  return {
    role: 'primary-preview',
    mediaType: dataUrl.startsWith('data:image/svg+xml') ? 'image/svg+xml' : 'image/png',
    blob: dataUrlToBlob(dataUrl),
    width,
    height,
    sourceFingerprint: await artifactSourceFingerprint(
      snapshot,
      renderer.rendererId,
      renderer.rendererVersion,
    ),
    rendererId: renderer.rendererId,
    rendererVersion: renderer.rendererVersion,
  };
}

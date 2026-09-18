import { describe, expect, it } from 'vitest';

import { dataUrlToBlob } from '$lib/artifacts';
import { rollHeraldrySnapshot } from '$lib/heraldry';
import { rollMerchantSnapshot } from '$lib/merchants';
import { rollOrganizationSnapshot } from '$lib/organizations';
import { rollRegionSnapshot } from '$lib/regions';

import {
  artifactPreviewRenderer,
  hasArtifactPreviewProvider,
  renderArtifactPreview,
} from './artifact_visuals';

describe('artifact visual providers', () => {
  it('routes every persisted visual kind to a versioned renderer', () => {
    expect(
      [
        'star-nation',
        'star-system',
        'planet',
        'region',
        'dungeon',
        'heraldry',
        'organization',
        'merchant',
      ].map((kind) => artifactPreviewRenderer(kind)),
    ).toEqual([
      { rendererId: 'astronomical-system-composite', rendererVersion: '1' },
      { rendererId: 'astronomical-system-composite', rendererVersion: '1' },
      { rendererId: 'planet-preview', rendererVersion: '1' },
      { rendererId: 'region-map', rendererVersion: '1' },
      { rendererId: 'dungeon-map', rendererVersion: '1' },
      { rendererId: 'heraldry-device', rendererVersion: '1' },
      { rendererId: 'organization-emblem', rendererVersion: '1' },
      { rendererId: 'merchant-mark', rendererVersion: '1' },
    ]);
    expect(hasArtifactPreviewProvider('culture')).toBe(false);
  });

  it('converts encoded SVG data URLs without changing their media type or text', async () => {
    const blob = dataUrlToBlob('data:image/svg+xml;charset=utf-8,%3Csvg%20/%3E');

    expect(blob.type).toBe('image/svg+xml');
    expect(await blob.text()).toBe('<svg />');
  });

  it('renders the non-canvas providers from stored snapshots', async () => {
    const context = { document: {} as Document, seed: 'visual-fixture' };
    const snapshots = [
      ['region', rollRegionSnapshot('visual-region')],
      ['heraldry', rollHeraldrySnapshot('visual-heraldry')],
      ['organization', rollOrganizationSnapshot('visual-organization')],
      [
        'merchant',
        rollMerchantSnapshot('visual-merchant', {
          shopType: 'any',
          venueType: 'any',
          honesty: 'any',
          priceLevel: 'any',
          stockCount: 12,
          includeMerchantMark: true,
        }),
      ],
    ] as const;

    for (const [kind, snapshot] of snapshots) {
      const asset = await renderArtifactPreview(kind, snapshot, context);
      if (asset !== undefined) {
        expect(asset.role).toBe('primary-preview');
        expect(asset.blob.size).toBeGreaterThan(0);
        expect(asset.mediaType).toMatch(/^image\//);
      }
    }
  });

  it('does not claim a provider for an unsupported kind', async () => {
    await expect(renderArtifactPreview('culture', {}, { document: {} as Document })).resolves.toBe(
      undefined,
    );
  });
});

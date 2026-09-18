import { describe, expect, it } from 'vitest';

import {
  artifactSourceFingerprint,
  dataUrlToBlob,
  isArtifactAssetCurrent,
} from './artifact_assets';

describe('artifact assets', () => {
  it('converts the renderer data URL to a typed blob without changing bytes', async () => {
    const blob = dataUrlToBlob('data:image/png;base64,AAEC');

    expect(blob.type).toBe('image/png');
    expect([...new Uint8Array(await blob.arrayBuffer())]).toEqual([0, 1, 2]);
  });

  it('fingerprints the complete source and rejects renderer changes', async () => {
    const fingerprint = await artifactSourceFingerprint({ b: 2, a: 1 }, 'renderer', '1');
    const asset = {
      id: 'asset',
      artifactId: 'artifact',
      role: 'primary-preview',
      mediaType: 'image/png',
      byteSize: 1,
      sourceFingerprint: fingerprint,
      rendererId: 'renderer',
      rendererVersion: '1',
      createdAt: 1,
    };

    expect(isArtifactAssetCurrent(asset, fingerprint, 'renderer', '1')).toBe(true);
    expect(isArtifactAssetCurrent(asset, fingerprint, 'renderer', '2')).toBe(false);
    expect(await artifactSourceFingerprint({ a: 1, b: 2 }, 'renderer', '1')).toBe(fingerprint);
  });
});

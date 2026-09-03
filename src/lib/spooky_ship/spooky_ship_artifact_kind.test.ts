import { describe, expect, it } from 'vitest';

import {
  SPOOKY_SHIP_ARTIFACT_KIND,
  SPOOKY_SHIP_PAYLOAD_VERSION,
  migrateSpookyShipSnapshot,
  spookyShipArtifactKind,
  validateSpookyShipSnapshot,
} from './spooky_ship_artifact_kind';
import { SPOOKY_SHIP_DISPLAY_NAME } from './spooky_ship_presentation';
import { rollSpookyShipSnapshot } from './spooky_ship_roll';

const SHIP = rollSpookyShipSnapshot('kind-seed');

describe('spookyShipArtifactKind', () => {
  it('registers the id and version the pass assigned it', () => {
    expect(spookyShipArtifactKind.kind).toBe(SPOOKY_SHIP_ARTIFACT_KIND);
    expect(SPOOKY_SHIP_ARTIFACT_KIND).toBe('spooky-ship');
    expect(spookyShipArtifactKind.payloadVersion).toBe(SPOOKY_SHIP_PAYLOAD_VERSION);
    expect(SPOOKY_SHIP_PAYLOAD_VERSION).toBe(1);
  });

  it('is its own kind rather than a starship shared with /swn/starship', () => {
    // The question #71 asks to be settled deliberately, and decision 6 of
    // docs/readiness-objects.md settling it: one shape, two kinds.
    expect(SPOOKY_SHIP_ARTIFACT_KIND).not.toBe('starship');
    expect(SPOOKY_SHIP_ARTIFACT_KIND).not.toBe('starship.swn');
  });

  it('names one after the tool rather than after its contents', () => {
    // A paragraph has no name of its own.
    expect(spookyShipArtifactKind.nameOf(SHIP)).toBe(SPOOKY_SHIP_DISPLAY_NAME);
  });

  it('loads a codec that round-trips', async () => {
    const codec = await spookyShipArtifactKind.loadCodec();

    expect(codec.toSnapshot(codec.fromSnapshot(SHIP, undefined as never))).toEqual(SHIP);
  });
});

describe('validateSpookyShipSnapshot', () => {
  it('accepts a rolled derelict unchanged', () => {
    const result = validateSpookyShipSnapshot(SHIP);

    expect(result.ok).toBe(true);
    expect(result.ok ? result.value : null).toEqual(SHIP);
  });

  it('accepts an emptied paragraph, because clearing one is an editing decision', () => {
    // 3.3 asks for a well-defined empty result rather than a refusal.
    const result = validateSpookyShipSnapshot({ text: '' });

    expect(result.ok ? result.value.text : null).toBe('');
  });

  it('refuses anything without a text field', () => {
    for (const payload of [null, undefined, 42, 'adrift', ['adrift'], {}, { text: 42 }]) {
      expect(validateSpookyShipSnapshot(payload).ok, String(payload)).toBe(false);
    }
  });

  it('keeps only the text, so a payload carrying more does not smuggle it through', () => {
    const result = validateSpookyShipSnapshot({ text: 'adrift', crew: ['nobody'] });

    expect(result.ok ? result.value : null).toEqual({ text: 'adrift' });
  });
});

describe('migrateSpookyShipSnapshot', () => {
  it('rejects rather than pretending there has been another shape', () => {
    // Requirement 7.3 has one step to exercise and it is the absence of one.
    const result = migrateSpookyShipSnapshot({ text: 'adrift' }, 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('unsupported-version');
    expect(result.ok ? '' : result.message).toContain('payload version 0');
  });
});

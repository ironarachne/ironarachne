import * as RNG from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { generate } from './character';
import { buildUwCharacterPdf } from './render_uw_character_pdf';

describe('buildUwCharacterPdf', () => {
  it('returns an application/pdf blob', async () => {
    const character = generate(new RNG.RNG('uw-pdf-test'));
    const blob = await buildUwCharacterPdf(character);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('embeds origin details in the generated pdf', async () => {
    const character = generate(new RNG.RNG('uw-pdf-origin'));
    const blob = await buildUwCharacterPdf(character);
    const pdfText = new TextDecoder('latin1').decode(await blob.arrayBuffer());

    expect(pdfText).toContain('UNCHARTED WORLDS');
    expect(pdfText).toContain(character.origin.name);
  });

  it('renders on a single landscape page', async () => {
    const character = generate(new RNG.RNG('uw-pdf-single-page'));
    const blob = await buildUwCharacterPdf(character);
    const pdfText = new TextDecoder('latin1').decode(await blob.arrayBuffer());

    expect(pdfText).toMatch(/\/Count 1/);
  });
});

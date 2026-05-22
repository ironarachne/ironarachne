import * as RNG from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { generate } from './character';
import { buildSwnCharacterPdf } from './render_swn_character_pdf';

describe('buildSwnCharacterPdf', () => {
  it('returns an application/pdf blob', async () => {
    const character = generate(new RNG.RNG('swn-pdf-test'));
    const blob = await buildSwnCharacterPdf(character);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('embeds class details in the generated pdf', async () => {
    const character = generate(new RNG.RNG('swn-pdf-class'));
    const blob = await buildSwnCharacterPdf(character);
    const pdfText = new TextDecoder('latin1').decode(await blob.arrayBuffer());

    expect(pdfText).toContain('STARS WITHOUT NUMBER');
    expect(pdfText).toContain('Spacer');
    expect(pdfText).toContain(character.background.name);
  });

  it('renders on a single landscape page', async () => {
    const character = generate(new RNG.RNG('swn-pdf-single-page'));
    const blob = await buildSwnCharacterPdf(character);
    const pdfText = new TextDecoder('latin1').decode(await blob.arrayBuffer());

    expect(pdfText).toMatch(/\/Count 1/);
  });
});

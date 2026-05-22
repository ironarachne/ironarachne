import { describe, expect, it } from 'vitest';
import { buildTextPdf } from './render_text_pdf';

describe('buildTextPdf', () => {
  it('returns an application/pdf blob', async () => {
    const blob = await buildTextPdf('Sample Title', 'Line one\nLine two');
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('starts with the PDF magic header', async () => {
    const blob = await buildTextPdf('Sample Title', 'Line one');
    const buffer = await blob.arrayBuffer();
    const header = new TextDecoder().decode(new Uint8Array(buffer).slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('embeds title and body text in the generated pdf', async () => {
    const blob = await buildTextPdf('Sample Title', 'Unique body phrase');
    const pdfText = new TextDecoder('latin1').decode(await blob.arrayBuffer());

    expect(pdfText).toContain('Sample Title');
    expect(pdfText).toContain('Unique body phrase');
  });
});

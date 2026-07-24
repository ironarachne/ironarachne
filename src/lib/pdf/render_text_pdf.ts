import Download from '$lib/download';

const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const MARGIN = 15;
const LINE_HEIGHT = 5;
const BODY_FONT_SIZE = 10;
const TITLE_FONT_SIZE = 14;

type PdfDoc = import('jspdf').jsPDF;

function writeBodyLines(doc: PdfDoc, lines: string[], startY: number): void {
  doc.setFontSize(BODY_FONT_SIZE);
  doc.setFont('helvetica', 'normal');

  let y = startY;
  for (const line of lines) {
    if (y > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }

    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  }
}

export async function buildTextPdf(title: string, body: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  doc.setFontSize(TITLE_FONT_SIZE);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PAGE_WIDTH / 2, MARGIN, { align: 'center' });

  const lines = doc.splitTextToSize(body, PAGE_WIDTH - MARGIN * 2);
  writeBodyLines(doc, lines, MARGIN + 10);

  return doc.output('blob');
}

export async function downloadTextPdf(
  title: string,
  body: string,
  filename: string,
): Promise<void> {
  const blob = await buildTextPdf(title, body);
  const url = URL.createObjectURL(blob);
  Download(url, filename);
  URL.revokeObjectURL(url);
}

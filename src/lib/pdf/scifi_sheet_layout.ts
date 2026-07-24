type PdfDoc = import('jspdf').jsPDF;

export type SciFiSheetTheme = {
  headerFill: [number, number, number];
  accent: [number, number, number];
  accentSoft: [number, number, number];
  panelBorder: [number, number, number];
  label: [number, number, number];
  body: [number, number, number];
  headerText: [number, number, number];
  headerSubtext: [number, number, number];
};

export type SciFiSheetPage = {
  width: number;
  height: number;
  margin: number;
  contentWidth: number;
  contentHeight: number;
  contentTop: number;
};

export type SciFiSheetColumn = {
  x: number;
  width: number;
  y: number;
  bottom: number;
};

export type SciFiStatBox = {
  label: string;
  value: string;
};

export const DEFAULT_SCIFI_THEME: SciFiSheetTheme = {
  headerFill: [15, 23, 42],
  accent: [34, 211, 238],
  accentSoft: [56, 189, 248],
  panelBorder: [71, 85, 105],
  label: [100, 116, 139],
  body: [30, 41, 59],
  headerText: [248, 250, 252],
  headerSubtext: [186, 230, 253],
};

export const LANDSCAPE_LETTER = {
  width: 279.4,
  height: 215.9,
};

export function createSciFiSheetPage(margin = 8): SciFiSheetPage {
  return {
    width: LANDSCAPE_LETTER.width,
    height: LANDSCAPE_LETTER.height,
    margin,
    contentWidth: LANDSCAPE_LETTER.width - margin * 2,
    contentHeight: LANDSCAPE_LETTER.height - margin * 2,
    contentTop: margin,
  };
}

export function createSciFiSheetColumns(
  page: SciFiSheetPage,
  count: number,
  gap: number,
  top: number,
): SciFiSheetColumn[] {
  const totalGap = gap * (count - 1);
  const columnWidth = (page.contentWidth - totalGap) / count;
  const bottom = page.margin + page.contentHeight;

  return Array.from({ length: count }, (_, index) => ({
    x: page.margin + index * (columnWidth + gap),
    width: columnWidth,
    y: top,
    bottom,
  }));
}

function setFill(doc: PdfDoc, color: [number, number, number]): void {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDraw(doc: PdfDoc, color: [number, number, number]): void {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function setText(doc: PdfDoc, color: [number, number, number]): void {
  doc.setTextColor(color[0], color[1], color[2]);
}

export function drawSciFiFrame(
  doc: PdfDoc,
  page: SciFiSheetPage,
  theme: SciFiSheetTheme = DEFAULT_SCIFI_THEME,
): void {
  setDraw(doc, theme.panelBorder);
  doc.setLineWidth(0.3);
  doc.rect(page.margin, page.margin, page.contentWidth, page.contentHeight);

  const corner = 4;
  setDraw(doc, theme.accent);
  doc.setLineWidth(0.6);

  doc.line(page.margin, page.margin, page.margin + corner, page.margin);
  doc.line(page.margin, page.margin, page.margin, page.margin + corner);

  const right = page.margin + page.contentWidth;
  const bottom = page.margin + page.contentHeight;
  doc.line(right - corner, page.margin, right, page.margin);
  doc.line(right, page.margin, right, page.margin + corner);
  doc.line(page.margin, bottom - corner, page.margin, bottom);
  doc.line(page.margin, bottom, page.margin + corner, bottom);
  doc.line(right - corner, bottom, right, bottom);
  doc.line(right, bottom - corner, right, bottom);
}

export function drawSciFiHeader(
  doc: PdfDoc,
  page: SciFiSheetPage,
  title: string,
  subtitle: string,
  theme: SciFiSheetTheme = DEFAULT_SCIFI_THEME,
): number {
  const headerHeight = 16;
  const x = page.margin;
  const y = page.margin;

  setFill(doc, theme.headerFill);
  doc.rect(x, y, page.contentWidth, headerHeight, 'F');

  setDraw(doc, theme.accent);
  doc.setLineWidth(0.5);
  doc.line(x, y + headerHeight, x + page.contentWidth, y + headerHeight);

  setText(doc, theme.headerText);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text(title.toUpperCase(), x + 4, y + 7);

  setText(doc, theme.headerSubtext);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(subtitle, x + 4, y + 12.5);

  setText(doc, theme.accent);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.text('IRON ARACHNE // RECORD', x + page.contentWidth - 4, y + 7, { align: 'right' });

  return y + headerHeight + 3;
}

export function drawSciFiMetricStrip(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  metrics: SciFiStatBox[],
  theme: SciFiSheetTheme = DEFAULT_SCIFI_THEME,
): number {
  const height = 11;
  const metricWidth = width / metrics.length;

  setDraw(doc, theme.panelBorder);
  doc.setLineWidth(0.2);
  doc.rect(x, y, width, height);

  for (let index = 0; index < metrics.length; index += 1) {
    const metric = metrics[index];
    const metricX = x + index * metricWidth;

    if (index > 0) {
      setDraw(doc, theme.panelBorder);
      doc.line(metricX, y, metricX, y + height);
    }

    setText(doc, theme.label);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.5);
    doc.text(metric.label.toUpperCase(), metricX + 2, y + 4);

    setText(doc, theme.body);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(metric.value, metricX + 2, y + 9);
  }

  return height + 2;
}

export function drawSciFiStatRow(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  stats: SciFiStatBox[],
  theme: SciFiSheetTheme = DEFAULT_SCIFI_THEME,
): number {
  const gap = 2;
  const totalGap = gap * (stats.length - 1);
  const boxWidth = (width - totalGap) / stats.length;
  const boxHeight = 12;

  for (let index = 0; index < stats.length; index += 1) {
    const stat = stats[index];
    const boxX = x + index * (boxWidth + gap);

    setDraw(doc, theme.accentSoft);
    doc.setLineWidth(0.25);
    doc.rect(boxX, y, boxWidth, boxHeight);

    setText(doc, theme.label);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.5);
    doc.text(stat.label.toUpperCase(), boxX + boxWidth / 2, y + 4, { align: 'center' });

    setText(doc, theme.body);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(stat.value, boxX + boxWidth / 2, y + 9.5, { align: 'center' });
  }

  return boxHeight + 3;
}

export function drawSciFiSectionTitle(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  title: string,
  theme: SciFiSheetTheme = DEFAULT_SCIFI_THEME,
): number {
  setText(doc, theme.accent);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.5);
  doc.text(`// ${title.toUpperCase()}`, x, y);

  setDraw(doc, theme.accentSoft);
  doc.setLineWidth(0.2);
  doc.line(x, y + 1.5, x + width, y + 1.5);

  return 4;
}

function measureWrappedLines(doc: PdfDoc, text: string, width: number, fontSize: number): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, width);
}

export function drawSciFiWrappedText(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  text: string,
  options: {
    fontSize?: number;
    lineHeight?: number;
    theme?: SciFiSheetTheme;
    maxLines?: number;
  } = {},
): number {
  const fontSize = options.fontSize ?? 7;
  const lineHeight = options.lineHeight ?? 3.2;
  const theme = options.theme ?? DEFAULT_SCIFI_THEME;
  let lines = measureWrappedLines(doc, text, width, fontSize);

  if (options.maxLines !== undefined && lines.length > options.maxLines) {
    lines = lines.slice(0, options.maxLines);
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex].replace(/\s+$/, '')} ...`;
  }

  setText(doc, theme.body);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.text(lines, x, y);

  return lines.length * lineHeight;
}

export function drawSciFiBulletList(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  items: string[],
  options: {
    fontSize?: number;
    lineHeight?: number;
    theme?: SciFiSheetTheme;
  } = {},
): number {
  const fontSize = options.fontSize ?? 7;
  const lineHeight = options.lineHeight ?? 3.2;
  const theme = options.theme ?? DEFAULT_SCIFI_THEME;
  let usedHeight = 0;

  setText(doc, theme.body);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);

  for (const item of items) {
    const lines = measureWrappedLines(doc, item, width - 3, fontSize);
    doc.text('>', x, y + usedHeight + lineHeight);
    doc.text(lines, x + 3, y + usedHeight + lineHeight);
    usedHeight += lines.length * lineHeight + 0.8;
  }

  return usedHeight;
}

export function drawSciFiColumnSection(
  doc: PdfDoc,
  column: SciFiSheetColumn,
  title: string,
  bodyHeight: number,
  renderBody: (x: number, y: number, width: number) => void,
  theme: SciFiSheetTheme = DEFAULT_SCIFI_THEME,
): number {
  const titleHeight = drawSciFiSectionTitle(doc, column.x, column.y, column.width, title, theme);
  const bodyY = column.y + titleHeight;
  const panelHeight = titleHeight + bodyHeight + 1;

  setDraw(doc, theme.panelBorder);
  doc.setLineWidth(0.15);
  doc.rect(column.x, column.y - 3, column.width, panelHeight);

  renderBody(column.x + 2, bodyY, column.width - 4);

  column.y += panelHeight + 2;
  return panelHeight + 2;
}

export function remainingColumnHeight(column: SciFiSheetColumn): number {
  return column.bottom - column.y;
}

export async function buildLandscapeSciFiPdf(
  renderSheet: (doc: PdfDoc, page: SciFiSheetPage, theme: SciFiSheetTheme) => void,
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  const page = createSciFiSheetPage();
  const theme = DEFAULT_SCIFI_THEME;

  drawSciFiFrame(doc, page, theme);
  renderSheet(doc, page, theme);

  return doc.output('blob');
}

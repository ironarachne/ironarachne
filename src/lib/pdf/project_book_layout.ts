import type { ArtifactAssetRead } from '$lib/artifacts';
import type { ProjectPublication, PublicationBlock, PublicationEntry } from './project_publication';

type PdfDoc = import('jspdf').jsPDF;
type Cursor = { page: number; y: number };

const PAGE_W = 215.9;
const PAGE_H = 279.4;
const LEFT = 23;
const RIGHT = 18;
const TOP = 27;
const BOTTOM = 23;
const WIDTH = PAGE_W - LEFT - RIGHT;
const INK = '#1b1e24';
const MUTED = '#3c4350';
const RULE = '#5c5031';
const GOLD = '#c8a46e';

export type ProjectPdfLayoutResult = {
  blob: Blob;
  warnings: string[];
  incompleteEntries: string[];
};

async function loadPrintFonts(doc: PdfDoc): Promise<void> {
  // Vite emits URLs rather than bundling the TTF bytes into the project page. The files are
  // fetched only when a user asks for a book; the site remains fully local and static.
  if (typeof window === 'undefined') return;
  const sources = [
    {
      url: (await import('./fonts/CrimsonText-Regular.ttf?url')).default,
      file: 'CrimsonText-Regular.ttf',
      style: 'normal',
    },
    {
      url: (await import('./fonts/CrimsonText-Bold.ttf?url')).default,
      file: 'CrimsonText-Bold.ttf',
      style: 'bold',
    },
    {
      url: (await import('./fonts/CrimsonText-Italic.ttf?url')).default,
      file: 'CrimsonText-Italic.ttf',
      style: 'italic',
    },
  ] as const;
  for (const source of sources) {
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`Could not load PDF font ${source.file}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    doc.addFileToVFS(source.file, btoa(binary));
    doc.addFont(source.file, 'crimson', source.style);
  }
}

function setText(
  doc: PdfDoc,
  size: number,
  face: 'times' | 'helvetica' = 'times',
  style = 'normal',
  color = INK,
): void {
  doc.setFont(face === 'times' && doc.getFontList().crimson ? 'crimson' : face, style);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

function setStroke(doc: PdfDoc, color = RULE): void {
  doc.setDrawColor(color);
}

function newPage(doc: PdfDoc, cursor: Cursor, entry: PublicationEntry): void {
  doc.addPage();
  cursor.page = doc.getNumberOfPages();
  cursor.y = TOP;
  drawRunningHead(doc, entry.title);
}

function ensureRoom(doc: PdfDoc, cursor: Cursor, height: number, entry: PublicationEntry): void {
  if (cursor.y + height > PAGE_H - BOTTOM) newPage(doc, cursor, entry);
}

function drawRunningHead(doc: PdfDoc, title: string): void {
  setText(doc, 8, 'helvetica', 'normal', MUTED);
  doc.text(doc.splitTextToSize(title, WIDTH)[0], LEFT, 16);
  setStroke(doc, GOLD);
  doc.setLineWidth(0.25);
  doc.line(LEFT, 19, PAGE_W - RIGHT, 19);
}

function drawFolio(doc: PdfDoc, page: number, projectTitle: string): void {
  setStroke(doc, GOLD);
  doc.setLineWidth(0.25);
  doc.line(LEFT, PAGE_H - 17, PAGE_W - RIGHT, PAGE_H - 17);
  setText(doc, 8, 'helvetica', 'normal', MUTED);
  doc.text((doc.splitTextToSize(projectTitle, WIDTH - 15) as string[])[0], LEFT, PAGE_H - 12);
  doc.text(String(page), PAGE_W - RIGHT, PAGE_H - 12, { align: 'right' });
}

function drawLines(
  doc: PdfDoc,
  text: string,
  cursor: Cursor,
  entry: PublicationEntry,
  options: {
    size?: number;
    leading?: number;
    indent?: number;
    color?: string;
    style?: string;
  } = {},
): void {
  const size = options.size ?? 10.5;
  const leading = options.leading ?? 5.1;
  const indent = options.indent ?? 0;
  const width = WIDTH - indent;
  setText(doc, size, 'times', options.style ?? 'normal', options.color ?? INK);
  const lines = doc.splitTextToSize(text, width) as string[];
  // The first two lines belong together where possible.
  ensureRoom(doc, cursor, Math.min(lines.length, 2) * leading, entry);
  for (const [index, line] of lines.entries()) {
    if (lines.length - index === 2 && cursor.y + leading * 2 > PAGE_H - BOTTOM) {
      newPage(doc, cursor, entry);
    }
    ensureRoom(doc, cursor, leading, entry);
    setText(doc, size, 'times', options.style ?? 'normal', options.color ?? INK);
    doc.text(line, LEFT + indent, cursor.y);
    cursor.y += leading;
  }
}

function drawHeading(
  doc: PdfDoc,
  text: string,
  level: number,
  cursor: Cursor,
  entry: PublicationEntry,
): void {
  const size = level <= 2 ? 15 : 12;
  const before = level <= 2 ? 8 : 6;
  setText(doc, size, 'helvetica', 'bold');
  const lines = doc.splitTextToSize(text, WIDTH) as string[];
  const leading = size <= 12 ? 5.7 : 7;
  ensureRoom(doc, cursor, before + lines.length * leading + 10, entry);
  cursor.y += before;
  for (const line of lines) {
    ensureRoom(doc, cursor, leading, entry);
    setText(doc, size, 'helvetica', 'bold');
    doc.text(line, LEFT, cursor.y);
    cursor.y += leading;
  }
  setStroke(doc, GOLD);
  doc.setLineWidth(0.35);
  doc.line(LEFT, cursor.y + 0.5, Math.min(PAGE_W - RIGHT, LEFT + 38), cursor.y + 0.5);
  cursor.y += 5;
}

function drawFacts(
  doc: PdfDoc,
  facts: { label: string; value: string }[],
  cursor: Cursor,
  entry: PublicationEntry,
): void {
  const colWidth = (WIDTH - 5) / 2;
  for (let index = 0; index < facts.length; index += 2) {
    const row = facts.slice(index, index + 2);
    const lineCounts = row.map(({ value }) => {
      setText(doc, 10);
      return (doc.splitTextToSize(value, colWidth - 5) as string[]).length;
    });
    const height = 7 + Math.max(...lineCounts) * 4.8;
    if (height > PAGE_H - TOP - BOTTOM) {
      for (const { label, value } of row) {
        drawHeading(doc, label, 3, cursor, entry);
        drawLines(doc, value, cursor, entry);
      }
      continue;
    }
    ensureRoom(doc, cursor, height, entry);
    row.forEach(({ label, value }, column) => {
      const x = LEFT + column * (colWidth + 5);
      setText(doc, 7.5, 'helvetica', 'bold', MUTED);
      doc.text(label.toUpperCase(), x, cursor.y);
      setText(doc, 10);
      const lines = doc.splitTextToSize(value, colWidth - 5) as string[];
      lines.forEach((line, lineIndex) => doc.text(line, x, cursor.y + 5 + lineIndex * 4.8));
    });
    cursor.y += height;
  }
  cursor.y += 2;
}

function drawTable(
  doc: PdfDoc,
  columns: string[],
  rows: string[][],
  cursor: Cursor,
  entry: PublicationEntry,
): void {
  if (columns.length === 0) return;
  const cellWidth = WIDTH / columns.length;
  const drawHeader = () => {
    ensureRoom(doc, cursor, 11, entry);
    setStroke(doc);
    doc.setLineWidth(0.25);
    doc.line(LEFT, cursor.y - 3, PAGE_W - RIGHT, cursor.y - 3);
    columns.forEach((label, index) => {
      setText(doc, 8, 'helvetica', 'bold', MUTED);
      doc.text(
        (doc.splitTextToSize(label, cellWidth - 4) as string[])[0] ?? '',
        LEFT + index * cellWidth + 2,
        cursor.y,
      );
    });
    cursor.y += 6;
    doc.line(LEFT, cursor.y - 3, PAGE_W - RIGHT, cursor.y - 3);
  };
  drawHeader();
  for (const row of rows) {
    setText(doc, 9);
    const cells = columns.map(
      (_, index) => doc.splitTextToSize(row[index] ?? '', cellWidth - 4) as string[],
    );
    let offset = 0;
    const maxLines = Math.max(1, ...cells.map((cell) => cell.length));
    while (offset < maxLines) {
      if (cursor.y + 8 > PAGE_H - BOTTOM) {
        newPage(doc, cursor, entry);
        drawHeader();
      }
      const availableLines = Math.max(1, Math.floor((PAGE_H - BOTTOM - cursor.y - 3) / 4.4));
      const count = Math.min(maxLines - offset, availableLines);
      cells.forEach((lines, index) => {
        setText(doc, 9);
        lines
          .slice(offset, offset + count)
          .forEach((line, lineIndex) =>
            doc.text(line, LEFT + index * cellWidth + 2, cursor.y + lineIndex * 4.4),
          );
      });
      cursor.y += Math.max(8, count * 4.4 + 3);
      offset += count;
      if (offset < maxLines) {
        newPage(doc, cursor, entry);
        drawHeader();
      }
    }
    setStroke(doc, '#d8d8d8');
    doc.line(LEFT, cursor.y - 3, PAGE_W - RIGHT, cursor.y - 3);
  }
  cursor.y += 4;
}

async function assetDataUrl(asset: ArtifactAssetRead): Promise<string> {
  const bytes = new Uint8Array(await asset.blob.arrayBuffer());
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${asset.blob.type};base64,${btoa(binary)}`;
}

async function assetDimensions(doc: PdfDoc, asset: ArtifactAssetRead): Promise<[number, number]> {
  const { width, height } = asset.metadata;
  if (width && height && width > 0 && height > 0) return [width, height];
  if (asset.blob.type === 'image/svg+xml') {
    const svg = await asset.blob.text();
    const viewBox = /viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/i.exec(svg);
    if (viewBox) return [Number(viewBox[1]), Number(viewBox[2])];
    const svgWidth = /\bwidth\s*=\s*["']([\d.]+)/i.exec(svg);
    const svgHeight = /\bheight\s*=\s*["']([\d.]+)/i.exec(svg);
    if (svgWidth && svgHeight) return [Number(svgWidth[1]), Number(svgHeight[1])];
  } else {
    const dimensions = doc.getImageProperties(await assetDataUrl(asset));
    return [dimensions.width, dimensions.height];
  }
  throw new Error('Saved image has no usable dimensions');
}

async function addAssetImage(
  doc: PdfDoc,
  asset: ArtifactAssetRead,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<void> {
  if (asset.blob.type === 'image/svg+xml') {
    if (typeof document === 'undefined') throw new Error('SVG rendering requires a browser');
    const [sourceW, sourceH] = await assetDimensions(doc, asset);
    const scale = Math.min(1, 1600 / Math.max(sourceW, sourceH));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceW * scale));
    canvas.height = Math.max(1, Math.round(sourceH * scale));
    const image = new Image();
    const url = URL.createObjectURL(asset.blob);
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Saved SVG could not be decoded'));
        image.src = url;
      });
      const context = canvas.getContext('2d');
      if (context === null) throw new Error('Canvas is unavailable');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, width, height, undefined, 'FAST');
    } finally {
      URL.revokeObjectURL(url);
    }
  } else {
    const format = asset.blob.type === 'image/png' ? 'PNG' : 'JPEG';
    doc.addImage(await assetDataUrl(asset), format, x, y, width, height, undefined, 'FAST');
  }
}

async function drawImage(
  doc: PdfDoc,
  asset: ArtifactAssetRead,
  caption: string | undefined,
  cursor: Cursor,
  entry: PublicationEntry,
  warnings: string[],
): Promise<void> {
  try {
    const [sourceW, sourceH] = await assetDimensions(doc, asset);
    const scale = Math.min(WIDTH / sourceW, 150 / sourceH);
    const width = sourceW * scale;
    const height = sourceH * scale;
    ensureRoom(doc, cursor, height + 12, entry);
    const x = LEFT + (WIDTH - width) / 2;
    await addAssetImage(doc, asset, x, cursor.y, width, height);
    cursor.y += height + 3;
    if (caption) drawLines(doc, caption, cursor, entry, { size: 8.5, leading: 4.2, color: MUTED });
    cursor.y += 7;
  } catch {
    const message = `A saved image for “${entry.title}” could not be included.`;
    warnings.push(message);
    entry.warnings.push(message);
    entry.status = 'incomplete';
    drawNotice(doc, message, cursor, entry);
  }
}

function drawNotice(doc: PdfDoc, text: string, cursor: Cursor, entry: PublicationEntry): void {
  ensureRoom(doc, cursor, 20, entry);
  setStroke(doc, GOLD);
  doc.setLineWidth(0.4);
  doc.line(LEFT, cursor.y - 3, LEFT, cursor.y + 11);
  drawLines(doc, text, cursor, entry, { size: 9.5, indent: 5, color: MUTED });
  cursor.y += 4;
}

async function drawBlock(
  doc: PdfDoc,
  block: PublicationBlock,
  cursor: Cursor,
  entry: PublicationEntry,
  warnings: string[],
): Promise<void> {
  switch (block.type) {
    case 'heading':
      drawHeading(doc, block.text, block.level, cursor, entry);
      break;
    case 'paragraph':
      drawLines(doc, block.text, cursor, entry);
      cursor.y += 4;
      break;
    case 'quote':
      ensureRoom(doc, cursor, 18, entry);
      setStroke(doc, GOLD);
      doc.setLineWidth(0.4);
      doc.line(LEFT, cursor.y - 3, LEFT, cursor.y + 11);
      drawLines(doc, block.text, cursor, entry, { indent: 5, style: 'italic' });
      cursor.y += 6;
      break;
    case 'list':
      for (const [index, item] of block.items.entries()) {
        drawLines(doc, `${block.ordered ? `${index + 1}.` : '•'}  ${item}`, cursor, entry, {
          indent: 4,
        });
        cursor.y += 1;
      }
      cursor.y += 3;
      break;
    case 'facts':
      drawFacts(doc, block.facts, cursor, entry);
      break;
    case 'table':
      drawTable(doc, block.columns, block.rows, cursor, entry);
      break;
    case 'image':
      await drawImage(doc, block.asset, block.caption, cursor, entry, warnings);
      break;
    case 'notice':
      drawNotice(doc, block.text, cursor, entry);
      break;
  }
}

async function drawCover(doc: PdfDoc, publication: ProjectPublication): Promise<boolean> {
  setStroke(doc, GOLD);
  doc.setLineWidth(0.65);
  doc.rect(20, 22, PAGE_W - 40, PAGE_H - 44);
  doc.setLineWidth(0.2);
  doc.rect(23, 25, PAGE_W - 46, PAGE_H - 50);
  setText(doc, 9, 'helvetica', 'bold', RULE);
  doc.text('IRON ARACHNE  /  PROJECT BOOK', PAGE_W / 2, 43, { align: 'center' });
  setStroke(doc, GOLD);
  doc.line(70, 49, PAGE_W - 70, 49);
  setText(doc, 31, 'times', 'bold');
  const title = doc.splitTextToSize(publication.title, PAGE_W - 66) as string[];
  title.forEach((line, index) => doc.text(line, PAGE_W / 2, 87 + index * 13, { align: 'center' }));
  let y = 104 + Math.max(0, title.length - 1) * 13;
  let descriptionContinues = false;
  if (publication.description) {
    setText(doc, 11, 'times', 'italic', MUTED);
    const lines = doc.splitTextToSize(publication.description, PAGE_W - 80) as string[];
    descriptionContinues = lines.length > 7;
    for (const line of descriptionContinues ? lines.slice(0, 6) : lines) {
      doc.text(line, PAGE_W / 2, y, { align: 'center' });
      y += 6;
    }
    if (descriptionContinues) {
      doc.text('Continued after contents', PAGE_W / 2, y, { align: 'center' });
      y += 6;
    }
  }
  const coverImage = publication.entries
    .flatMap((entry) => entry.blocks)
    .find(
      (block): block is Extract<PublicationBlock, { type: 'image' }> =>
        block.type === 'image' && block.asset.metadata.role === 'primary-preview',
    );
  if (coverImage && y < 190) {
    try {
      const [sourceW, sourceH] = await assetDimensions(doc, coverImage.asset);
      const scale = Math.min(110 / sourceW, Math.max(0, Math.min(50, 190 - y)) / sourceH);
      const width = sourceW * scale;
      const height = sourceH * scale;
      await addAssetImage(doc, coverImage.asset, (PAGE_W - width) / 2, y + 9, width, height);
      y += height + 14;
    } catch {
      // The artifact page renders a named warning if the saved image cannot be read.
    }
  }
  y = Math.max(y + 9, 216);
  if (publication.setting.length > 0) {
    setText(doc, 9, 'helvetica', 'normal', MUTED);
    publication.setting.forEach((line) => {
      doc.text(line, PAGE_W / 2, y, { align: 'center' });
      y += 6;
    });
  }
  setText(doc, 8, 'helvetica', 'normal', MUTED);
  doc.text('A collection of saved work', PAGE_W / 2, PAGE_H - 42, { align: 'center' });
  return descriptionContinues;
}

function planContents(doc: PdfDoc, entries: PublicationEntry[]): number[][] {
  const pages: number[][] = [[]];
  let y = 56;
  for (const [index, entry] of entries.entries()) {
    setText(doc, 10.5);
    const lines = doc.splitTextToSize(entry.title, WIDTH - 23) as string[];
    const height = lines.length * 4.5 + 7;
    if (y + height > PAGE_H - BOTTOM && pages.at(-1)!.length > 0) {
      pages.push([]);
      y = 56;
    }
    pages.at(-1)!.push(index);
    y += height;
  }
  return pages;
}

function drawContents(
  doc: PdfDoc,
  publication: ProjectPublication,
  starts: number[],
  groups: number[][],
): void {
  for (let toc = 0; toc < groups.length; toc += 1) {
    doc.setPage(toc + 2);
    setText(doc, 23, 'times', 'bold');
    doc.text(toc === 0 ? 'Contents' : 'Contents (continued)', LEFT, 39);
    setStroke(doc, GOLD);
    doc.setLineWidth(0.5);
    doc.line(LEFT, 44, PAGE_W - RIGHT, 44);
    let y = 56;
    for (const index of groups[toc]) {
      const entry = publication.entries[index];
      setText(doc, 10.5, 'times', 'normal');
      const labels = doc.splitTextToSize(entry.title, WIDTH - 23) as string[];
      for (const label of labels) {
        doc.text(label, LEFT, y);
        y += 4.5;
      }
      setText(doc, 9, 'helvetica', 'normal', MUTED);
      doc.text(String(starts[index]), PAGE_W - RIGHT, y - labels.length * 4.5, {
        align: 'right',
      });
      doc.text(entry.kindLabel + (entry.status === 'incomplete' ? ' · incomplete' : ''), LEFT, y);
      y += 7;
    }
    drawFolio(doc, toc + 2, publication.title);
  }
}

export async function renderProjectBook(
  publication: ProjectPublication,
): Promise<ProjectPdfLayoutResult> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  await loadPrintFonts(doc);
  doc.setProperties({
    title: publication.title,
    subject: 'Iron Arachne project book',
    creator: 'Iron Arachne',
  });
  const descriptionContinues = await drawCover(doc, publication);
  const tocGroups = planContents(doc, publication.entries);
  const tocPages = tocGroups.length;
  for (let index = 0; index < tocPages; index += 1) doc.addPage();
  const starts: number[] = [];
  const warnings: string[] = publication.entries.flatMap((entry) => entry.warnings);
  if (descriptionContinues && publication.description) {
    doc.addPage();
    const entry: PublicationEntry = {
      sourceId: 'project',
      title: 'About this project',
      kindLabel: 'Project',
      status: 'ready',
      blocks: [],
      warnings: [],
    };
    const cursor: Cursor = { page: doc.getNumberOfPages(), y: 42 };
    drawRunningHead(doc, entry.title);
    setText(doc, 22, 'times', 'bold');
    doc.text(entry.title, LEFT, cursor.y);
    cursor.y += 15;
    drawLines(doc, publication.description, cursor, entry);
  }
  if (publication.entries.length === 0) {
    doc.addPage();
    setText(doc, 20, 'times', 'bold');
    doc.text('No saved work yet', LEFT, 42);
    setText(doc, 11);
    doc.text('Save artifacts to this project to build its book.', LEFT, 54);
  }
  for (const entry of publication.entries) {
    doc.addPage();
    const cursor: Cursor = { page: doc.getNumberOfPages(), y: TOP };
    starts.push(cursor.page);
    drawRunningHead(doc, entry.title);
    cursor.y += 13;
    setText(doc, 8, 'helvetica', 'bold', RULE);
    doc.text(entry.kindLabel.toUpperCase(), LEFT, cursor.y);
    cursor.y += 11;
    setText(doc, 22, 'times', 'bold');
    const titleLines = doc.splitTextToSize(entry.title, WIDTH) as string[];
    for (const line of titleLines) {
      doc.text(line, LEFT, cursor.y);
      cursor.y += 10;
    }
    setStroke(doc, GOLD);
    doc.setLineWidth(0.45);
    doc.line(LEFT, cursor.y + 1, PAGE_W - RIGHT, cursor.y + 1);
    cursor.y += 12;
    for (const block of entry.blocks) await drawBlock(doc, block, cursor, entry, warnings);
  }
  drawContents(doc, publication, starts, tocGroups);
  // Covers and contents are already styled. Folios for body pages are added only after all
  // continuation pages have been created, so no continuation is left without a number.
  for (let page = tocPages + 2; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    drawFolio(doc, page, publication.title);
  }
  return {
    blob: doc.output('blob'),
    warnings,
    incompleteEntries: publication.entries
      .filter((entry) => entry.status === 'incomplete')
      .map((entry) => entry.title),
  };
}

import { formatCharacterDisplayName } from '$lib/characters/character_name_generation';
import Download from '$lib/download';
import {
  buildLandscapeSciFiPdf,
  createSciFiSheetColumns,
  drawSciFiBulletList,
  drawSciFiColumnSection,
  drawSciFiHeader,
  drawSciFiStatRow,
  drawSciFiWrappedText,
  remainingColumnHeight,
  type SciFiSheetPage,
  type SciFiSheetTheme,
  type SciFiStatBox,
} from '$lib/pdf/scifi_sheet_layout';
import type { UWCharacter } from './character';

const DEFAULT_FILENAME = 'uw-character.pdf';

type PdfDoc = import('jspdf').jsPDF;

function formatUwStat(value: number): string {
  if (value > -1) {
    return `+${value}`;
  }

  return `${value}`;
}

function formatUwHeaderTitle(character: UWCharacter): string {
  return formatCharacterDisplayName(character.firstName, character.lastName) || 'Uncharted Worlds';
}

function formatUwSubtitle(character: UWCharacter): string {
  const careers = character.careers.map((career) => career.name).join(' / ');
  return `${careers} // ${character.origin.name}`;
}

function formatUwStatBoxes(character: UWCharacter): SciFiStatBox[] {
  return [
    { label: 'Physique', value: formatUwStat(character.stats.physique) },
    { label: 'Mettle', value: formatUwStat(character.stats.mettle) },
    { label: 'Expertise', value: formatUwStat(character.stats.expertise) },
    { label: 'Influence', value: formatUwStat(character.stats.influence) },
    { label: 'Interface', value: formatUwStat(character.stats.interface) },
  ];
}

function formatUwCareerLines(character: UWCharacter): string[] {
  return character.careers.map((career) => career.name);
}

function formatUwAssetLines(character: UWCharacter): string[] {
  if (character.assets.length === 0) {
    return ['None'];
  }

  const lines: string[] = [];
  for (const asset of character.assets) {
    lines.push(`${asset.name}: ${asset.description}`);
    for (const upgrade of asset.upgrades) {
      lines.push(`  ${upgrade.name}: ${upgrade.description}`);
    }
  }

  return lines;
}

function estimateBulletListHeight(itemCount: number, linesPerItem = 1.5): number {
  return itemCount * linesPerItem * 3.2 + 1;
}

function estimateWrappedHeight(lineCount: number): number {
  return lineCount * 3.2 + 1;
}

function renderUwCharacterSheet(
  doc: PdfDoc,
  page: SciFiSheetPage,
  theme: SciFiSheetTheme,
  character: UWCharacter,
): void {
  const contentTop = drawSciFiHeader(
    doc,
    page,
    formatUwHeaderTitle(character),
    formatUwSubtitle(character),
    theme,
  );

  let y = contentTop;
  y += drawSciFiStatRow(
    doc,
    page.margin,
    y,
    page.contentWidth,
    formatUwStatBoxes(character),
    theme,
  );

  const columns = createSciFiSheetColumns(page, 3, 5, y + 1);
  const careerLines = formatUwCareerLines(character);

  drawSciFiColumnSection(
    doc,
    columns[0],
    'Careers',
    estimateBulletListHeight(careerLines.length, 1),
    (x, bodyY, width) => {
      drawSciFiBulletList(doc, x, bodyY, width, careerLines, { fontSize: 7, theme });
    },
    theme,
  );

  drawSciFiColumnSection(
    doc,
    columns[0],
    'Descriptors',
    estimateWrappedHeight(2),
    (x, bodyY, width) => {
      drawSciFiWrappedText(doc, x, bodyY, width, character.descriptors, {
        fontSize: 7,
        theme,
        maxLines: 4,
      });
    },
    theme,
  );

  const skillHeight = Math.min(
    remainingColumnHeight(columns[1]),
    estimateWrappedHeight(character.skills.length * 5),
  );
  drawSciFiColumnSection(
    doc,
    columns[1],
    'Skills',
    skillHeight,
    (x, bodyY, width) => {
      let offset = 0;
      for (const skill of character.skills) {
        offset += drawSciFiWrappedText(doc, x, bodyY + offset, width, `${skill.name}:`, {
          fontSize: 6.5,
          lineHeight: 3,
          theme,
          maxLines: 1,
        });
        offset += drawSciFiWrappedText(doc, x, bodyY + offset, width, skill.description, {
          fontSize: 6.5,
          lineHeight: 3,
          theme,
          maxLines: 6,
        });
        offset += 1.5;
      }
    },
    theme,
  );

  drawSciFiColumnSection(
    doc,
    columns[2],
    'Advancement',
    estimateWrappedHeight(2),
    (x, bodyY, width) => {
      drawSciFiWrappedText(doc, x, bodyY, width, character.advancement, {
        fontSize: 7,
        theme,
        maxLines: 4,
      });
    },
    theme,
  );

  drawSciFiColumnSection(
    doc,
    columns[2],
    'Workspace',
    estimateWrappedHeight(3),
    (x, bodyY, width) => {
      const offset = drawSciFiWrappedText(doc, x, bodyY, width, `${character.workspace.name}:`, {
        fontSize: 6.5,
        theme,
        maxLines: 1,
      });
      drawSciFiWrappedText(doc, x, bodyY + offset, width, character.workspace.description, {
        fontSize: 6.5,
        theme,
        maxLines: 5,
      });
    },
    theme,
  );

  const assetLines = formatUwAssetLines(character);
  drawSciFiColumnSection(
    doc,
    columns[2],
    'Assets',
    estimateBulletListHeight(assetLines.length, 2),
    (x, bodyY, width) => {
      drawSciFiBulletList(doc, x, bodyY, width, assetLines, { fontSize: 6.5, theme });
    },
    theme,
  );
}

export async function buildUwCharacterPdf(character: UWCharacter): Promise<Blob> {
  return buildLandscapeSciFiPdf((doc, page, theme) => {
    renderUwCharacterSheet(doc, page, theme, character);
  });
}

export async function downloadUwCharacterPdf(character: UWCharacter): Promise<void> {
  const blob = await buildUwCharacterPdf(character);
  const url = URL.createObjectURL(blob);
  Download(url, DEFAULT_FILENAME);
  URL.revokeObjectURL(url);
}

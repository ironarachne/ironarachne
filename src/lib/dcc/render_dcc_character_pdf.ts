import Download from '$lib/download';
import type { DCCAttribute, DCCCharacter } from './dcc_types';
import {
  formatDccCharacterNotes,
  formatDccLuckySign,
  formatDccModifier,
  formatDccStartingFunds,
  formatDccWeaponLine,
  slugifyDccCharacterFilename,
} from './dcc_format';

const PAGE_WIDTH = 215.9;
const MARGIN = 10;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const ROW_HEIGHT = 14;
const MIN_SECTION_HEIGHT = 14;

type PdfDoc = import('jspdf').jsPDF;

function drawAbilityBox(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  attribute: DCCAttribute,
): void {
  doc.rect(x, y, width, height);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x + width / 2, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${attribute.value}`, x + width / 2, y + 12, { align: 'center' });
  doc.setFontSize(9);
  doc.text(formatDccModifier(attribute.modifier), x + width / 2, y + 18, { align: 'center' });
}

function drawCompactField(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
): void {
  doc.rect(x, y, width, height);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(value, x + 2, y + 10);
}

function drawAlignmentMarkers(doc: PdfDoc, x: number, y: number, alignment: string): void {
  const markers = [
    { label: 'L', match: 'Law' },
    { label: 'N', match: 'Neutrality' },
    { label: 'C', match: 'Chaos' },
  ];

  let markerX = x;
  for (const marker of markers) {
    doc.rect(markerX, y, 6, 6);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(marker.label, markerX + 3, y + 4.5, { align: 'center' });

    if (alignment === marker.match) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', markerX + 3, y + 4.5, { align: 'center' });
    }

    markerX += 8;
  }
}

function measureSectionHeight(
  doc: PdfDoc,
  value: string,
  width: number,
  minHeight: number,
): number {
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(value, width - 4);
  return Math.max(minHeight, 8 + lines.length * 4);
}

function drawLabeledSection(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  minHeight = MIN_SECTION_HEIGHT,
): number {
  const height = measureSectionHeight(doc, value, width, minHeight);
  doc.rect(x, y, width, height);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(doc.splitTextToSize(value, width - 4), x + 2, y + 9);
  return height;
}

function formatWeaponsSection(character: DCCCharacter): string {
  if (character.weapons.length === 0) {
    return 'None';
  }

  return character.weapons
    .map((weapon) => formatDccWeaponLine(weapon, character.attackModifier))
    .join('; ');
}

function formatEquipmentSection(character: DCCCharacter): string {
  if (character.equipment.length === 0) {
    return 'None';
  }

  return character.equipment.map((item) => item.name).join(', ');
}

function formatLanguagesSection(character: DCCCharacter): string {
  if (character.languages.length === 0) {
    return 'None';
  }

  return character.languages.join(', ');
}

function renderCharacterSheet(doc: PdfDoc, character: DCCCharacter): void {
  let y = MARGIN;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ZERO LEVEL CHARACTER SHEET (DCC)', PAGE_WIDTH / 2, y + 5, { align: 'center' });
  y += 12;

  const nameWidth = CONTENT_WIDTH * 0.35;
  const occupationWidth = CONTENT_WIDTH * 0.35;
  const alignmentWidth = CONTENT_WIDTH * 0.3;

  drawCompactField(
    doc,
    MARGIN,
    y,
    nameWidth,
    ROW_HEIGHT,
    'Name',
    `${character.firstName} ${character.lastName}`,
  );
  drawCompactField(
    doc,
    MARGIN + nameWidth,
    y,
    occupationWidth,
    ROW_HEIGHT,
    'Occupation',
    character.occupation.name,
  );

  doc.rect(MARGIN + nameWidth + occupationWidth, y, alignmentWidth, ROW_HEIGHT);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Alignment', MARGIN + nameWidth + occupationWidth + 2, y + 4);
  drawAlignmentMarkers(doc, MARGIN + nameWidth + occupationWidth + 22, y + 6, character.alignment);

  y += ROW_HEIGHT;

  const abilityWidth = CONTENT_WIDTH / 6;
  const abilityHeight = 22;
  const abilities = [
    { label: 'STR', attribute: character.strength },
    { label: 'AGI', attribute: character.agility },
    { label: 'STA', attribute: character.stamina },
    { label: 'PER', attribute: character.personality },
    { label: 'INT', attribute: character.intelligence },
    { label: 'LCK', attribute: character.luck },
  ];

  for (let index = 0; index < abilities.length; index += 1) {
    const ability = abilities[index];
    drawAbilityBox(
      doc,
      MARGIN + index * abilityWidth,
      y,
      abilityWidth,
      abilityHeight,
      ability.label,
      ability.attribute,
    );
  }

  y += abilityHeight;

  const combatWidth = CONTENT_WIDTH / 5;
  drawCompactField(doc, MARGIN, y, combatWidth, ROW_HEIGHT, 'AC', `${character.armorClass}`);
  drawCompactField(doc, MARGIN + combatWidth, y, combatWidth, ROW_HEIGHT, 'HP', `${character.hp}`);
  drawCompactField(
    doc,
    MARGIN + combatWidth * 2,
    y,
    combatWidth,
    ROW_HEIGHT,
    'Speed',
    `${character.speed}'`,
  );
  drawCompactField(
    doc,
    MARGIN + combatWidth * 3,
    y,
    combatWidth,
    ROW_HEIGHT,
    'Init',
    formatDccModifier(character.attackModifier),
  );
  drawCompactField(
    doc,
    MARGIN + combatWidth * 4,
    y,
    combatWidth,
    ROW_HEIGHT,
    'XP',
    `${character.xp}`,
  );

  y += ROW_HEIGHT;

  const saveWidth = CONTENT_WIDTH / 3;
  drawCompactField(
    doc,
    MARGIN,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Reflex',
    formatDccModifier(character.reflexSave),
  );
  drawCompactField(
    doc,
    MARGIN + saveWidth,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Fortitude',
    formatDccModifier(character.fortitudeSave),
  );
  drawCompactField(
    doc,
    MARGIN + saveWidth * 2,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Willpower',
    formatDccModifier(character.willpowerSave),
  );

  y += ROW_HEIGHT + 2;

  y += drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Lucky Sign',
    formatDccLuckySign(character.luckyRoll),
  );
  y += drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Weapons',
    formatWeaponsSection(character),
  );
  y += drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Equipment',
    formatEquipmentSection(character),
  );
  y += drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Languages',
    formatLanguagesSection(character),
  );
  y += drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Notes',
    formatDccCharacterNotes(character),
  );
  drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Starting Funds',
    formatDccStartingFunds(character.currency),
    10,
  );
}

export async function buildDccCharacterPdf(character: DCCCharacter): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  renderCharacterSheet(doc, character);
  return doc.output('blob');
}

export async function downloadDccCharacterPdf(character: DCCCharacter): Promise<void> {
  const blob = await buildDccCharacterPdf(character);
  const url = URL.createObjectURL(blob);
  Download(url, slugifyDccCharacterFilename(character.firstName, character.lastName));
  URL.revokeObjectURL(url);
}

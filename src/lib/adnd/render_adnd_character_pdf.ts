import Download from '$lib/download';
import type ADNDCharacter from './adndcharacter';
import {
  formatAdndAbilitiesSection,
  formatAdndArmorSection,
  formatAdndCurrency,
  formatAdndDerivedStatsSection,
  formatAdndKitSection,
  formatAdndProficienciesSection,
  formatAdndSpellsSection,
  formatAdndStrength,
  formatAdndWeaponsSection,
  slugifyAdndCharacterFilename,
} from './adnd_format';

const PAGE_WIDTH = 215.9;
const MARGIN = 10;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const ROW_HEIGHT = 14;
const MIN_SECTION_HEIGHT = 14;

type PdfDoc = import('jspdf').jsPDF;

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
  doc.text(doc.splitTextToSize(value, width - 4), x + 2, y + 10);
}

function drawAbilityBox(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
): void {
  doc.rect(x, y, width, height);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(label, x + width / 2, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(value, x + width / 2, y + 14, { align: 'center' });
}

function measureSectionHeight(doc: PdfDoc, value: string, width: number, minHeight: number): number {
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

function renderCharacterSheet(doc: PdfDoc, character: ADNDCharacter): void {
  let y = MARGIN;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AD&D 2E CHARACTER SHEET', PAGE_WIDTH / 2, y + 5, { align: 'center' });
  y += 12;

  const nameWidth = CONTENT_WIDTH * 0.4;
  const classWidth = CONTENT_WIDTH * 0.35;
  const alignmentWidth = CONTENT_WIDTH * 0.25;

  drawCompactField(
    doc,
    MARGIN,
    y,
    nameWidth,
    ROW_HEIGHT,
    'Name',
    `${character.firstName} ${character.lastName}`.trim(),
  );
  drawCompactField(
    doc,
    MARGIN + nameWidth,
    y,
    classWidth,
    ROW_HEIGHT,
    'Race / Class / Level',
    `${character.race.name} ${character.class.name} ${character.level}`,
  );
  drawCompactField(
    doc,
    MARGIN + nameWidth + classWidth,
    y,
    alignmentWidth,
    ROW_HEIGHT,
    'Alignment',
    character.alignment,
  );

  y += ROW_HEIGHT;

  const abilityWidth = CONTENT_WIDTH / 6;
  const abilityHeight = 18;
  const abilities = [
    { label: 'STR', value: formatAdndStrength(character.strength, character.exceptionalStrength) },
    { label: 'DEX', value: `${character.dexterity}` },
    { label: 'CON', value: `${character.constitution}` },
    { label: 'INT', value: `${character.intelligence}` },
    { label: 'WIS', value: `${character.wisdom}` },
    { label: 'CHA', value: `${character.charisma}` },
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
      ability.value,
    );
  }

  y += abilityHeight;

  const combatWidth = CONTENT_WIDTH / 5;
  drawCompactField(doc, MARGIN, y, combatWidth, ROW_HEIGHT, 'HP', `${character.hp}`);
  drawCompactField(doc, MARGIN + combatWidth, y, combatWidth, ROW_HEIGHT, 'AC', `${character.ac}`);
  drawCompactField(
    doc,
    MARGIN + combatWidth * 2,
    y,
    combatWidth,
    ROW_HEIGHT,
    'THAC0',
    `${character.thaco}`,
  );
  drawCompactField(doc, MARGIN + combatWidth * 3, y, combatWidth, ROW_HEIGHT, 'XP', `${character.xp}`);
  drawCompactField(
    doc,
    MARGIN + combatWidth * 4,
    y,
    combatWidth,
    ROW_HEIGHT,
    'Currency',
    formatAdndCurrency(character.currency),
  );

  y += ROW_HEIGHT;

  const saveWidth = CONTENT_WIDTH / 5;
  drawCompactField(
    doc,
    MARGIN,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Paralyzation/Poison/Death',
    `${character.poisonSavingThrow}`,
  );
  drawCompactField(
    doc,
    MARGIN + saveWidth,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Rod/Staff/Wand',
    `${character.rodSavingThrow}`,
  );
  drawCompactField(
    doc,
    MARGIN + saveWidth * 2,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Petrification/Polymorph',
    `${character.petrificationSavingThrow}`,
  );
  drawCompactField(
    doc,
    MARGIN + saveWidth * 3,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Breath Weapon',
    `${character.breathSavingThrow}`,
  );
  drawCompactField(
    doc,
    MARGIN + saveWidth * 4,
    y,
    saveWidth,
    ROW_HEIGHT,
    'Spell',
    `${character.spellSavingThrow}`,
  );

  y += ROW_HEIGHT + 2;

  y += drawLabeledSection(doc, MARGIN, y, CONTENT_WIDTH, 'Weapons', formatAdndWeaponsSection(character));
  y += drawLabeledSection(doc, MARGIN, y, CONTENT_WIDTH, 'Armor', formatAdndArmorSection(character));
  y += drawLabeledSection(doc, MARGIN, y, CONTENT_WIDTH, 'Spells', formatAdndSpellsSection(character));
  y += drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Abilities',
    formatAdndAbilitiesSection(character),
  );
  y += drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Proficiencies',
    formatAdndProficienciesSection(character),
  );
  y += drawLabeledSection(doc, MARGIN, y, CONTENT_WIDTH, 'Kit', formatAdndKitSection(character));
  drawLabeledSection(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    'Derived Stats',
    formatAdndDerivedStatsSection(character),
    20,
  );
}

export async function buildAdndCharacterPdf(character: ADNDCharacter): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  renderCharacterSheet(doc, character);
  return doc.output('blob');
}

export async function downloadAdndCharacterPdf(character: ADNDCharacter): Promise<void> {
  const blob = await buildAdndCharacterPdf(character);
  const url = URL.createObjectURL(blob);
  Download(url, slugifyAdndCharacterFilename(character.firstName, character.lastName));
  URL.revokeObjectURL(url);
}

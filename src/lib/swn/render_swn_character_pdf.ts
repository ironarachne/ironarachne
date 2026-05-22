import { formatCharacterDisplayName } from '$lib/characters/character_name_generation';
import Download from '$lib/download';
import {
  buildLandscapeSciFiPdf,
  createSciFiSheetColumns,
  drawSciFiBulletList,
  drawSciFiColumnSection,
  drawSciFiHeader,
  drawSciFiMetricStrip,
  drawSciFiStatRow,
  drawSciFiWrappedText,
  remainingColumnHeight,
  type SciFiSheetPage,
  type SciFiSheetTheme,
  type SciFiStatBox,
} from '$lib/pdf/scifi_sheet_layout';
import type { SWNCharacter } from './character';

const DEFAULT_FILENAME = 'swn-character.pdf';

type PdfDoc = import('jspdf').jsPDF;

function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return `${value}`;
}

function formatSwnHeaderTitle(character: SWNCharacter): string {
  return formatCharacterDisplayName(character.firstName, character.lastName) || 'Stars Without Number';
}

function formatSwnSubtitle(character: SWNCharacter): string {
  return `${character.background.name} // ${character.characterClass.name}`;
}

function formatSwnCombatMetrics(character: SWNCharacter): SciFiStatBox[] {
  const metrics: SciFiStatBox[] = [
    { label: 'HP', value: `${character.hitPoints}` },
    { label: 'AC', value: `${character.armorClassEquipped}` },
    { label: 'BAB', value: formatSigned(character.attackBonus) },
    { label: 'Credits', value: `${character.credits}` },
    { label: 'Save EVA', value: `${character.savingThrowEvasion}` },
    { label: 'Save MEN', value: `${character.savingThrowMental}` },
    { label: 'Save PHY', value: `${character.savingThrowPhysical}` },
  ];

  if (character.effort > 0) {
    metrics.splice(4, 0, { label: 'Effort', value: `${character.effort}` });
  }

  return metrics;
}

function formatSwnStatBoxes(character: SWNCharacter): SciFiStatBox[] {
  return character.stats.map((stat) => ({
    label: stat.abbreviation,
    value: `${stat.score} (${formatSigned(stat.modifier)})`,
  }));
}

function formatSwnFocusLines(character: SWNCharacter): string[] {
  if (character.focuses.length === 0) {
    return ['None'];
  }

  return character.focuses.map((focus) => `${focus.name} L${focus.currentLevel}`);
}

function formatSwnSkillLines(character: SWNCharacter): string[] {
  if (character.skills.length === 0) {
    return ['None'];
  }

  return character.skills.map((skill) => `${skill.name}-${skill.level}`);
}

function formatSwnWeaponLines(character: SWNCharacter): string[] {
  const weapons: string[] = [];

  for (const weapon of character.rangedWeapons) {
    weapons.push(
      `${weapon.name}: ${weapon.damage}, ATK ${formatSigned(character.rangedAttackBonus)} (rng)`,
    );
  }

  for (const weapon of character.meleeWeapons) {
    weapons.push(
      `${weapon.name}: ${weapon.damage}, ATK ${formatSigned(character.meleeAttackBonus)} (mel)`,
    );
  }

  return weapons.length > 0 ? weapons : ['None'];
}

function formatSwnArmorLines(character: SWNCharacter): string[] {
  if (character.armor.length === 0) {
    return ['None'];
  }

  return character.armor.map((item) => `${item.name}: AC ${item.ac}`);
}

function formatSwnEquipmentLines(character: SWNCharacter): string[] {
  const equipment = character.equipmentList();
  return equipment.length > 0 ? equipment : ['None'];
}

function formatSwnAbilityLines(character: SWNCharacter): string[] {
  if (character.abilities.length === 0) {
    return ['None'];
  }

  return character.abilities.map((ability) => ability.description);
}

function estimateBulletListHeight(itemCount: number, linesPerItem = 1.5): number {
  return itemCount * linesPerItem * 3.2 + 1;
}

function estimateWrappedHeight(lineCount: number): number {
  return lineCount * 3.2 + 1;
}

function renderSwnCharacterSheet(
  doc: PdfDoc,
  page: SciFiSheetPage,
  theme: SciFiSheetTheme,
  character: SWNCharacter,
): void {
  const contentTop = drawSciFiHeader(
    doc,
    page,
    formatSwnHeaderTitle(character),
    formatSwnSubtitle(character),
    theme,
  );

  let y = contentTop;
  y += drawSciFiMetricStrip(
    doc,
    page.margin,
    y,
    page.contentWidth,
    formatSwnCombatMetrics(character),
    theme,
  );
  y += drawSciFiStatRow(doc, page.margin, y, page.contentWidth, formatSwnStatBoxes(character), theme);

  const columns = createSciFiSheetColumns(page, 3, 5, y + 1);
  const focusLines = formatSwnFocusLines(character);
  const skillLines = formatSwnSkillLines(character);
  const abilityLines = formatSwnAbilityLines(character);
  const weaponLines = formatSwnWeaponLines(character);
  const armorLines = formatSwnArmorLines(character);
  const equipmentLines = formatSwnEquipmentLines(character);

  drawSciFiColumnSection(
    doc,
    columns[0],
    'Focuses',
    estimateBulletListHeight(focusLines.length),
    (x, bodyY, width) => {
      drawSciFiBulletList(doc, x, bodyY, width, focusLines, { fontSize: 7, theme });
    },
    theme,
  );

  drawSciFiColumnSection(
    doc,
    columns[0],
    'Skills',
    estimateBulletListHeight(skillLines.length),
    (x, bodyY, width) => {
      drawSciFiBulletList(doc, x, bodyY, width, skillLines, { fontSize: 7, theme });
    },
    theme,
  );

  const abilityHeight = Math.min(
    remainingColumnHeight(columns[1]),
    estimateWrappedHeight(abilityLines.length * 4),
  );
  drawSciFiColumnSection(
    doc,
    columns[1],
    'Abilities',
    abilityHeight,
    (x, bodyY, width) => {
      let offset = 0;
      for (const ability of abilityLines) {
        offset += drawSciFiWrappedText(doc, x, bodyY + offset, width, ability, {
          fontSize: 6.5,
          lineHeight: 3,
          theme,
          maxLines: 8,
        });
        offset += 1;
      }
    },
    theme,
  );

  drawSciFiColumnSection(
    doc,
    columns[2],
    'Weapons',
    estimateBulletListHeight(weaponLines.length),
    (x, bodyY, width) => {
      drawSciFiBulletList(doc, x, bodyY, width, weaponLines, { fontSize: 7, theme });
    },
    theme,
  );

  drawSciFiColumnSection(
    doc,
    columns[2],
    'Armor',
    estimateBulletListHeight(armorLines.length),
    (x, bodyY, width) => {
      drawSciFiBulletList(doc, x, bodyY, width, armorLines, { fontSize: 7, theme });
    },
    theme,
  );

  drawSciFiColumnSection(
    doc,
    columns[2],
    'Equipment',
    estimateBulletListHeight(equipmentLines.length),
    (x, bodyY, width) => {
      drawSciFiBulletList(doc, x, bodyY, width, equipmentLines, { fontSize: 7, theme });
    },
    theme,
  );
}

export async function buildSwnCharacterPdf(character: SWNCharacter): Promise<Blob> {
  return buildLandscapeSciFiPdf((doc, page, theme) => {
    renderSwnCharacterSheet(doc, page, theme, character);
  });
}

export async function downloadSwnCharacterPdf(character: SWNCharacter): Promise<void> {
  const blob = await buildSwnCharacterPdf(character);
  const url = URL.createObjectURL(blob);
  Download(url, DEFAULT_FILENAME);
  URL.revokeObjectURL(url);
}

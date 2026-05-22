import type { DCCCharacter, DCCLuckyRoll, DCCWeapon } from './dcc_types';

export function formatDccModifier(modifier: number): string {
  if (modifier > -1) {
    return `+${modifier}`;
  }

  return `${modifier}`;
}

export function formatDccSpellsKnown(spellsKnown: number): string {
  if (spellsKnown === -9) {
    return 'No spellcasting possible';
  }

  if (spellsKnown > -1) {
    return `+${spellsKnown}`;
  }

  return `${spellsKnown}`;
}

export function formatDccCurrency(currency: Record<string, number>): string {
  const parts = [];
  for (const [key, value] of Object.entries(currency)) {
    if (value > 0) {
      parts.push(`${value} ${key}`);
    }
  }
  return parts.join(', ');
}

export function formatDccStartingFunds(currency: Record<string, number>): string {
  if (currency.cp > 0) {
    return `${currency.cp} cp`;
  }

  const formatted = formatDccCurrency(currency);
  return formatted.length > 0 ? formatted : '0 cp';
}

export function formatDccWeaponLine(weapon: DCCWeapon, attackModifier: number): string {
  return `${weapon.name} ${formatDccModifier(attackModifier)} (${weapon.damage})`;
}

export function formatDccLuckySign(luckyRoll: DCCLuckyRoll): string {
  return `${luckyRoll.name}: ${luckyRoll.description} (${formatDccModifier(luckyRoll.modifier)})`;
}

export function formatDccCharacterNotes(character: DCCCharacter): string {
  const parts = [...character.specialRules];

  parts.push(
    `Spells Known: ${formatDccSpellsKnown(character.spellsKnown)}; Wizard Max: ${character.wizardMaxSpellLevel}; Cleric Max: ${character.clericMaxSpellLevel}`,
  );

  return parts.join('; ');
}

export function slugifyDccCharacterFilename(firstName: string, lastName: string): string {
  const slug = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? `dcc-${slug}.pdf` : 'dcc-character.pdf';
}

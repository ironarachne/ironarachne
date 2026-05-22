import * as Words from '@ironarachne/words';
import * as Currency from '$lib/currency/currency';
import type ADNDCharacter from './adndcharacter';

export function formatAdndSignedNumber(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return `${value}`;
}

export function formatAdndStrength(strength: number, exceptionalStrength: number): string {
  if (exceptionalStrength !== -1) {
    const estr = String(exceptionalStrength).padStart(2, '0');
    return `${strength}/${estr.substring(estr.length - 2)}`;
  }

  return `${strength}`;
}

export function formatAdndSpellLevel(spellLevel: number): string {
  if (spellLevel === -1) {
    return 'N/A';
  }

  return `${spellLevel}${Words.getOrdinal(spellLevel)}`;
}

export function formatAdndMaximumSpellsPerLevel(maximumNumberOfSpellsPerLevel: number): string {
  if (maximumNumberOfSpellsPerLevel === -1) {
    return 'N/A';
  }

  if (maximumNumberOfSpellsPerLevel === 99) {
    return 'All';
  }

  return `${maximumNumberOfSpellsPerLevel}`;
}

export function formatAdndBonusSpells(bonusSpells: number[]): string {
  if (bonusSpells.length === 0) {
    return 'N/A';
  }

  if (bonusSpells[0] === 0) {
    return '0';
  }

  return bonusSpells.join(', ');
}

export function formatAdndIllusionImmunity(illusionImmunity: number): string {
  if (illusionImmunity === -1) {
    return 'N/A';
  }

  return `${illusionImmunity}${Words.getOrdinal(illusionImmunity)}-level`;
}

export function formatAdndCurrency(currency: number): string {
  const safeCurrency = Number.isFinite(currency) ? currency : 0;
  return Currency.valueToGpSpCpString(safeCurrency);
}

export function formatAdndWeaponsSection(character: ADNDCharacter): string {
  if (character.weapons.length === 0) {
    return 'None';
  }

  return character.weapons
    .map(
      (weapon) =>
        `${weapon.name} (${weapon.damageType}, ${weapon.damageSM}/${weapon.damageL}, spd ${weapon.speedFactor})`,
    )
    .join('; ');
}

export function formatAdndArmorSection(character: ADNDCharacter): string {
  if (character.armor.length === 0) {
    return 'None';
  }

  return character.armor.map((armor) => `${armor.name} (AC mod ${armor.ac})`).join('; ');
}

export function formatAdndSpellsSection(character: ADNDCharacter): string {
  if (character.spells.length === 0) {
    return 'None';
  }

  return character.spells.map((spell) => spell.name).join(', ');
}

export function formatAdndAbilitiesSection(character: ADNDCharacter): string {
  if (character.abilities.length === 0) {
    return 'None';
  }

  return character.abilities.join('; ');
}

export function formatAdndProficienciesSection(character: ADNDCharacter): string {
  const parts: string[] = [];

  if (character.weaponProficiencyGroups.length > 0) {
    parts.push(`Weapon: ${character.weaponProficiencyGroups.join(', ')}`);
  }

  if (character.nonweaponProficiencies.length > 0) {
    parts.push(`Nonweapon: ${character.nonweaponProficiencies.join(', ')}`);
  }

  if (parts.length === 0) {
    return 'None';
  }

  return parts.join('; ');
}

export function formatAdndKitSection(character: ADNDCharacter): string {
  if (!character.kit) {
    return 'None';
  }

  const features =
    character.kit.features.length > 0 ? ` (${character.kit.features.join('; ')})` : '';

  return `${character.kit.name}${features}`;
}

export function formatAdndDerivedStatsLines(character: ADNDCharacter): string[] {
  return [
    `Hit Probability: ${character.hitProbability}`,
    `Damage Adjustment: ${character.damageAdjustment}`,
    `Weight Allowance: ${character.weightAllowance}`,
    `Maximum Press: ${character.maxPress}`,
    `Open Doors: ${character.openDoors}`,
    `Bend Bars/Lift Gates: ${character.bendBarsLiftGates}%`,
    `Reaction Adjustment: ${formatAdndSignedNumber(character.reactionAdjustment)}`,
    `Missile Attack Adjustment: ${formatAdndSignedNumber(character.missileAttackAdjustment)}`,
    `Defensive Adjustment: ${formatAdndSignedNumber(character.defensiveAdjustment)}`,
    `System Shock: ${character.systemShock}%`,
    `Resurrection Survival: ${character.resurrectionSurvival}%`,
    `Poison Save: ${formatAdndSignedNumber(character.poisonSave)}`,
    `Regeneration: ${character.regeneration}`,
    `Number of Languages: ${character.numberOfLanguages}`,
    `Spell Level: ${formatAdndSpellLevel(character.spellLevel)}`,
    `Chance To Learn Spell: ${character.chanceToLearnSpell === -1 ? 'N/A' : `${character.chanceToLearnSpell}%`}`,
    `Maximum Spells Per Level: ${formatAdndMaximumSpellsPerLevel(character.maximumNumberOfSpellsPerLevel)}`,
    `Illusion Immunity: ${formatAdndIllusionImmunity(character.illusionImmunity)}`,
    `Magical Defense Adjustment: ${formatAdndSignedNumber(character.magicalDefenseAdjustment)}`,
    `Bonus Priest Spells: ${formatAdndBonusSpells(character.bonusSpells)}`,
    `Chance of Spell Failure: ${character.chanceOfSpellFailure}%`,
    `Spell Immunity: ${character.spellImmunity.length === 0 ? 'N/A' : character.spellImmunity.join(', ')}`,
    `Maximum Number of Henchmen: ${character.maximumNumberOfHenchmen}`,
    `Loyalty Base: ${formatAdndSignedNumber(character.loyaltyBase)}`,
    `Reaction Adjustment (NPCs): ${formatAdndSignedNumber(character.npcReactionAdjustment)}`,
  ];
}

export function formatAdndDerivedStatsSection(character: ADNDCharacter): string {
  return formatAdndDerivedStatsLines(character).join('; ');
}

export function slugifyAdndCharacterFilename(firstName: string, lastName: string): string {
  const slug = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? `adnd-${slug}.pdf` : 'adnd-character.pdf';
}

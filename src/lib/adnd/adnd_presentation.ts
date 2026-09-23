import type ADNDCharacter from './adndcharacter';
import { formatAdndCurrency, formatAdndDerivedStatsLines, formatAdndStrength } from './adnd_format';

function facts(rows: [string, string | number][]): string {
  return rows.map(([label, value]) => `- ${label}: ${value}`).join('\n');
}

function list(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

/** The saved AD&D sheet expressed as reader-facing sections for a project book. */
export function adndCharacterToMarkdown(character: ADNDCharacter): string {
  const blocks = [
    `# ${character.firstName} ${character.lastName}`,
    `Level ${character.level} ${character.race.name} ${character.class.name}`,
    facts([
      ['Alignment', character.alignment],
      ['XP', character.xp],
      ['HP', character.hp],
      ['AC', character.ac],
      ['THAC0', character.thaco],
      ['Currency', formatAdndCurrency(character.currency)],
    ]),
    '## Attributes',
    facts([
      ['Strength', formatAdndStrength(character.strength, character.exceptionalStrength)],
      ['Dexterity', character.dexterity],
      ['Constitution', character.constitution],
      ['Intelligence', character.intelligence],
      ['Wisdom', character.wisdom],
      ['Charisma', character.charisma],
    ]),
    '## Saving Throws',
    facts([
      ['Paralyzation, Poison, or Death Magic', character.poisonSavingThrow],
      ['Rod, Staff, or Wand', character.rodSavingThrow],
      ['Petrification or Polymorph', character.petrificationSavingThrow],
      ['Breath Weapon', character.breathSavingThrow],
      ['Spell', character.spellSavingThrow],
    ]),
    '## Derived Stats',
    list(formatAdndDerivedStatsLines(character)),
  ];
  if (character.weapons.length > 0) {
    blocks.push(
      '## Weapons',
      [
        '| Weapon | Damage Type | Damage (SM/L) | Speed |',
        '| --- | --- | --- | --- |',
        ...character.weapons.map(
          (weapon) =>
            `| ${weapon.name} | ${weapon.damageType} | ${weapon.damageSM}/${weapon.damageL} | ${weapon.speedFactor} |`,
        ),
      ].join('\n'),
    );
  }
  if (character.armor.length > 0)
    blocks.push('## Armor', list(character.armor.map((item) => item.name)));
  if (character.abilities.length > 0) blocks.push('## Abilities', list(character.abilities));
  if (character.thiefSkills.length > 0) {
    blocks.push(
      '## Thief Skills',
      [
        '| Skill | Base | Allocated | Total |',
        '| --- | --- | --- | --- |',
        ...character.thiefSkills.map(
          (skill) =>
            `| ${skill.name} | ${skill.value}% | ${skill.points > 0 ? `+${skill.points}` : '—'} | ${skill.value + skill.points}% |`,
        ),
      ].join('\n'),
    );
  }
  if (character.spells.length > 0)
    blocks.push('## Spells', list(character.spells.map((item) => item.name)));
  if (character.weaponProficiencyGroups.length > 0) {
    blocks.push('## Weapon Proficiencies', list(character.weaponProficiencyGroups));
  }
  if (character.nonweaponProficiencies.length > 0) {
    blocks.push('## Nonweapon Proficiencies', list(character.nonweaponProficiencies));
  }
  if (character.kit) blocks.push(`## Kit: ${character.kit.name}`, list(character.kit.features));
  return `${blocks.filter(Boolean).join('\n\n')}\n`;
}

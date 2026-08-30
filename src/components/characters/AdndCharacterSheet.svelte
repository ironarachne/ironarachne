<script lang="ts">
  import DataTable, { type Column } from '$components/common/DataTable.svelte';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import * as Words from '@ironarachne/words';
  import { Currency } from '$lib/currency';
  import { adndRaceDisplayName, type ADNDCharacter } from '$lib/adnd';

  type Props = { character: ADNDCharacter };
  const { character }: Props = $props();

  function getEStrength(exStr: number) {
    const estr = String(exStr).padStart(2, '0');
    return estr.substring(estr.length - 2);
  }

  /** The two tables on a sheet, and the keys their rows show when they flip. */
  const WEAPON_COLUMNS: Column[] = [
    { label: 'Weapon' },
    { label: 'Damage Type' },
    { label: 'Damage (SM/L)', numeric: true },
    { label: 'Spd. Factor', numeric: true },
  ];

  const THIEF_SKILL_COLUMNS: Column[] = [
    { label: 'Skill' },
    { label: 'Base', numeric: true },
    { label: 'Allocated', numeric: true },
    { label: 'Total', numeric: true },
  ];
</script>

<h2>{character.firstName} {character.lastName}</h2>

<p>A level {character.level} {adndRaceDisplayName(character)} {character.class.name}</p>

<StatBlock>
  <Stat label="XP">{character.xp}</Stat>
  <Stat label="HP">{character.hp}</Stat>
  <Stat label="AC">{character.ac}</Stat>
  <Stat label="THAC0">{character.thaco}</Stat>
  <Stat label="Alignment">{character.alignment}</Stat>
</StatBlock>
<Stat label="Currency">
  {Currency.valueToGpSpCpString(Number.isFinite(character.currency) ? character.currency : 0)}
</Stat>

<h3>Attributes</h3>

<Stat label="Strength">
  {character.strength}{#if character.exceptionalStrength != -1}/{getEStrength(
      character.exceptionalStrength,
    )}{/if}
</Stat>
<StatBlock>
  <Stat label="Dexterity">{character.dexterity}</Stat>
  <Stat label="Constitution">{character.constitution}</Stat>
  <Stat label="Charisma">{character.charisma}</Stat>
  <Stat label="Intelligence">{character.intelligence}</Stat>
  <Stat label="Wisdom">{character.wisdom}</Stat>
</StatBlock>

<h3>Saving Throws</h3>

<StatBlock>
  <Stat label="Paralyzation, Poison, or Death Magic">{character.poisonSavingThrow}</Stat>
  <Stat label="Rod, Staff, or Wand">{character.rodSavingThrow}</Stat>
  <Stat label="Petrification or Polymorph">{character.petrificationSavingThrow}</Stat>
  <Stat label="Breath Weapon">{character.breathSavingThrow}</Stat>
  <Stat label="Spell">{character.spellSavingThrow}</Stat>
</StatBlock>

<h3>Derived Stats</h3>

<StatBlock>
  <Stat label="Hit Probability">{character.hitProbability}</Stat>
  <Stat label="Damage Adjustment">{character.damageAdjustment}</Stat>
  <Stat label="Weight Allowance">{character.weightAllowance}</Stat>
  <Stat label="Maximum Press">{character.maxPress}</Stat>
  <Stat label="Open Doors">{character.openDoors}</Stat>
  <Stat label="Bend Bars/Lift Gates">{character.bendBarsLiftGates}%</Stat>
</StatBlock>
<Stat label="Reaction Adjustment">
  {character.reactionAdjustment > 0
    ? `+${character.reactionAdjustment}`
    : character.reactionAdjustment}
</Stat>
<Stat label="Missile Attack Adjustment">
  {character.missileAttackAdjustment > 0
    ? `+${character.missileAttackAdjustment}`
    : character.missileAttackAdjustment}
</Stat>
<Stat label="Defensive Adjustment">
  {character.defensiveAdjustment > 0
    ? `+${character.defensiveAdjustment}`
    : character.defensiveAdjustment}
</Stat>
<StatBlock>
  <!-- The value was missing outright before #153: the sheet printed "Hit Point Adjustment:" with
       nothing after it. Converting a label-and-value pattern into a component that needs both is
       what found it — `character.hitPointAdjustment` has been on the type all along. -->
  <Stat label="Hit Point Adjustment"
    >{character.hitPointAdjustment > 0
      ? `+${character.hitPointAdjustment}`
      : character.hitPointAdjustment}</Stat
  >
  <Stat label="System Shock">{character.systemShock}%</Stat>
  <Stat label="Resurrection Survival">{character.resurrectionSurvival}%</Stat>
</StatBlock>
<Stat label="Poison Save">
  {character.poisonSave > 0 ? `+${character.poisonSave}` : character.poisonSave}
</Stat>
<StatBlock>
  <Stat label="Regeneration">{character.regeneration}</Stat>
  <Stat label="Number of Languages">{character.numberOfLanguages}</Stat>
</StatBlock>
<Stat label="Spell Level">
  {character.spellLevel == -1
    ? 'N/A'
    : `${character.spellLevel}${Words.getOrdinal(character.spellLevel)}`}
</Stat>
<Stat label="Chance To Learn Spell">
  {character.chanceToLearnSpell == -1 ? 'N/A' : `${character.chanceToLearnSpell}%`}
</Stat>
<Stat label="Maximum Number of Spells Per Level">
  {character.maximumNumberOfSpellsPerLevel == -1
    ? 'N/A'
    : character.maximumNumberOfSpellsPerLevel == 99
      ? 'All'
      : character.maximumNumberOfSpellsPerLevel}
</Stat>
<Stat label="Illusion Immunity">
  {character.illusionImmunity == -1
    ? 'N/A'
    : `${character.illusionImmunity}${Words.getOrdinal(character.illusionImmunity)}-level`}
</Stat>
<Stat label="Magical Defense Adjustment">
  {character.magicalDefenseAdjustment > 0
    ? `+${character.magicalDefenseAdjustment}`
    : character.magicalDefenseAdjustment}
</Stat>
<Stat label="Bonus Priest Spells">
  {character.bonusSpells.length == 0
    ? 'N/A'
    : character.bonusSpells[0] == 0
      ? '0'
      : character.bonusSpells.join(', ')}
</Stat>
<StatBlock>
  <Stat label="Chance of Spell Failure">{character.chanceOfSpellFailure}%</Stat>
</StatBlock>
<Stat label="Spell Immunity">
  {character.spellImmunity.length == 0 ? 'N/A' : character.spellImmunity.join(', ')}
</Stat>
<StatBlock>
  <Stat label="Maximum Number of Henchmen">{character.maximumNumberOfHenchmen}</Stat>
</StatBlock>
<Stat label="Loyalty Base">
  {character.loyaltyBase > 0 ? `+${character.loyaltyBase}` : character.loyaltyBase}
</Stat>
<Stat label="Reaction Adjustment (NPCs)">
  {character.npcReactionAdjustment > 0
    ? `+${character.npcReactionAdjustment}`
    : character.npcReactionAdjustment}
</Stat>

<h3>Weapons</h3>

<DataTable columns={WEAPON_COLUMNS} rows={weaponRows} />

{#snippet weaponRows()}
  {#each character.weapons as weapon}
    <tr>
      <td data-label="Weapon">{weapon.name}</td>
      <td data-label="Damage Type">{weapon.damageType}</td>
      <td class="numeric" data-label="Damage (SM/L)">{weapon.damageSM}/{weapon.damageL}</td>
      <td class="numeric" data-label="Spd. Factor">{weapon.speedFactor}</td>
    </tr>
  {/each}
{/snippet}

<h3>Armor</h3>

{#each character.armor as armor}
  <p>{armor.name}</p>
{/each}

<h3>Abilities</h3>

{#each character.abilities as ability}
  <p>{ability}</p>
{/each}

{#if character.thiefSkills.length > 0}
  <h3>Thief Skills</h3>

  <DataTable columns={THIEF_SKILL_COLUMNS} rows={thiefSkillRows} />

  {#snippet thiefSkillRows()}
    {#each character.thiefSkills as skill}
      <tr>
        <td data-label="Skill">{skill.name}</td>
        <td class="numeric" data-label="Base">{skill.value}%</td>
        <td class="numeric" data-label="Allocated">
          {skill.points > 0 ? `+${skill.points}` : '—'}
        </td>
        <td class="numeric" data-label="Total">{skill.value + skill.points}%</td>
      </tr>
    {/each}
  {/snippet}
{/if}

{#if character.spells.length > 0}
  <h3>Spells</h3>

  {#each character.spells as spell}
    <p>{spell.name}</p>
  {/each}
{/if}

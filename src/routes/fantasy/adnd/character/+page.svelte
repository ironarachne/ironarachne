<script lang="ts">
  import * as RND from "@ironarachne/rng";
  import * as Currency from '$lib/currency/currency';

  import random from "random";
  import seedrandom from "seedrandom";
  import ADNDCharacterGenerator from "$lib/adnd/adndcharactergenerator";
  import ADNDCharacterGeneratorConfig from "$lib/adnd/adndcharactergeneratorconfig";
  import * as Words from '@ironarachne/words';
  import type ADNDCharacter from "$lib/adnd/adndcharacter";

  let seed = RND.randomString(13);
  let genConfig;
  let charGen;
  let character: ADNDCharacter;

  function generate() {
    random.use(seedrandom(seed));

    genConfig = new ADNDCharacterGeneratorConfig();
    charGen = new ADNDCharacterGenerator();
    charGen.config = genConfig;
    character = charGen.generateCharacter();
  }

  function getEStrength(exStr: number) {
    let estr = String(exStr).padStart(2, '0');
    return estr.substring(estr.length - 2);
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  newSeed();
</script>

<svelte:head>
  <title>AD&amp;D 2e Character Generator | Iron Arachne</title>
</svelte:head>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';
</style>

<section class="fantasy main">
  <h1>AD&amp;D 2e Character Generator</h1>

  <p>This is an AD&amp;D 2e character generator.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{ character.firstName } { character.lastName }</h2>

  <p>A level { character.level } { character.race.name } { character.class.name }</p>

  <p><strong>XP:</strong> { character.xp }</p>
  <p><strong>HP:</strong> { character.hp }</p>
  <p><strong>AC:</strong> { character.ac }</p>
  <p><strong>THAC0:</strong> { character.thaco }</p>
  <p><strong>Alignment:</strong> { character.alignment }</p>
  <p><strong>Currency:</strong> { Currency.valueToCoins(character.currency, false, false) }</p>

  <h3>Attributes</h3>

  <p><strong>Strength:</strong> { character.strength }{#if character.exceptionalStrength != -1 }/{ getEStrength(character.exceptionalStrength) }{/if}</p>
  <p><strong>Dexterity:</strong> { character.dexterity }</p>
  <p><strong>Constitution:</strong> { character.constitution }</p>
  <p><strong>Charisma:</strong> { character.charisma }</p>
  <p><strong>Intelligence:</strong> { character.intelligence }</p>
  <p><strong>Wisdom:</strong> { character.wisdom }</p>

  <h3>Saving Throws</h3>

  <p><strong>Paralyzation, Poison, or Death Magic:</strong> { character.poisonSavingThrow }</p>
  <p><strong>Rod, Staff, or Wand:</strong> { character.rodSavingThrow }</p>
  <p><strong>Petrification or Polymorph:</strong> { character.petrificationSavingThrow }</p>
  <p><strong>Breath Weapon:</strong> { character.breathSavingThrow }</p>
  <p><strong>Spell:</strong> { character.spellSavingThrow }</p>

  <h3>Derived Stats</h3>

  <p><strong>Hit Probability:</strong> { character.hitProbability }</p>
  <p><strong>Damage Adjustment:</strong> { character.damageAdjustment }</p>
  <p><strong>Weight Allowance:</strong> { character.weightAllowance }</p>
  <p><strong>Maximum Press:</strong> { character.maxPress }</p>
  <p><strong>Open Doors:</strong> { character.openDoors }</p>
  <p><strong>Bend Bars/Lift Gates:</strong> { character.bendBarsLiftGates }%</p>
  <p><strong>Reaction Adjustment:</strong> { character.reactionAdjustment > 0 ? `+${character.reactionAdjustment}` : character.reactionAdjustment }</p>
  <p><strong>Missile Attack Adjustment:</strong> { character.missileAttackAdjustment > 0 ? `+${character.missileAttackAdjustment}` : character.missileAttackAdjustment }</p>
  <p><strong>Defensive Adjustment:</strong> { character.defensiveAdjustment > 0 ? `+${character.defensiveAdjustment}` : character.defensiveAdjustment }</p>
  <p><strong>Hit Point Adjustment:</strong> </p>
  <p><strong>System Shock: </strong> { character.systemShock }%</p>
  <p><strong>Resurrection Survival: </strong> { character.resurrectionSurvival }%</p>
  <p><strong>Poison Save:</strong> { character.poisonSave > 0 ? `+${character.poisonSave}` : character.poisonSave }</p>
  <p><strong>Regeneration:</strong> { character.regeneration }</p>
  <p><strong>Number of Languages:</strong> { character.numberOfLanguages }</p>
  <p><strong>Spell Level:</strong> { character.spellLevel == -1 ? 'N/A' : `${character.spellLevel}${Words.getOrdinal(character.spellLevel)}` }</p>
  <p><strong>Chance To Learn Spell:</strong> { character.chanceToLearnSpell == -1 ? 'N/A' : `${character.chanceToLearnSpell}%`}</p>
  <p><strong>Maximum Number of Spells Per Level:</strong> { character.maximumNumberOfSpellsPerLevel == -1 ? 'N/A' : character.maximumNumberOfSpellsPerLevel == 99 ? 'All': character.maximumNumberOfSpellsPerLevel }</p>
  <p><strong>Illusion Immunity:</strong> { character.illusionImmunity == -1 ? 'N/A' : `${character.illusionImmunity}${Words.getOrdinal(character.illusionImmunity)}-level`}</p>
  <p><strong>Magical Defense Adjustment:</strong> { character.magicalDefenseAdjustment > 0 ? `+${character.magicalDefenseAdjustment}` : character.magicalDefenseAdjustment }</p>
  <p><strong>Bonus Priest Spells:</strong> { character.bonusSpells.length == 0 ? 'N/A' : character.bonusSpells[0] == 0 ? '0' : character.bonusSpells.join(', ') }</p>
  <p><strong>Chance of Spell Failure:</strong> { character.chanceOfSpellFailure }%</p>
  <p><strong>Spell Immunity:</strong> { character.spellImmunity.length == 0 ? 'N/A' : character.spellImmunity.join(', ') }</p>
  <p><strong>Maximum Number of Henchmen:</strong> { character.maximumNumberOfHenchmen }</p>
  <p><strong>Loyalty Base:</strong> { character.loyaltyBase > 0 ? `+${character.loyaltyBase}` : character.loyaltyBase }</p>
  <p><strong>Reaction Adjustment (NPCs):</strong> { character.npcReactionAdjustment > 0 ? `+${character.npcReactionAdjustment}` : character.npcReactionAdjustment }</p>

  <h3>Weapons</h3>

  <table>
    <thead>
      <tr>
        <th>Weapon</th>
        <th>Damage Type</th>
        <th>Damage (SM/L)</th>
        <th>Spd. Factor</th>
      </tr>
    </thead>
    <tbody>
      {#each character.weapons as weapon}
        <tr>
          <td>{ weapon.name }</td>
          <td>{ weapon.damageType }</td>
          <td>{ weapon.damageSM }/{ weapon.damageL }</td>
          <td>{ weapon.speedFactor }</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h3>Armor</h3>

  {#each character.armor as armor}
    <p>{ armor.name }</p>
  {/each}

  <h3>Abilities</h3>

  {#each character.abilities as ability}
    <p>{ ability }</p>
  {/each}

  {#if character.spells.length > 0}
  <h3>Spells</h3>

  {#each character.spells as spell}
    <p>{ spell.name }</p>
  {/each}
  {/if}

</section>

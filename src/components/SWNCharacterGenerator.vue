<template>
  <section class="main">
    <h2>Stars Without Number Character Generator</h2>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateCharacter">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>
    <button v-on:click="saveCharacter">Save</button>

    <h3>Character</h3>

    <p><strong>Background:</strong> {{ background.name }}</p>
    <p><strong>Class:</strong> {{ characterClass.name }}</p>
    <p><strong>Hit Points:</strong> {{ hitPoints }}</p>
    <p v-if="effort > 0"><strong>Effort:</strong> {{ effort }}</p>
    <p><strong>Base Attack Bonus:</strong> +{{ attackBonus }}</p>
    <p><strong>Armor Class:</strong> {{ armorClass }}</p>
    <p><strong>Credits:</strong> {{ credits }}</p>

    <h4>Saving Throws</h4>

    <p><strong>Evasion:</strong> {{ savingThrowEvasion }}</p>
    <p><strong>Mental:</strong> {{ savingThrowMental }}</p>
    <p><strong>Physical:</strong> {{ savingThrowPhysical }}</p>

    <h4>Focuses</h4>

    <div v-for="focus in focuses" :key="focus.name">
      <strong>{{ focus.name }}</strong>, Level {{ focus.currentLevel }}
    </div>

    <h4>Stats</h4>

    <div class="stats">
      <div v-for="stat in stats" :key="stat.abbreviation">
        <strong>{{ stat.abbreviation }}:</strong> <span>{{ stat.score }} ({{ stat.modifier }})</span>
      </div>
    </div>

    <h4>Skills</h4>

    <div class="skills">
      <div v-for="skill in skills" :key="skill.name">
        {{ skill.name }}-{{ skill.level }}
      </div>
    </div>

    <h4>Abilities</h4>

    <div class="abilities">
      <div v-for="ability in abilities" :key="ability">
        {{ ability }}
      </div>
    </div>

    <h4>Weapons</h4>

    <div v-for="weapon in rangedWeapons" :key="weapon.name">
      <strong>{{ weapon.name }}:</strong> <span>{{ weapon.damage }} damage, {{ rangedAttackBonus }} attack bonus</span>
    </div>

    <div v-for="weapon in meleeWeapons" :key="weapon.name">
      <strong>{{ weapon.name }}:</strong> <span>{{ weapon.damage }} damage, {{ meleeAttackBonus }} attack bonus</span>
    </div>

    <h4>Armor</h4>

    <div v-for="item in armor" :key="item.name">
      <strong>{{ item.name }}:</strong> <span>{{ item.AC }} AC</span>
    </div>

    <h4>Equipment</h4>

    <div v-for="item in equipment" :key="item">
      {{ item }}
    </div>
  </section>
</template>

<script>
import * as iarnd from "../modules/random.js";
import * as CharGen from "../modules/swn/character.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "SWNCharacterGenerator",
  data: function () {
    return {
      stats: {},
      background: '',
      characterClass: {},
      skills: [],
      focuses: [],
      attackBonus: 0,
      rangedAttackBonus: 0,
      meleeAttackBonus: 0,
      hitPoints: 0,
      abilities: [],
      effort: 0,
      equipment: [],
      rangedWeapons: [],
      meleeWeapons: [],
      armor: [],
      armorClass: 0,
      credits: 0,
      savingThrowEvasion: 0,
      savingThrowMental: 0,
      savingThrowPhysical: 0,
    }
  },
  methods: {
    generateCharacter: function () {
      random.use(seedrandom(this.seed));

      let character = CharGen.generate();

      this.stats = character.stats;
      this.background = character.background;
      this.characterClass = character.characterClass;
      this.skills = character.skills;
      this.focuses = character.focuses;
      this.attackBonus = character.attackBonus;
      this.rangedAttackBonus = character.rangedAttackBonus;
      this.meleeAttackBonus = character.meleeAttackBonus;
      this.hitPoints = character.hitPoints;
      this.abilities = character.abilities;
      this.effort = character.effort;
      this.equipment = character.equipment;
      this.rangedWeapons = character.rangedWeapons;
      this.meleeWeapons = character.meleeWeapons;
      this.armor = character.armor;
      this.armorClass = character.armorClass;
      this.credits = character.credits;
      this.savingThrowEvasion = character.savingThrowEvasion;
      this.savingThrowMental = character.savingThrowMental;
      this.savingThrowPhysical = character.savingThrowPhysical;
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generateCharacter();
    },
    saveCharacter: function () {
      let character = '';

      character += 'Stars Without Number Character\n\n';

      character += 'Background: ' + this.background.name + '\n';
      character += 'Class: ' + this.characterClass.name + '\n';
      character += 'Hit Points: ' + this.hitPoints + '\n';

      if (character.effort != 0) {
        character += 'Effort: ' + this.effort + '\n';
      }

      character += 'Base Attack Bonus: ' + this.baseAttackBonus + '\n';
      character += 'Armor Class: ' + this.armorClass + '\n';
      character += 'Credits: ' + this.credits + '\n';

      character += '\nSaving Throws\n\n';

      character += 'Evasion: ' + this.savingThrowEvasion + '\n';
      character += 'Mental: ' + this.savingThrowMental + '\n';
      character += 'Physical: ' + this.savingThrowPhysical + '\n';

      character += '\nFocuses\n\n';

      for (let i=0;i<this.focuses.length;i++) {
        character += this.focuses[i].name + ', Level ' + this.focuses[i].level + '\n';
      }

      character += '\nStats\n\n';

      for (let i=0;i<this.stats.length;i++) {
        character += this.stats[i].abbreviation + ' ' + this.stats[i].score + ' (' + this.stats[i].modifier + ')\n';
      }

      character += '\nSkills\n\n';

      for (let i=0;i<this.skills.length;i++) {
        character += this.skills[i].name + '-' + this.skills[i].level + '\n';
      }

      character += '\nAbilities\n\n';

      for (let i=0;i<this.abilities.length;i++) {
        character += this.abilities[i] + '\n\n';
      }

      character += '\nWeapons\n\n';

      for (let i=0;i<this.rangedWeapons.length;i++) {
        character += this.rangedWeapons[i].name + ': ' + this.rangedWeapons[i].damage + ' damage, ' + this.rangedAttackBonus + ' attack bonus\n';
      }

      for (let i=0;i<this.meleeWeapons.length;i++) {
        character += this.meleeWeapons[i].name + ': ' + this.meleeWeapons[i].damage + ' damage, ' + this.meleeAttackBonus + ' attack bonus\n';
      }

      character += '\nArmor\n\n';

      for (let i=0;i<this.armor.length;i++) {
        character += this.armor[i].name + ': ' + this.armor[i].AC + ' AC\n';
      }

      character += '\nEquipment\n\n';

      for (let i=0;i<this.equipment.length;i++) {
        character += '- ' + this.equipment[i] + '\n';
      }

      const blob = new Blob([character], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "swn-character.txt";
      link.click();
      URL.revokeObjectURL(link.href);
    },
  },
  created: function () {
    this.newSeed();
  },
}
</script>

<style>
div.abilities > div {
  border-left: 1px solid #aaa;
  margin-bottom: 1rem;
  padding-left: 1rem;
}
</style>

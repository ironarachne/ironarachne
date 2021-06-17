<template>
  <section class="main scifi">
    <h2>Stars Without Number Character Generator</h2>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed"/>
    </div>
    <button v-on:click="generateCharacter">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>
    <button v-on:click="saveCharacter">Save</button>

    <h3>Character</h3>

    <p><strong>Background:</strong> {{ character.background.name }}</p>
    <p><strong>Class:</strong> {{ character.characterClass.name }}</p>
    <p><strong>Hit Points:</strong> {{ character.hitPoints }}</p>
    <p v-if="character.effort > 0"><strong>Effort:</strong> {{ character.effort }}</p>
    <p><strong>Base Attack Bonus:</strong> +{{ character.attackBonus }}</p>
    <p><strong>Armor Class:</strong> {{ character.armorClass }}</p>
    <p><strong>Credits:</strong> {{ character.credits }}</p>

    <h4>Saving Throws</h4>

    <p><strong>Evasion:</strong> {{ character.savingThrowEvasion }}</p>
    <p><strong>Mental:</strong> {{ character.savingThrowMental }}</p>
    <p><strong>Physical:</strong> {{ character.savingThrowPhysical }}</p>

    <h4>Focuses</h4>

    <div v-for="focus in character.focuses" :key="focus.name">
      <strong>{{ focus.name }}</strong>, Level {{ focus.currentLevel }}
    </div>

    <h4>Stats</h4>

    <div class="stats">
      <div v-for="stat in character.stats" :key="stat.abbreviation">
        <strong>{{ stat.abbreviation }}:</strong> <span>{{ stat.score }} ({{ stat.modifier }})</span>
      </div>
    </div>

    <h4>Skills</h4>

    <div class="skills">
      <div v-for="skill in character.skills" :key="skill.name">
        {{ skill.name }}-{{ skill.level }}
      </div>
    </div>

    <h4>Abilities</h4>

    <div class="abilities">
      <div v-for="ability in character.abilities" :key="ability">
        {{ ability }}
      </div>
    </div>

    <h4>Weapons</h4>

    <div v-for="weapon in character.rangedWeapons" :key="weapon.name">
      <strong>{{ weapon.name }}:</strong> <span>{{ weapon.damage }} damage, {{ character.rangedAttackBonus }} attack bonus</span>
    </div>

    <div v-for="weapon in character.meleeWeapons" :key="weapon.name">
      <strong>{{ weapon.name }}:</strong> <span>{{ weapon.damage }} damage, {{ character.meleeAttackBonus }} attack bonus</span>
    </div>

    <h4>Armor</h4>

    <div v-for="item in character.armor" :key="item.name">
      <strong>{{ item.name }}:</strong> <span>{{ item.AC }} AC</span>
    </div>

    <h4>Equipment</h4>

    <div v-for="item in character.equipment" :key="item">
      {{ item }}
    </div>
  </section>
</template>

<script>
import * as RND from "../modules/random.js";
import * as CharGen from "../modules/swn/character.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "SWNCharacterGenerator",
  data: function () {
    return {
      character: {},
      seed: "",
    };
  },
  methods: {
    generateCharacter: function () {
      random.use(seedrandom(this.seed));
      this.character = CharGen.generate();
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generateCharacter();
    },
    saveCharacter: function () {
      let character = CharGen.formatAsText(this.character);

      const blob = new Blob([character], {type: "text/plain"});
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
};
</script>

<style>
div.abilities > div {
  border-left: 1px solid #aaa;
  margin-bottom: 1rem;
  padding-left: 1rem;
}
</style>

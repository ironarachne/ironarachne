<template>
  <section class="uwchargen main">
    <h2>Uncharted Worlds Character Generator</h2>

    <p>Generate starting characters for Uncharted Worlds.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generateCharacter">Generate</button>
    <button v-on:click="newSeed">New Seed</button>

    <h3>Statistics</h3>

    <p><strong>Physique:</strong> {{ stats.physique }}</p>
    <p><strong>Mettle:</strong> {{ stats.mettle }}</p>
    <p><strong>Expertise:</strong> {{ stats.expertise }}</p>
    <p><strong>Influence:</strong> {{ stats.influence }}</p>
    <p><strong>Interface:</strong> {{ stats.interface }}</p>

    <h3>Careers</h3>

    <div v-for="(career, index) in careers" :key="index">{{ career.name }}</div>

    <h3>Origin</h3>

    <p>{{ origin.name }}</p>

    <h3>Descriptors</h3>

    <p>{{ descriptors }}</p>

    <h3>Skills</h3>

    <ul>
      <li v-for="(skill, index) in skills" :key="index">
        <strong>{{ skill.name }}: </strong>
        <pre>{{ skill.description }}</pre>
      </li>
    </ul>

    <h3>Advancement</h3>

    <p>{{ advancement }}</p>

    <h3>Assets</h3>

    <div class="asset">
      <h4>Workspace: {{ workspace.name }}</h4>
      <p>{{ workspace.description }}</p>
    </div>

    <div v-for="(asset, index) in assets" :key="index">
      <h4>{{ asset.name }}</h4>
      <p>{{ asset.description }}</p>
      <ul v-if="asset.upgrades.length > 0">
        <li v-for="(upgrade, index) in asset.upgrades" :key="index">
          <strong>{{ upgrade.name }}:</strong> {{ upgrade.description }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import * as iarnd from "../modules/random.js";
import * as CharGen from "../modules/unchartedworlds/character.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "UWCharacterGenerator",
  data: function () {
    return {
      stats: {},
      careers: [],
      origin: {},
      descriptors: "",
      skills: [],
      workspace: {},
      advancement: "",
      assets: [],
    };
  },
  methods: {
    generateCharacter: function () {
      random.use(seedrandom(this.seed));

      let character = CharGen.generate();

      this.stats = character.stats;
      this.careers = character.careers;
      this.origin = character.origin;
      this.descriptors = character.descriptors;
      this.skills = character.skills;
      this.workspace = character.workspace;
      this.advancement = character.advancement;
      this.assets = character.assets;
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generateCharacter();
    },
  },
  created: function () {
    this.newSeed();
  },
};
</script>

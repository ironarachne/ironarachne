<template>
  <section class="main scifi">
    <h2>Uncharted Worlds Character Generator</h2>

    <p>Generate starting characters for Uncharted Worlds.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>
    <button v-on:click="save">Save</button>

    <h3>Statistics</h3>

    <p><strong>Physique:</strong> {{ character.stats.physique }}</p>
    <p><strong>Mettle:</strong> {{ character.stats.mettle }}</p>
    <p><strong>Expertise:</strong> {{ character.stats.expertise }}</p>
    <p><strong>Influence:</strong> {{ character.stats.influence }}</p>
    <p><strong>Interface:</strong> {{ character.stats.interface }}</p>

    <h3>Careers</h3>

    <div v-for="career in character.careers" :key="career.name">{{ career.name }}</div>

    <h3>Origin</h3>

    <p>{{ character.origin.name }}</p>

    <h3>Descriptors</h3>

    <p>{{ character.descriptors }}</p>

    <h3>Skills</h3>

    <ul>
      <li v-for="skill in character.skills" :key="skill.name">
        <strong>{{ skill.name }}: </strong>
        <pre>{{ skill.description }}</pre>
      </li>
    </ul>

    <h3>Advancement</h3>

    <p>{{ character.advancement }}</p>

    <h3>Assets</h3>

    <div class="asset">
      <h4>Workspace: {{ character.workspace.name }}</h4>
      <p>{{ character.workspace.description }}</p>
    </div>

    <div v-for="asset in character.assets" :key="asset.name">
      <h4>{{ asset.name }}</h4>
      <p>{{ asset.description }}</p>
      <ul v-if="asset.upgrades.length > 0">
        <li v-for="upgrade in asset.upgrades" :key="upgrade.name">
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
      character: {},
    };
  },
  methods: {
    generate: function () {
      random.use(seedrandom(this.seed));
      this.character = CharGen.generate();
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generate();
    },
    save: function () {
      let description = CharGen.formatAsText(this.character);

      const blob = new Blob([description], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "uw-character.txt";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  },
  created: function () {
    this.newSeed();
  },
};
</script>

<template>
  <section class="main">
    <h2>Stars Without Number Starship Generator</h2>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" />
    </div>
    <button v-on:click="generate">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>
    <button v-on:click="save">Save</button>

    <h3>{{ starship.name }}</h3>

    <p><strong>Owner Type:</strong> {{ starship.ownerType.name }}</p>
    <p><strong>Manufacturer:</strong> {{ starship.manufacturer }}</p>
    <p><strong>Model:</strong> {{ starship.className }}</p>
    <p><strong>Hull Type:</strong> {{ starship.hullType.name }}</p>
    <p><strong>Hull Class:</strong> {{ starship.hullType.hullClassName }}</p>
    <p><strong>Drive:</strong> {{ starship.drive }}</p>
    <p><strong>Maximum Mass:</strong> {{ starship.hullType.mass }}</p>
    <p><strong>Mass Used:</strong> {{ starship.usedMass }}</p>
    <p><strong>Maximum Power:</strong> {{ starship.hullType.power }}</p>
    <p><strong>Power Used:</strong> {{ starship.usedPower }}</p>
    <p><strong>AC:</strong> {{ starship.hullType.AC }}</p>
    <p><strong>HP:</strong> {{ starship.hullType.HP }}</p>
    <p><strong>Minimum Crew:</strong> {{ starship.hullType.crewMinimum }}</p>
    <p><strong>Maximum Crew:</strong> {{ starship.hullType.crewMaximum }}</p>
    <p><strong>Current Crew:</strong> {{ starship.currentCrew }}</p>
    <p><strong>Total Ship Value:</strong> {{ new Intl.NumberFormat('en-US').format(starship.totalCost) }} credits</p>
    <p><strong>Total Crew Cost:</strong> {{ new Intl.NumberFormat('en-US').format(starship.currentCrew * 43800) }} credits per year</p>
    <p><strong>Crew Skill:</strong> {{ starship.hullType.crewSkill }}</p>
    <p><strong>Cargo Space:</strong> {{ starship.tonsOfCargo }} tons</p>

    <h4>Fittings</h4>

    <div v-for="fitting in starship.fittings" v-bind:key="fitting.name">
      {{ fitting.name }} - {{ fitting.effect }}
    </div>

    <h4>Weapons</h4>

    <div v-for="weapon in starship.weapons" v-bind:key="weapon.name">
      {{ weapon.name }} ({{ weapon.damage }}, {{ weapon.qualities.join(', ') }})
    </div>

    <h4>Defenses</h4>

    <div v-for="defense in starship.defenses" v-bind:key="defense.name">
      {{ defense.name }}: {{ defense.effect }}
    </div>
  </section>
</template>

<script>
import * as iarnd from "../modules/random.js";
import * as Gen from "../modules/swn/starship.js";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "SWNStarshipGenerator",
  data: function () {
    return {
      starship: {},
    }
  },
  methods: {
    generate: function () {
      random.use(seedrandom(this.seed));

      this.starship = Gen.generate();
    },
    newSeed: function () {
      this.seed = iarnd.randomString(13);
      this.generate();
    },
    save: function () {
      let starshipDescription = Gen.formatAsText(this.starship);

      const blob = new Blob([starshipDescription], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "swn-starship.txt";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  },
  created: function () {
    this.newSeed();
  },
}

</script>

<template>
  <section class="fantasy main">
    <h2>Organization Generator</h2>

    <p>This generates fantasy organizations.</p>

    <div class="input-group">
      <label for="seed">Random Seed</label>
      <input type="text" name="seed" v-model="seed" id="seed"/>
    </div>
    <button v-on:click="generateFantasyOrganization">Generate From Seed</button>
    <button v-on:click="newSeed">Random Seed (and Generate)</button>

    <h3>{{ name }}</h3>

    <div class="org-arms" v-html="heraldry.svg"></div>

    <p>{{ description }}</p>

    <p>{{ leadership }}</p>

    <h4>Notable Members</h4>

    <p v-for="member in notableMembers" :key="member.lastName">
      <strong>{{ member.getPrimaryTitle() }} {{ member.firstName }} {{ member.lastName }}:</strong>
      {{ member.description }}
    </p>
  </section>
</template>

<script>
import * as Heraldry from "../modules/heraldry/heraldry";
import * as Organization from "../modules/organizations/fantasy";
import * as RND from "../modules/random";

const random = require("random");
const seedrandom = require("seedrandom");

export default {
  name: "FantasyOrgGenerator",
  data: function () {
    return {
      name: "",
      description: "",
      leadership: "",
      notableMembers: [],
      charges: [],
      heraldry: {},
      seed: "",
    };
  },
  methods: {
    generateFantasyOrganization: function () {
      random.use(seedrandom(this.seed));
      let org = Organization.generate();
      this.name = org.name;
      this.description = org.description;
      this.leadership = org.leadership.description;
      this.notableMembers = org.notableMembers;
      this.heraldry = Heraldry.generate(this.charges, 200, 220);
    },
    loadCharges: function (charges) {
      this.charges = charges;
      this.newSeed();
    },
    newSeed: function () {
      this.seed = RND.randomString(13);
      this.generateFantasyOrganization();
    },
  },
  created: function () {
    Heraldry.loadCharges().then(this.loadCharges);
  },
};
</script>

<style>
div.org-arms {
  width: 200px;
  height: 220px;
  margin: 0 auto;
}
</style>

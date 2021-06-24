<template>
  <section class="fantasy main">
    <h2>Fantasy Equipment Lists</h2>
    <p>
      This page is meant to be a comprehensive list of equipment for fantasy
      games. It will be updated over time, so keep checking back for new
      entries.
    </p>
    <p>
      Where possible, I've based the prices off of historical data rather than
      fantasy sources. 1 copper coin is treated as equivalent to 1 farthing.
    </p>

    <div class="input-group">
      <label>Currency Type</label>
      <select v-model="currency">
        <option>D&D currency</option>
        <option>English currency</option>
      </select>
    </div>

    <div v-if="currency == 'D&D currency'">
      <ul>
        <li>cp: copper piece</li>
        <li>sp: silver piece (worth 10 copper pieces)</li>
        <li>gp: gold piece (worth 10 silver pieces)</li>
        <li>pp: platinum piece (worth 10 gold pieces)</li>
      </ul>
    </div>

    <div v-if="currency == 'English currency'">
      <ul>
        <li>f: farthing</li>
        <li>d: pence (worth 4 farthings)</li>
        <li>s: shilling (worth 12 pence)</li>
        <li>c: crown (worth 5 shillings)</li>
        <li>£: pound (worth 20 shillings)</li>
      </ul>
    </div>

    <div
      class="equipment-list"
      v-for="(equipmentList, equipmentListIndex) in equipmentLists"
      :key="equipmentListIndex"
    >
      <h3>{{ equipmentList.title }}</h3>
      <table>
        <thead>
        <tr>
          <th>Name</th>
          <th>Cost</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="(equipment, equipmentIndex) in equipmentList.items"
          :key="equipmentIndex"
        >
          <td>{{ equipment.name }}</td>
          <td v-if="currency == 'D&D currency'">
            {{ convertDNDCost(equipment.cost) }}
          </td>
          <td v-if="currency == 'English currency'">
            {{ convertEnglishCost(equipment.cost) }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import * as Currency from "../modules/currency";

import axios from "axios";

export default {
  name: "EquipmentLists",
  data: function () {
    return {
      currency: "D&D currency",
      equipmentLists: [],
    };
  },
  methods: {
    convertDNDCost: function (cost) {
      return Currency.convertCopper(cost);
    },
    convertEnglishCost: function (cost) {
      return Currency.convertFarthings(cost);
    },
    loadData: function () {
      var self = this;
      axios.get("/data/fantasy-equipment.json").then(function (response) {
        self.equipmentLists = response.data.equipmentLists;
      });
    },
  },
  created: function () {
    this.loadData();
  },
};
</script>

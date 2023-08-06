"use strict";

import type Biome from "./biome.js";

export default class Desert implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = "desert";
    this.temperature = 10;
    this.altitude = 1;
    this.humidity = 1;
    this.isAquatic = false;
    this.descriptions = [
      "The sun blasts this desert region.",
      "This area is a vast, hot desert.",
      "This desert is made up of rocky cliffs, dry riverbeds, and sand dunes.",
      "The vast and boundless sandy desert stretches out like a shimmering sea of gold, where the relentless winds sculpt the dunes into sinuous shapes and the blazing sun set the grains of sand alight in a fiery dance of light and shadow.",
      "The merciless sun beats down upon the barren expanse of the sandy desert, where the swirling sand devils dance across the scorching landscape like a legion of fiery spirits, while the distant mountains loom like jagged teeth against the roiling red horizon.",
      "The lifeless expanse of the sandy desert stretches out for miles around, where the relentless sun and the biting sand erode the very essence of hope, leaving nothing but an endless sea of desolation in its wake.",
      "The scorching sun beats down on the barren sand.",
      "The rugged terrain of the rocky desert, with its jutting peaks and winding canyons, presents an imposing and ever-changing landscape that demands respect and caution from even the most seasoned traveler.",
    ];
    this.features = [
      "A large oasis is the focus of this area.",
      "The sand dunes here resemble vast rolling seas.",
      "Rocky outcroppings give some blessed relief from the desert sun.",
      "Pillars of rock jut out of the sand in places here.",
      "The hot wind is constantly stirring up the dunes.",
      "A small oasis, surrounded by a ring of palm trees and shrubs, glistens like a gem in the midst of the parched and barren desert.",
      "The rippling sand dunes of the desert seem to shift and sway like a living entity under the scorching sun, their ever-changing shapes and patterns creating an otherworldly landscape that is both mesmerizing and unpredictable.",
      "A dry riverbed, its cracked and dusty bed lined with scattered rocks and debris, winds through the heart of the desert like a silent witness to the ebb and flow of life in this unforgiving land.",
    ];
  }
}

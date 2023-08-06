"use strict";

import type Biome from "./biome.js";

export default class DeciduousForest implements Biome {
  name: string;
  temperature: number;
  altitude: number;
  humidity: number;
  isAquatic: boolean;
  descriptions: string[];
  features: string[];

  constructor() {
    this.name = "deciduous forest";
    this.temperature = 5;
    this.altitude = 3;
    this.humidity = 5;
    this.isAquatic = false;
    this.descriptions = [
      "This is an old forest region. Some of the trees here are bigger around than ten men linking arms could wrap around.",
      "Deciduous trees cover this area. Thick canopies give way to the occasional meadow.",
      "This forest is filled with big oaks and ample wildlife.",
      "The canopy of leaves dance in a kaleidoscope of colors, while the playful breeze carries the sweet scent of wildflowers and the distant melodies of songbirds through the sun-dappled glades of the vibrant deciduous forest.",
      "The majestic canopy of the autumnal woodland is a riot of golden hues and fiery oranges, where the rustling leaves dance in the gentle breeze like a thousand flickering flames, while shafts of sunlight illuminate the forest floor like shards of glistening gold.",
      "The gnarled roots of the twisted trees claw at the damp earth, where the rustling of the leaves echo like the whispers of lost souls in the cold, still air of the ghostly glade.",
    ];
    this.features = [
      "There is a large meadow here within an otherwise endless expanse of trees.",
      "Large, ancient oaks grow around here.",
      "Ash and oak trees are common here.",
      "There are some truly ancient trees in the forest here.",
      "The rustling of the leaves in the murky forest sends chills down the spine, as if some unknown malevolent force is lurking within the shadows, waiting to strike at any moment.",
      "The gentle rustling of the leaves reveals a hidden brook, its clear waters winding its way through the heart of the forest like a silvery serpent.",
      "The gentle babble of a meandering stream carves a winding path through the heart of the autumnal woodland, offering a serene contrast to the chaotic jumble of fallen leaves and tangled underbrush.",
      "The dense understory of the deciduous forest is alive with a profusion of wildflowers and shrubs, creating a tapestry of color and texture beneath the towering canopy.",
      "The gnarled roots of an ancient oak tree, twisting and turning like the tentacles of some primordial beast, seem to anchor the very essence of the forest to the earth.",
      "The twisted vines that hang from the ancient trees in the heart of the deciduous forest form an intricate web of life, offering both a sanctuary for hidden creatures and a formidable barrier to those who dare to trespass.",
    ];
  }
}

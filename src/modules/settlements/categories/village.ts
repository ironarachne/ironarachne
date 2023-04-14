'use strict';

import SettlementCategory from './category';

export default class Village extends SettlementCategory {
  constructor() {
    super();
    this.name = 'village';
    this.minSize = 50;
    this.maxSize = 499;
    this.sizeClass = 'small';
    this.possibleDescriptions = [
      'There is a single inn, a blacksmith, and a few houses in town, with farms surrounding it. Smoke rises from the chimneys, and the sound of animals can be heard in the distance.',
      'This is a dense collection of farms with a number of communal buildings in the center, including a mill and a chapel. The farms are surrounded by low stone walls to protect them from marauding animals.',
      'A knot of communal buildings marks the center of this village, including a town hall and a small market. The farms radiate out in a rough circle around it, with a stream running through the center of the village.',
      'The village is nestled in a valley, surrounded by rolling hills covered in fields of wheat and barley. A small stream winds through the center of town, and the air is fragrant with the smell of fresh-baked bread.',
      'The village is built on the side of a hill, with narrow paths winding between the houses. The buildings are made of wood and thatch, and are tightly packed together for warmth and protection from the wind.',
      'The village is known for its skilled weavers, and the sound of looms can be heard from many of the houses. The weavers work with colorful threads, creating intricate patterns in their textiles.',
      'Despite its small size, the village has a strong sense of community, with neighbors looking out for one another and coming together for festivals and celebrations throughout the year.',
    ];
  }
}

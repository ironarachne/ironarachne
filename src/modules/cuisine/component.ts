'use strict';

export default class FoodComponent {
  name: string;
  flavors: string[];
  textures: string[];
  colors: string[];
  category: string;

  constructor(
    name: string,
    flavors: string[],
    textures: string[],
    colors: string[],
    category: string,
  ) {
    this.name = name;
    this.flavors = flavors;
    this.textures = textures;
    this.colors = colors;
    this.category = category;
  }
}

'use strict';

export default class Cuisine {
  name: string;
  description: string;
  flavors: string[];
  preparations: string[];
  ingredients: string[];

  constructor() {
    this.name = '';
    this.description = '';
    this.flavors = [];
    this.preparations = [];
    this.ingredients = [];
  }
}

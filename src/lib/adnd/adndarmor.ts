"use strict";

export default class ADNDArmor {
  name: string;
  ac: number;
  weight: number;
  cost: number;

  constructor(name: string, ac: number, weight: number, cost: number) {
    this.name = name;
    this.ac = ac;
    this.weight = weight;
    this.cost = cost;
  }
}

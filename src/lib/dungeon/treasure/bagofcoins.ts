import type Item from "../../equipment/item.js";

export default class BagOfCoins implements Item {
  name: string;
  description: string;
  value: number;
  quality: number;
  tags: string[];

  constructor() {
    this.name = "a bag of coins";
    this.description = "a bag of coins";
    this.value = 10;
    this.quality = 1;
    this.tags = ["bag of coins"];
  }
}

export default class Weapon {
  name: string;
  maker: string;
  damage: string;
  effects: string[];
  cosmetics: string[];
  description: string;

  constructor() {
    this.name = "";
    this.maker = "";
    this.damage = "";
    this.effects = [];
    this.cosmetics = [];
    this.description = "";
  }
}

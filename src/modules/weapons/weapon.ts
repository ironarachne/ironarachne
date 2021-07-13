export default class Weapon {
  name: string;
  maker: string;
  damage: string;
  effects: string;
  description: string;

  constructor(name: string, maker: string, damage: string, effects: string, description: string) {
    this.name = name;
    this.maker = maker;
    this.damage = damage;
    this.effects = effects;
    this.description = description;
  }
}

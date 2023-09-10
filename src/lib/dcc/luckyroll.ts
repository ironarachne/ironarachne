export default class DCCLuckyRoll {
  name: string;
  description: string;
  modifier: number;
  apply: Function;

  constructor(name: string, description: string, apply: Function) {
    this.name = name;
    this.description = description;
    this.apply = apply;
  }
}

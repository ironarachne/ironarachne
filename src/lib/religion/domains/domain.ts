export default class Domain {
  name: string;
  holyItems: string[];
  holySymbols: string[];
  weaponEffects: string[];
  otherEffects: string[];

  constructor() {
    this.name = "";
    this.holyItems = [];
    this.holySymbols = [];
    this.weaponEffects = [];
    this.otherEffects = [];
  }
}

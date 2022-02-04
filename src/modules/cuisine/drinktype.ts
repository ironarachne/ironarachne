export class DrinkType {
  name: string;
  strengthMin: number;
  strengthMax: number;
  costMin: number;
  costMax: number;
  appearances: string[];

  constructor(
    name: string,
    strengthMin: number,
    strengthMax: number,
    costMin: number,
    costMax: number,
    appearances: string[],
  ) {
    this.name = name;
    this.strengthMin = strengthMin;
    this.strengthMax = strengthMax;
    this.costMin = costMin;
    this.costMax = costMax;
    this.appearances = appearances;
  }
}

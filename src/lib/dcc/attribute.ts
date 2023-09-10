export default class DCCAttribute {
  value: number;
  modifier: number;

  constructor(value: number) {
    this.value = value;

    const values = [-3, -3, -3, -3, -2, -2, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3];

    this.modifier = values[value];
  }
}

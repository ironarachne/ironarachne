export default class ChargeGroupArrangement {
  name: string;
  numberOfCharges: number;
  blazonPattern: string;
  renderSVG: Function;

  constructor(name: string, numberOfCharges: number, blazonPattern: string, renderSVG: Function) {
    this.name = name;
    this.numberOfCharges = numberOfCharges;
    this.blazonPattern = blazonPattern;
    this.renderSVG = renderSVG;
  }
}

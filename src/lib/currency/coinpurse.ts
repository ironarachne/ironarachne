"use strict";

export default class CoinPurse {
  cp: number;
  sp: number;
  gp: number;
  ep: number;
  pp: number;

  constructor() {
    this.cp = 0;
    this.sp = 0;
    this.gp = 0;
    this.ep = 0;
    this.pp = 0;
  }

  toString(): string {
    let result = "";

    if (this.pp > 0) {
      result += this.pp + " pp ";
    }

    if (this.gp > 0) {
      result += this.gp + " gp ";
    }

    if (this.ep > 0) {
      result += this.ep + " ep ";
    }

    if (this.sp > 0) {
      result += this.sp + " sp ";
    }

    if (this.cp > 0) {
      result += this.cp + " cp ";
    }

    return result.trim();
  }
}

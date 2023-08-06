"use strict";

export default class Claim {
  claimantName: string;
  claimantId: number; // an array index
  status: string;

  constructor() {
    this.claimantName = "";
    this.claimantId = 0;
    this.status = "unpressed";
  }
}

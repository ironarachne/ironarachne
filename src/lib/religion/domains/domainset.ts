"use strict";

import Domain from "./domain.js";

export default class DomainSet {
  primary: Domain;
  secondaries: Domain[];

  constructor() {
    this.primary = new Domain();
    this.secondaries = [];
  }
}

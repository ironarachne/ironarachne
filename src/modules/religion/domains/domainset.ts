"use strict";

import Domain from "./domain";

export default class DomainSet {
  primary: Domain;
  secondaries: Domain[];

  constructor() {
    this.secondaries = [];
  }
}

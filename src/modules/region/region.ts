"use strict";

import Environment from "../environment/environment";
import Nation from "../nations/nation";
import Subdivision from "../nations/subdivision";
import Organization from "../organizations/organization";
import Town from "../towns/town";

export default class Region {
  name: string;
  environment: Environment;
  description: string;
  towns: Town[];
  claimants: Nation[];
  sovereign: Subdivision;
  organizations: Organization[];

  constructor(name: string, environment: Environment, description: string, towns: Town[], claimants: Nation[], sovereign: Subdivision, organizations: Organization[]) {
    this.name = name;
    this.environment = environment;
    this.description = description;
    this.towns = towns;
    this.claimants = claimants;
    this.sovereign = sovereign;
    this.organizations = organizations;
  }
}

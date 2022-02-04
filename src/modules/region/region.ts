"use strict";

import Environment from "../environment/environment";
import Nation from "../nations/nation";
import Subdivision from "../nations/subdivision";
import Organization from "../organizations/organization";
import Settlement from "../settlements/settlement";

export default class Region {
  name: string;
  environment: Environment;
  description: string;
  settlements: Settlement[];
  claimants: Nation[];
  sovereign: Subdivision;
  organizations: Organization[];

  constructor(name: string, environment: Environment, description: string, settlements: Settlement[], claimants: Nation[], sovereign: Subdivision, organizations: Organization[]) {
    this.name = name;
    this.environment = environment;
    this.description = description;
    this.settlements = settlements;
    this.claimants = claimants;
    this.sovereign = sovereign;
    this.organizations = organizations;
  }
}

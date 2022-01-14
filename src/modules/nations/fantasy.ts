"use strict";

import * as RND from "../random";
import Nation from "./nation";
import NationGenerator from "./generator";
import KingdomGenerator from "./kingdoms/generator";
import FantasyRegionsGenerator from "../names/generators/fantasyregions";
import EmpireGenerator from "./empires/generator";

export function generate(): Nation {
  const generator = RND.item(allGenerators());

  const nameGenerator = new FantasyRegionsGenerator();

  return generator.generate(nameGenerator);
}

function allGenerators(): NationGenerator[] {
  return [
    new KingdomGenerator(),
    new EmpireGenerator(),
  ]
}

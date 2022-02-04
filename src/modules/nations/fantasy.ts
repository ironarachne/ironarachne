"use strict";

import * as RND from "../random";
import Nation from "./nation";
import NationGenerator from "./generator";
import KingdomGenerator from "./kingdoms/generator";
import EmpireGenerator from "./empires/generator";
import FantasySet from "../names/cultures/fantasy";

export function generate(): Nation {
  const generator = RND.item(allGenerators());

  const genSet = new FantasySet();

  const nameGenerator = genSet.country;

  return generator.generate(nameGenerator);
}

function allGenerators(): NationGenerator[] {
  return [
    new KingdomGenerator(),
    new EmpireGenerator(),
  ]
}

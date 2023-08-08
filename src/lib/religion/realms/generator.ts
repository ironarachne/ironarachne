"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import * as AppearanceTraits from "../appearancetraits.js";
import type RealmGeneratorConfig from "./generatorconfig.js";
import type Realm from "./realm.js";
import type RealmConcept from "./realmconcept.js";
import * as RealmConcepts from "./realmconcepts.js";
import * as Realms from "./realms.js";

export default class RealmGenerator {
  config: RealmGeneratorConfig;

  constructor(config: RealmGeneratorConfig) {
    this.config = config;
  }

  generate(): Realm[] {
    const realms = [];

    const numberOfRealms = this.config.numberOfRealms;

    let allConcepts: RealmConcept[] = JSON.parse(JSON.stringify(RealmConcepts.realmConcepts));
    allConcepts = RND.shuffle(allConcepts);

    for (let i = 0; i < numberOfRealms; i++) {
      const concept = allConcepts.pop();

      if (typeof concept == "object") {
        const realmName = RND.item(concept.nameOptions);

        const appearanceTraits = AppearanceTraits.byRealmConcept(concept);

        if (appearanceTraits.length < 1) {
          throw new Error(`No appearance traits found for realm concept ${concept.name}.`);
        }

        let description = RND.item(concept.descriptionOptions).replace(
          "{name}",
          Words.uncapitalize(realmName),
        );
        description = Words.capitalize(description);

        const realm = Realms.newRealm(realmName, description, [], appearanceTraits);

        realms.push(realm);
      }
    }

    return realms;
  }
}

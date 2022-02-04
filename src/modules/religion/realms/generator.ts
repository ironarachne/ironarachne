'use strict';

import RealmGeneratorConfig from './generatorconfig';
import Realm from './realm';
import * as AppearanceTraits from '../appearancetraits';
import * as RealmConcepts from './realmconcepts';
import * as RND from '../../random';
import * as Words from '../../words';

export default class RealmGenerator {
  config: RealmGeneratorConfig;

  constructor(config: RealmGeneratorConfig) {
    this.config = config;
  }

  generate(): Realm[] {
    const realms = [];

    const numberOfRealms = this.config.numberOfRealms;

    let allConcepts = RealmConcepts.all();
    allConcepts = RND.shuffle(allConcepts);

    for (let i = 0; i < numberOfRealms; i++) {
      const concept = allConcepts.pop();

      if (typeof concept == 'object') {
        const realmName = RND.item(concept.nameOptions);

        const appearanceTraits = AppearanceTraits.getAllAppearanceTraitsForRealmConcept(concept);

        let description = RND.item(concept.descriptionOptions).replace(
          '{name}',
          Words.uncapitalize(realmName),
        );
        description = Words.capitalize(description);

        const realm = new Realm(realmName, description, [], appearanceTraits);

        realms.push(realm);
      }
    }

    return realms;
  }
}

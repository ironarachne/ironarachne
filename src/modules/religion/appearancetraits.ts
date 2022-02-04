'use strict';

import * as AppearanceTrait from '../appearance';
import RealmConcept from './realms/realmconcept';

export function all() {
  return [
    new AppearanceTrait.AppearanceTrait('six feathered wings', 'wings', ['sky']),
    new AppearanceTrait.AppearanceTrait('four feathered wings', 'wings', ['sky']),
    new AppearanceTrait.AppearanceTrait('two large feathered wings', 'wings', ['sky']),
    new AppearanceTrait.AppearanceTrait('large leathery wings', 'wings', ['sky', 'death']),
    new AppearanceTrait.AppearanceTrait("a lion's tail'", 'tail', ['earth', 'forest']),
    new AppearanceTrait.AppearanceTrait('a whip-like tail', 'tail', ['earth', 'death']),
    new AppearanceTrait.AppearanceTrait('two tails', 'tail', ['alien']),
    new AppearanceTrait.AppearanceTrait('the horns of a goat', 'horns', ['earth', 'forest']),
    new AppearanceTrait.AppearanceTrait('the horns of a ram', 'horns', ['earth', 'forest']),
    new AppearanceTrait.AppearanceTrait('the antlers of a stag', 'horns', ['forest']),
    new AppearanceTrait.AppearanceTrait('the antlers of a deer', 'horns', ['forest']),
    new AppearanceTrait.AppearanceTrait('short, pointed horns', 'horns', ['earth', 'death']),
    new AppearanceTrait.AppearanceTrait('tall, straight horns', 'horns', ['earth', 'death']),
    new AppearanceTrait.AppearanceTrait('glowing blue eyes', 'eyes', ['water']),
    new AppearanceTrait.AppearanceTrait('glowing yellow eyes', 'eyes', ['sky', 'water']),
    new AppearanceTrait.AppearanceTrait('glowing red eyes', 'eyes', ['earth', 'death', 'alien']),
    new AppearanceTrait.AppearanceTrait('glowing orange eyes', 'eyes', ['earth', 'sky']),
    new AppearanceTrait.AppearanceTrait('eyes that burn with an inner fire', 'eyes', ['sky']),
    new AppearanceTrait.AppearanceTrait('four eyes', 'eyes', ['alien']),
    new AppearanceTrait.AppearanceTrait('six eyes', 'eyes', ['alien']),
    new AppearanceTrait.AppearanceTrait('eight eyes', 'eyes', ['alien']),
    new AppearanceTrait.AppearanceTrait('no eyes', 'eyes', ['death', 'alien']),
    new AppearanceTrait.AppearanceTrait('reptilian eyes', 'eyes', ['forest', 'earth']),
    new AppearanceTrait.AppearanceTrait('scales instead of skin', 'skin', ['earth', 'forest']),
    new AppearanceTrait.AppearanceTrait('skin that glows faintly', 'skin', ['sky']),
    new AppearanceTrait.AppearanceTrait('skin made of living rock', 'skin', ['earth']),
    new AppearanceTrait.AppearanceTrait('blue skin', 'skin', ['water']),
    new AppearanceTrait.AppearanceTrait('green skin', 'skin', ['water']),
    new AppearanceTrait.AppearanceTrait('crystalline skin', 'skin', ['earth']),
    new AppearanceTrait.AppearanceTrait('translucent grey skin', 'skin', ['death']),
    new AppearanceTrait.AppearanceTrait('dull grey skin', 'skin', ['death']),
    new AppearanceTrait.AppearanceTrait('skin covered in leaves', 'skin', ['forest']),
    new AppearanceTrait.AppearanceTrait('skin made of star-lit blackness', 'skin', ['alien']),
    new AppearanceTrait.AppearanceTrait('eight tentacles', 'tentacles', ['alien']),
    new AppearanceTrait.AppearanceTrait('six tentacles', 'tentacles', ['alien']),
    new AppearanceTrait.AppearanceTrait('four tentacles', 'tentacles', ['alien']),
    new AppearanceTrait.AppearanceTrait('the head of a lion', 'head', ['forest']),
    new AppearanceTrait.AppearanceTrait('the head of a bear', 'head', ['forest']),
    new AppearanceTrait.AppearanceTrait('the head of a dragon', 'head', ['earth', 'forest']),
    new AppearanceTrait.AppearanceTrait('the head of a swan', 'head', ['sky', 'water']),
    new AppearanceTrait.AppearanceTrait('the head of a deer', 'head', ['forest']),
    new AppearanceTrait.AppearanceTrait('the head of a cat', 'head', ['earth', 'desert']),
    new AppearanceTrait.AppearanceTrait('the head of a wolf', 'head', ['earth', 'forest']),
  ];
}

export function getAllAppearanceTraitsForRealmConcept(concept: RealmConcept) {
  const traits = all();

  let result: AppearanceTrait.AppearanceTrait[] = [];

  for (let i = 0; i < concept.appearanceTags.length; i++) {
    const discovered = AppearanceTrait.getAllTraitsWithTag(traits, concept.appearanceTags[i]);

    result = [...result, ...discovered];
  }

  return result;
}

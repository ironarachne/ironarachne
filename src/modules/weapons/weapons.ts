import WeaponType from './type';
import Weapon from './weapon';
import * as RND from '../random';
import * as Words from '../words';
import random from 'random';
import cloneDeep from 'lodash/cloneDeep';

export function generate(weaponType: WeaponType, maker: string) {
  let description = randomDescription(weaponType);

  const damage = weaponType.damageType;

  const effects = '';

  const name = '';

  return new Weapon(name, maker, damage, effects, description);
}

function randomDescription(weaponType: WeaponType): string {
  let description = RND.item(weaponType.bases) + ' has ';

  let cosmetics = randomCosmetics(weaponType);

  description += Words.arrayToPhrase(cosmetics) + '. It ';

  let effects = randomEffects(weaponType);

  description += Words.arrayToPhrase(effects) + '.';

  return description;
}

function randomCosmetics(weaponType: WeaponType): string[] {
  let cosmetics = [];

  const numberOfCosmetics = random.int(1, 3);

  let possibleCosmetics = cloneDeep(weaponType.cosmetics);
  possibleCosmetics = RND.shuffle(possibleCosmetics);

  for (let i = 0; i < numberOfCosmetics; i++) {
    let cosmetic = possibleCosmetics.pop();
    cosmetics.push(RND.item(cosmetic.options));
  }

  return cosmetics;
}

function randomEffects(weaponType: WeaponType): string[] {
  let effects = [];

  const numberOfEffects = random.int(1, 3);

  let possibleEffects = cloneDeep(weaponType.effects);
  possibleEffects = RND.shuffle(possibleEffects);

  for (let i = 0; i < numberOfEffects; i++) {
    let effect = possibleEffects.pop();
    effects.push(RND.item(effect.options));
  }

  return effects;
}

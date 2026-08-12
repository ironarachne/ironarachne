import * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import type { WeaponGeneratorConfig } from './config';
import type { WeaponType, WeaponComponent, Weapon } from './weapons';

export function describe(weapon: Weapon, weaponType: WeaponType, rng: RNG): string {
  let description = `${rng.item(weaponType.bases)} `;

  description += `${Words.arrayToPhrase(weapon.effects)} and has `;
  description += `${Words.arrayToPhrase(weapon.cosmetics)}.`;

  return description;
}

export function generate(config: WeaponGeneratorConfig): Weapon {
  const rng = config.rng;
  const weaponType = rng.item(config.weaponTypes);
  const nameGenerator = MUN.getModelNumberNameGenerator(rng);
  const weapon: Weapon = {
    name: `${nameGenerator.generate(1)[0]} ${weaponType.name}`,
    maker: '',
    damage: weaponType.damageType,
    cosmetics: randomCosmetics(weaponType, rng),
    effects: randomEffects(weaponType, rng),
    description: '',
  };

  weapon.description = describe(weapon, weaponType, rng);

  return weapon;
}

export function randomCosmetics(weaponType: WeaponType, rng: RNG): string[] {
  return randomComponentOptions(weaponType.cosmetics, rng);
}

export function randomEffects(weaponType: WeaponType, rng: RNG): string[] {
  return randomComponentOptions(weaponType.effects, rng);
}

function randomComponentOptions(components: WeaponComponent[], rng: RNG): string[] {
  const chosen: string[] = [];

  const numberToPick = rng.int(1, 3);

  const names = rng.shuffle(components.map((component) => component.name));

  for (let i = 0; i < numberToPick; i++) {
    const name = names.pop();
    const component = findLastComponentByName(components, name);

    if (component !== undefined) {
      chosen.push(rng.item(component.options));
    }
  }

  return chosen;
}

function findLastComponentByName(
  components: WeaponComponent[],
  name: string | undefined,
): WeaponComponent | undefined {
  let found: WeaponComponent | undefined;

  for (const component of components) {
    if (component.name === name) {
      found = component;
    }
  }

  return found;
}

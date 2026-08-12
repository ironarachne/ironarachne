import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import * as Text from '$lib/format';
import { ASSET_TEMPLATES } from './asset_data';
import { CAREERS } from './career_data';
import { ORIGINS } from './origin_data';

export type UWCharacter = {
  descriptors: string;
  stats: StatBlock;
  careers: Career[];
  origin: Origin;
  skills: Skill[];
  workspace: Workspace;
  advancement: string;
  assets: Asset[];
  firstName: string;
  lastName: string;
};

export function createUwCharacter(
  stats: StatBlock,
  careers: Career[],
  origin: Origin,
  workspace: Workspace,
): UWCharacter {
  return {
    stats,
    careers,
    origin,
    descriptors: '',
    skills: [],
    workspace,
    advancement: '',
    assets: [],
    firstName: '',
    lastName: '',
  };
}

export function generate(rng: RNG.RNG): UWCharacter {
  const stats = randomStats(rng);
  const careers = randomCareers(rng);
  const origin = randomOrigin(rng);
  const workspaceOptions = careers[0].workspaces.concat(careers[1].workspaces);

  const workspace = rng.item(workspaceOptions);

  const character = createUwCharacter(stats, careers, origin, workspace);

  const descriptors = [];
  descriptors.push(rng.item(character.careers[0].descriptors));
  descriptors.push(rng.item(character.careers[1].descriptors));
  descriptors.push(rng.item(character.origin.descriptors));

  character.descriptors = Words.arrayToPhrase(descriptors);

  const skills: Skill[] = [];
  let careerSkills = character.careers[0].skills.concat(character.careers[1].skills);

  careerSkills = rng.shuffle(careerSkills);

  for (let i = 0; i < 3; i++) {
    const newSkill = careerSkills.pop();
    if (!newSkill) {
      continue;
    }
    skills.push(newSkill);
  }

  const originSkills = rng.shuffle(character.origin.skills);
  const originSkill = originSkills.pop();
  if (originSkill) {
    skills.push(originSkill);
  }

  character.skills = skills;

  const advancements = character.careers[0].advancements.concat(character.careers[1].advancements);

  character.advancement = rng.item(advancements);

  character.assets = randomAssets(rng);

  if (skillsInclude('Custom Flyer', character.skills)) {
    const customFlyer = randomAssetOfType('Flyer', 3, rng);
    character.assets.push(customFlyer);
  }

  if (skillsInclude('Custom Vehicle', character.skills)) {
    const customVehicle = randomAssetOfType('Land Vehicle', 3, rng);
    character.assets.push(customVehicle);
  }

  if (skillsInclude('Leadership', character.skills)) {
    const crew = randomAssetOfType('Crew', 3, rng);
    character.assets.push(crew);
  }

  if (skillsInclude('Unique Weapon', character.skills)) {
    const weaponType = rng.item(['Firearm', 'Heavy Weapon']);

    const uniqueWeapon = randomAssetOfType(weaponType, 3, rng);
    character.assets.push(uniqueWeapon);
  }

  return character;
}

export type AssetType = {
  name: string;
  description: string;
};

export function createAssetType(name: string, description: string): AssetType {
  return { name, description };
}

// UpgradeWithExtras carries the same three fields as Upgrade; the two differ
// only in whether the caller sets extraUpgrades or takes the zero default.
export type Upgrade = {
  name: string;
  description: string;
  extraUpgrades: number;
};

export type UpgradeWithExtras = Upgrade;

export function createUpgrade(name: string, description: string): Upgrade {
  return { name, description, extraUpgrades: 0 };
}

export function createUpgradeWithExtras(
  name: string,
  description: string,
  extraUpgrades: number,
): UpgradeWithExtras {
  return { name, description, extraUpgrades };
}

export type AssetTemplate = {
  name: string;
  types: AssetType[];
  commonTraits: Upgrade[];
  upgrades: Upgrade[];
};

export function createAssetTemplate(
  name: string,
  types: AssetType[],
  commonTraits: Upgrade[],
  upgrades: Upgrade[],
): AssetTemplate {
  return { name, types, commonTraits, upgrades };
}

export type Asset = {
  name: string;
  description: string;
  assetClass: number;
  type: AssetType;
  upgrades: Upgrade[];
};

export function createAsset(
  name: string,
  description: string,
  assetClass: number,
  type: AssetType,
  upgrades: Upgrade[],
): Asset {
  return { name, description, assetClass, type, upgrades };
}

/**
 * The asset table itself — shared and read-only.
 *
 * Callers must copy any template they intend to build from, because building shuffles a
 * template's `upgrades` in place and pops the ones it hands out; working on the table directly
 * would reorder it and gradually empty it for everyone after. `chosenTemplate` does that copying,
 * so prefer it over reaching into this list.
 */
function allAssets(): AssetTemplate[] {
  return ASSET_TEMPLATES;
}

/**
 * A private copy of one template, ready to be taken apart.
 *
 * Only the chosen row is copied. Cloning the whole table per asset cost far more than it saved,
 * since a character uses four templates out of nine and discards the rest.
 */
function chosenTemplate(template: AssetTemplate): AssetTemplate {
  return structuredClone(template);
}

function randomAssets(rng: RNG.RNG) {
  const assets = [];

  const attireAsset = randomAssetOfType('Attire', 0, rng);
  const asset1 = randomAsset(1, rng);
  const asset2 = randomAsset(1, rng);
  const asset3 = randomAsset(2, rng);

  assets.push(attireAsset);
  assets.push(asset1);
  assets.push(asset2);
  assets.push(asset3);

  return assets;
}

function randomAsset(assetClass: number, rng: RNG.RNG) {
  const all = allAssets();

  const assetTemplate = chosenTemplate(rng.item(all));
  const upgrades = [];

  let possibleUpgrades: Upgrade[] = [];
  let description = '';
  let extraUpgrades = 0;

  if (assetTemplate.upgrades.length > 0) {
    possibleUpgrades = rng.shuffle(assetTemplate.upgrades);
  }

  if (assetTemplate.commonTraits.length > 0) {
    for (let i = 0; i < assetTemplate.commonTraits.length; i++) {
      if (assetTemplate.commonTraits[i].extraUpgrades > 0) {
        extraUpgrades++;
      }
      upgrades.push(assetTemplate.commonTraits[i]);
    }
  }

  if (possibleUpgrades.length > 0) {
    for (let i = 0; i < assetClass + extraUpgrades; i++) {
      const upgrade = possibleUpgrades.pop();
      upgrades.push(upgrade);
    }
  }

  let assetName = `Class ${assetClass} ${assetTemplate.name}`;
  let assetType = createAssetType(assetTemplate.name, '');

  if (assetTemplate.name.includes('Kit')) {
    assetName = assetTemplate.name;
  }

  if (assetTemplate.types.length > 0) {
    assetType = rng.item(assetTemplate.types);
    assetName += ` (${assetType.name})`;
    description = assetType.description;
  }

  return createAsset(assetName, description, assetClass, assetType, upgrades as Upgrade[]);
}

function randomAssetOfType(assetTypeName: string, assetClass: number, rng: RNG.RNG) {
  const all = allAssets();

  const options = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].name === assetTypeName) {
      options.push(all[i]);
    }
  }

  const assetTemplate = chosenTemplate(rng.item(options));
  const upgrades = [];

  let description = '';
  let extraUpgrades = 0;

  if (assetTemplate.commonTraits.length > 0) {
    for (let i = 0; i < assetTemplate.commonTraits.length; i++) {
      if (assetTemplate.commonTraits[i].extraUpgrades > 0) {
        extraUpgrades++;
      }
      upgrades.push(assetTemplate.commonTraits[i]);
    }
  }

  const possibleUpgrades = rng.shuffle(assetTemplate.upgrades);

  for (let i = 0; i < assetClass + extraUpgrades; i++) {
    const upgrade = possibleUpgrades.pop();
    upgrades.push(upgrade);
  }

  let assetName = `Class ${assetClass} ${assetTemplate.name}`;
  let chosenAssetType = createAssetType(assetTemplate.name, '');

  if (assetTemplate.types.length > 0) {
    chosenAssetType = rng.item(assetTemplate.types);
    assetName += ` (${chosenAssetType.name})`;
    description = chosenAssetType.description;
  }

  return createAsset(assetName, description, assetClass, chosenAssetType, upgrades as Upgrade[]);
}

export type Career = {
  name: string;
  descriptors: string[];
  workspaces: Workspace[];
  advancements: string[];
  skills: Skill[];
};

export function createCareer(
  name: string,
  descriptors: string[],
  workspaces: Workspace[],
  advancements: string[],
  skills: Skill[],
): Career {
  return { name, descriptors, workspaces, advancements, skills };
}

export type Skill = {
  name: string;
  description: string;
};

export function createSkill(name: string, description: string): Skill {
  return { name, description };
}

export type Workspace = {
  name: string;
  description: string;
};

export function createWorkspace(name: string, description: string): Workspace {
  return { name, description };
}

/** The career table itself — shared and read-only. See `allAssets` on copying before you mutate. */
function allCareers(): Career[] {
  return CAREERS;
}

function randomCareers(rng: RNG.RNG) {
  // The shuffle reorders its argument in place and the pops drain it, so both work on a copy of
  // the list. It only has to be shallow: nothing here disturbs the career objects themselves,
  // and the two that are kept are copied properly on the way out.
  const careers = rng.shuffle([...allCareers()]);

  const careerOne = careers.pop();
  const careerTwo = careers.pop();

  const result = [];

  if (typeof careerOne === 'object') {
    result.push(structuredClone(careerOne));
  }

  if (typeof careerTwo === 'object') {
    result.push(structuredClone(careerTwo));
  }

  return result;
}

export type Origin = {
  name: string;
  descriptors: string[];
  skills: Skill[];
};

export function createOrigin(name: string, descriptors: string[], skills: Skill[]): Origin {
  return { name, descriptors, skills };
}

/**
 * A copy of the chosen origin, for the same reason `allAssets` copies: `generate` shuffles the
 * origin's `skills` in place and pops the one it keeps.
 */
function randomOrigin(rng: RNG.RNG): Origin {
  return structuredClone(rng.item(ORIGINS));
}

export type StatBlock = {
  physique: number;
  mettle: number;
  expertise: number;
  influence: number;
  interface: number;
};

export function createStatBlock(): StatBlock {
  return {
    physique: 0,
    mettle: 0,
    expertise: 0,
    influence: 0,
    interface: 0,
  };
}

function randomStats(rng: RNG.RNG) {
  let stats = [2, 1, 1, 0, -1];

  const statBlock = createStatBlock();

  stats = rng.shuffle(stats);

  statBlock.physique = stats[0];
  statBlock.mettle = stats[1];
  statBlock.expertise = stats[2];
  statBlock.influence = stats[3];
  statBlock.interface = stats[4];

  return statBlock;
}

function skillsInclude(skillName: string, skills: Skill[]) {
  let includes = false;

  skills.forEach((element) => {
    if (element.name === skillName) {
      includes = true;
    }
  });

  return includes;
}

function formatStat(stat: number) {
  if (stat > -1) {
    return `+${stat}`;
  }

  return `${stat}`;
}

export function formatAsText(character: UWCharacter) {
  let description = Text.header('Uncharted Worlds Character');

  const displayName = `${character.firstName} ${character.lastName}`.trim();
  if (displayName) {
    description += `Name: ${displayName}\n`;
  }

  description += Text.header('Statistics');

  description += `Physique: ${formatStat(character.stats.physique)}\n`;
  description += `Mettle: ${formatStat(character.stats.mettle)}\n`;
  description += `Expertise: ${formatStat(character.stats.expertise)}\n`;
  description += `Influence: ${formatStat(character.stats.influence)}\n`;
  description += `Interface: ${formatStat(character.stats.interface)}\n`;

  description += Text.header('Careers');

  const careers = [];

  for (let i = 0; i < character.careers.length; i++) {
    careers.push(character.careers[i].name);
  }

  description += Text.list(careers);

  description += `Origin: ${character.origin.name}\n`;

  description += `Descriptors: ${character.descriptors}\n`;

  description += Text.header('Skills');

  for (let i = 0; i < character.skills.length; i++) {
    description += Text.header(character.skills[i].name);
    description += `${character.skills[i].description}\n`;
  }

  description += `\nAdvancement: ${character.advancement}\n`;

  description += Text.header('Assets');

  for (let i = 0; i < character.assets.length; i++) {
    description += Text.header(character.assets[i].name);

    description += `${character.assets[i].description}\n`;

    for (let j = 0; j < character.assets[i].upgrades.length; j++) {
      description +=
        character.assets[i].upgrades[j].name +
        ': ' +
        character.assets[i].upgrades[j].description +
        '\n';
    }
  }

  return description;
}

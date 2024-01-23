import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-kRdx30EW.js';
import { s as sentient, m as randomWeighted, g as generate$1, n as describe, h as human, a as getDefaultCharacterGeneratorConfig } from './characters-Pt2zWnuP.js';
import * as RND from '@ironarachne/rng';
import 'seedrandom';
import { e as getMaxAge, f as getCategoryFromAge, d as getSizeConfig } from './size_matrix-Bx8l-02o.js';
import * as MUN from '@ironarachne/made-up-names';
import random from 'random';
import './sentry-release-injection-file-o9u5woV9.js';
import '@ironarachne/words';
import './dice-mjdHVU8U.js';

function generate(config) {
  let family = {
    name: "",
    familyNameGenerator: config.rootFamilyNameGenerator,
    femaleNameGenerator: config.rootFemaleNameGenerator,
    maleNameGenerator: config.rootMaleNameGenerator,
    members: []
  };
  let genderNames = [];
  for (let i = 0; i < config.species.genders.length; i++) {
    genderNames.push(config.species.genders[i].name);
  }
  let charGenConfig = {
    speciesOptions: [config.species],
    ageCategoryNames: [config.species.ageCategories[3].name],
    familyNameGenerator: family.familyNameGenerator,
    femaleNameGenerator: family.femaleNameGenerator,
    maleNameGenerator: family.maleNameGenerator,
    genderNameOptions: genderNames,
    useAdaptiveNames: false,
    physicalTraitOverrides: []
  };
  let parent1 = {
    id: 0,
    character: generate$1(charGenConfig),
    parents: [],
    children: [],
    mate: 0
  };
  parent1.character.age += 5;
  parent1.character.description = describe(parent1.character);
  let mateGender = getMateGender(parent1.character.gender, config.species.genders);
  charGenConfig.genderNameOptions = [mateGender.name];
  let parent2 = {
    id: 1,
    character: generate$1(charGenConfig),
    parents: [],
    children: [],
    mate: 0
  };
  parent2.character.age += 5;
  parent2.character.description = describe(parent2.character);
  if (parent1.character.gender.name == config.dominantFamilyNameGender.name) {
    parent2.character.lastName = parent1.character.lastName;
    family.name = parent1.character.lastName;
  } else {
    parent1.character.lastName = parent2.character.lastName;
    family.name = parent2.character.lastName;
  }
  parent1.mate = parent2.id;
  parent2.mate = parent1.id;
  family.members.push(parent1);
  family.members.push(parent2);
  for (let i = 0; i < config.iterations; i++) {
    family = iterate(family, config);
  }
  return family;
}
function getChildren(family, parent) {
  let children = [];
  for (let i = 0; i < parent.children.length; i++) {
    children.push(family.members[parent.children[i]]);
  }
  return children;
}
function getDefaultConfig() {
  let generatorSets = MUN.allSets();
  let generatorSet = MUN.getSetByName("human", generatorSets);
  let config = {
    species: human,
    iterations: 10,
    rootFamilyNameGenerator: generatorSet.family,
    rootFemaleNameGenerator: generatorSet.female,
    rootMaleNameGenerator: generatorSet.male,
    dominantFamilyNameGender: human.genders[1]
  };
  return config;
}
function getMate(family, person) {
  return family.members[person.mate];
}
function getParents(family, person) {
  let parents = [];
  for (let i = 0; i < person.parents.length; i++) {
    parents.push(family.members[person.parents[i]]);
  }
  return parents;
}
function iterate(family, config) {
  const ageStep = 5;
  for (let i = 0; i < family.members.length; i++) {
    if (family.members[i].character.status == "alive") {
      family.members[i].character.age += ageStep;
    }
    if (family.members[i].character.age > getMaxAge(family.members[i].character.species.ageCategories)) {
      family.members[i].character.status = "dead";
    } else {
      let newAgeCategory = getCategoryFromAge(
        family.members[i].character.age,
        family.members[i].character.species.ageCategories
      );
      if (newAgeCategory.name != family.members[i].character.ageCategory.name) {
        let sizeGeneratorConfig = getSizeConfig(
          family.members[i].character.gender.name,
          newAgeCategory.name,
          family.members[i].character.species.sizeGeneratorConfigMatrix
        );
        family.members[i].character.height = random.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
        family.members[i].character.weight = random.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
      }
      family.members[i].character.ageCategory = newAgeCategory;
    }
    family.members[i].character.description = describe(family.members[i].character);
    if (family.members[i].character.status == "dead") {
      continue;
    }
    if (RND.simple(100) > 98) {
      family.members[i].character.status = "dead";
      continue;
    }
    if (needsChildren(family.members[i]) && RND.simple(100) > 30) {
      let numberOfChildren = random.int(1, 4);
      for (let j = 0; j < numberOfChildren; j++) {
        let child = getNewChild(i, family.members[i].mate, family);
        let newMember = {
          id: family.members.length,
          character: child,
          children: [],
          parents: [i, family.members[i].mate],
          mate: -1
        };
        family.members[i].children.push(newMember.id);
        family.members[family.members[i].mate].children.push(newMember.id);
        if (family.members[i].character.gender.name == config.dominantFamilyNameGender.name) {
          newMember.character.lastName = family.members[i].character.lastName;
        } else {
          newMember.character.lastName = family.members[family.members[i].mate].character.lastName;
        }
        family.members.push(newMember);
      }
    }
    if (needsMate(family.members[i]) && RND.simple(100) > 50) {
      let mate = getNewMate(family.members[i], family);
      let newMember = { id: family.members.length, character: mate, children: [], parents: [], mate: i };
      family.members[i].mate = newMember.id;
      if (family.members[i].character.gender.name == config.dominantFamilyNameGender.name) {
        newMember.character.lastName = family.members[i].character.lastName;
      } else {
        family.members[i].character.lastName = newMember.character.lastName;
      }
      family.members.push(newMember);
    }
  }
  return family;
}
function getNewChild(parent1Index, parent2Index, family) {
  let parent1 = family.members[parent1Index].character;
  let parent2 = family.members[parent2Index].character;
  let physicalTraits = parent1.physicalTraits.concat(parent2.physicalTraits);
  let uniqueNames = [];
  let traitOverrides = [];
  physicalTraits = RND.shuffle(physicalTraits);
  for (let i = 0; i < physicalTraits.length; i++) {
    if (!uniqueNames.includes(physicalTraits[i].name)) {
      traitOverrides.push(physicalTraits[i]);
      uniqueNames.push(physicalTraits[i].name);
    }
  }
  let charConfig = getDefaultCharacterGeneratorConfig();
  charConfig.speciesOptions = [parent1.species, parent2.species];
  charConfig.ageCategoryNames = ["infant", "toddler"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  let genderNames = [];
  for (let i = 0; i < parent1.species.genders.length; i++) {
    genderNames.push(parent1.species.genders[i].name);
  }
  charConfig.genderNameOptions = genderNames;
  charConfig.physicalTraitOverrides = traitOverrides;
  let child = generate$1(charConfig);
  return child;
}
function getNewMate(member, family) {
  let gender = member.character.gender;
  let charConfig = getDefaultCharacterGeneratorConfig();
  charConfig.speciesOptions = [member.character.species];
  charConfig.ageCategoryNames = ["adult"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  charConfig.genderNameOptions = [getMateGender(gender, member.character.species.genders).name];
  let mate = generate$1(charConfig);
  return mate;
}
function getMateGender(gender1, genders) {
  for (let i = 0; i < genders.length; i++) {
    if (genders[i].name != gender1.name) {
      return genders[i];
    }
  }
  return gender1;
}
function needsChildren(member) {
  if (member.mate != -1 && member.children.length == 0 && member.character.ageCategory.name == "adult") {
    return true;
  }
  return false;
}
function needsMate(member) {
  if (member.character.ageCategory.name == "adult" && member.mate == -1) {
    return true;
  }
  return false;
}
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,strong.svelte-4q74qx.svelte-4q74qx,ul.svelte-4q74qx.svelte-4q74qx,li.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}ul.svelte-4q74qx.svelte-4q74qx{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-4q74qx.svelte-4q74qx{font-size:2rem;line-height:2rem}h4.svelte-4q74qx.svelte-4q74qx{font-size:1.5rem;line-height:1.5rem}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx,select.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}ul.svelte-4q74qx li.svelte-4q74qx{list-style-type:disc;margin-left:2rem}strong.svelte-4q74qx.svelte-4q74qx{font-weight:700}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  let availableSpecies = sentient();
  let species = randomWeighted(availableSpecies);
  let iterations = 2;
  const generatorSets = MUN.allSets();
  let nameGeneratorSet;
  try {
    nameGeneratorSet = MUN.getSetByName(species.name, generatorSets);
  } catch (e) {
    console.debug(e);
    nameGeneratorSet = MUN.getSetByName("fantasy", generatorSets);
  }
  let familyNameGen = nameGeneratorSet.family;
  let femaleNameGen = nameGeneratorSet.female;
  let maleNameGen = nameGeneratorSet.male;
  let lastNameTradition = "male";
  let config = getDefaultConfig();
  config.species = species;
  config.iterations = iterations;
  config.rootFamilyNameGenerator = familyNameGen;
  config.rootFemaleNameGenerator = femaleNameGen;
  config.rootMaleNameGenerator = maleNameGen;
  config.dominantFamilyNameGender = getDominantGender();
  let family = generate(config);
  function getDominantGender() {
    for (let i = 0; i < species.genders.length; i++) {
      if (species.genders[i].name == lastNameTradition) {
        return species.genders[i];
      }
    }
    throw new Error("Dominant gender not set");
  }
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1bk4f52_START -->${$$result.title = `<title>Fantasy Family Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1bk4f52_END -->`, ""} <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-9paqe3">Fantasy Family Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-x8hjq2">This generator creates a family. Note that more than 10 iterations can be quite slow. More than 30 may or may not crash your browser.</p> <div class="input-group svelte-4q74qx"><label for="seed" class="svelte-4q74qx" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-4q74qx"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-4q74qx"><label for="iterations" class="svelte-4q74qx" data-svelte-h="svelte-lyjpoa">Iterations</label> <input type="number" name="iterations" id="iterations" min="1" max="10" class="svelte-4q74qx"${add_attribute("value", iterations, 0)}></div> <div class="input-group svelte-4q74qx"><label for="species" class="svelte-4q74qx" data-svelte-h="svelte-y7oaqm">Species</label> <select id="species" class="svelte-4q74qx"><option value="any" data-svelte-h="svelte-1j2tppc">any</option>${each(availableSpecies, (option) => {
    return `<option${add_attribute("value", option.name, 0)}>${escape(option.name)}</option>`;
  })}</select></div> <div class="input-group svelte-4q74qx"><label for="last-name-tradition" class="svelte-4q74qx" data-svelte-h="svelte-3jc0s2">Last name tradition (gender)</label> <select id="last-name-tradition" class="svelte-4q74qx"><option value="male" data-svelte-h="svelte-d8mblx">male</option><option value="female" data-svelte-h="svelte-cqf8gs">female</option></select></div> <button class="svelte-4q74qx" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-4q74qx" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-4q74qx">The ${escape(family.name)} Family</h2> ${each(family.members, (member) => {
    return `<h3 class="svelte-4q74qx">${escape(member.character.firstName)} ${escape(member.character.lastName)}</h3> <p class="svelte-4q74qx">${escape(member.character.age)}-year-old ${escape(member.character.species.name)} ${escape(member.character.ageCategory.noun)} ${member.character.status == "dead" ? `(dead)` : ``}</p> <p class="svelte-4q74qx">${escape(member.character.description)}</p> ${member.mate != -1 ? `<p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1o927ut">Mate:</strong> ${escape(getMate(family, member).character.firstName)} ${escape(getMate(family, member).character.lastName)}</p>` : ``} ${member.children.length > 0 ? `<h4 class="svelte-4q74qx" data-svelte-h="svelte-1dlzx9">Children</h4> <ul class="svelte-4q74qx">${each(getChildren(family, member), (child) => {
      return `<li class="svelte-4q74qx">${escape(child.character.firstName)} ${escape(child.character.lastName)}</li>`;
    })} </ul>` : ``} ${member.parents.length > 0 ? `<h4 class="svelte-4q74qx" data-svelte-h="svelte-muh75">Parents</h4> <ul class="svelte-4q74qx">${each(getParents(family, member), (parent) => {
      return `<li class="svelte-4q74qx">${escape(parent.character.firstName)} ${escape(parent.character.lastName)}</li>`;
    })} </ul>` : ``}`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-W-s_p8Ni.js.map

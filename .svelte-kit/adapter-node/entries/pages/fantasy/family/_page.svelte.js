import { c as create_ssr_component, a as add_attribute, f as each, e as escape } from "../../../../chunks/ssr.js";
import { d as randomWeighted } from "../../../../chunks/common.js";
import { b as CharacterGeneratorConfig, C as CharacterGenerator, a as all } from "../../../../chunks/generatorconfig2.js";
import * as RND from "@ironarachne/rng";
import "seedrandom";
import "@ironarachne/made-up-names";
import "../../../../chunks/sentry-release-injection-file.js";
import random from "random";
import { g as getMaxAge, a as getCategoryFromAge } from "../../../../chunks/agecategories.js";
class FamilyGeneratorConfig {
  species;
  iterations;
  rootFamilyNameGenerator;
  rootFemaleNameGenerator;
  rootMaleNameGenerator;
  dominantFamilyNameGender;
  constructor(species, iterations, nameGenFamily, nameGenFemale, nameGenMale, dominantFamilyNameGender) {
    this.species = species;
    this.iterations = iterations;
    this.rootFamilyNameGenerator = nameGenFamily;
    this.rootFemaleNameGenerator = nameGenFemale;
    this.rootMaleNameGenerator = nameGenMale;
    this.dominantFamilyNameGender = dominantFamilyNameGender;
  }
}
class FamilyMember {
  id;
  character;
  children;
  parents;
  mate;
  constructor(id) {
    this.id = id;
    this.children = [];
    this.parents = [];
    this.mate = -1;
  }
}
class Family {
  name;
  members;
  familyNameGenerator;
  femaleNameGenerator;
  maleNameGenerator;
  constructor() {
    this.name = "";
    this.members = [];
  }
  getChildren(parent) {
    let children = [];
    for (let i = 0; i < parent.children.length; i++) {
      children.push(this.members[parent.children[i]]);
    }
    return children;
  }
  getMate(person) {
    return this.members[person.mate];
  }
  getParents(person) {
    let parents = [];
    for (let i = 0; i < person.parents.length; i++) {
      parents.push(this.members[person.parents[i]]);
    }
    return parents;
  }
}
class FamilyGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let family = new Family();
    family.familyNameGenerator = this.config.rootFamilyNameGenerator;
    family.femaleNameGenerator = this.config.rootFemaleNameGenerator;
    family.maleNameGenerator = this.config.rootMaleNameGenerator;
    let charGenConfig = new CharacterGeneratorConfig();
    charGenConfig.speciesOptions = [this.config.species];
    charGenConfig.ageCategories = ["young adult"];
    charGenConfig.familyNameGenerator = family.familyNameGenerator;
    charGenConfig.femaleNameGenerator = family.femaleNameGenerator;
    charGenConfig.maleNameGenerator = family.maleNameGenerator;
    let genderNames = [];
    for (let i = 0; i < this.config.species.genders.length; i++) {
      genderNames.push(this.config.species.genders[i].name);
    }
    charGenConfig.genderNameOptions = genderNames;
    let charGen = new CharacterGenerator(charGenConfig);
    let parent1 = new FamilyMember(0);
    parent1.character = charGen.generate();
    parent1.character.age += 5;
    parent1.character.description = charGen.describe(parent1.character);
    let mateGender = getMateGender(parent1.character.gender, this.config.species.genders);
    charGen.config.genderNameOptions = [mateGender.name];
    let parent2 = new FamilyMember(1);
    parent2.character = charGen.generate();
    parent2.character.age += 5;
    parent2.character.description = charGen.describe(parent2.character);
    if (parent1.character.gender.name == this.config.dominantFamilyNameGender.name) {
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
    for (let i = 0; i < this.config.iterations; i++) {
      family = this.iterate(family);
    }
    return family;
  }
  iterate(family) {
    const ageStep = 5;
    let charGenConfig = new CharacterGeneratorConfig();
    const charGen = new CharacterGenerator(charGenConfig);
    for (let i = 0; i < family.members.length; i++) {
      if (family.members[i].character.status == "alive") {
        family.members[i].character.age += ageStep;
      }
      if (family.members[i].character.age > getMaxAge(family.members[i].character.gender.ageCategories)) {
        family.members[i].character.status = "dead";
      } else {
        let newAgeCategory = getCategoryFromAge(
          family.members[i].character.age,
          family.members[i].character.gender.ageCategories
        );
        if (newAgeCategory.name != family.members[i].character.ageCategory.name) {
          family.members[i].character.height = newAgeCategory.randomHeight();
          family.members[i].character.weight = newAgeCategory.randomWeight();
        }
        family.members[i].character.ageCategory = newAgeCategory;
      }
      family.members[i].character.description = charGen.describe(family.members[i].character);
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
          let newMember = new FamilyMember(family.members.length);
          newMember.character = child;
          newMember.parents = [i, family.members[i].mate];
          family.members[i].children.push(newMember.id);
          family.members[family.members[i].mate].children.push(newMember.id);
          if (family.members[i].character.gender.name == this.config.dominantFamilyNameGender.name) {
            newMember.character.lastName = family.members[i].character.lastName;
          } else {
            newMember.character.lastName = family.members[family.members[i].mate].character.lastName;
          }
          family.members.push(newMember);
        }
      }
      if (needsMate(family.members[i]) && RND.simple(100) > 50) {
        let mate = getNewMate(family.members[i], family);
        let newMember = new FamilyMember(family.members.length);
        newMember.character = mate;
        newMember.mate = i;
        family.members[i].mate = newMember.id;
        if (family.members[i].character.gender.name == this.config.dominantFamilyNameGender.name) {
          newMember.character.lastName = family.members[i].character.lastName;
        } else {
          family.members[i].character.lastName = newMember.character.lastName;
        }
        family.members.push(newMember);
      }
    }
    return family;
  }
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
  let charConfig = new CharacterGeneratorConfig();
  charConfig.speciesOptions = [parent1.species, parent2.species];
  charConfig.ageCategories = ["infant", "toddler"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  let genderNames = [];
  for (let i = 0; i < parent1.species.genders.length; i++) {
    genderNames.push(parent1.species.genders[i].name);
  }
  charConfig.genderNameOptions = genderNames;
  charConfig.physicalTraitOverrides = traitOverrides;
  let charGen = new CharacterGenerator(charConfig);
  let child = charGen.generate();
  return child;
}
function getNewMate(member, family) {
  let gender = member.character.gender;
  let charConfig = new CharacterGeneratorConfig();
  charConfig.speciesOptions = [member.character.species];
  charConfig.ageCategories = ["adult"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  charConfig.genderNameOptions = [getMateGender(gender, member.character.species.genders).name];
  let charGen = new CharacterGenerator(charConfig);
  let mate = charGen.generate();
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
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,strong.svelte-4q74qx.svelte-4q74qx,ul.svelte-4q74qx.svelte-4q74qx,li.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}ul.svelte-4q74qx.svelte-4q74qx{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-4q74qx.svelte-4q74qx{font-size:2rem;line-height:2rem}h4.svelte-4q74qx.svelte-4q74qx{font-size:1.5rem;line-height:1.5rem}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx,select.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}ul.svelte-4q74qx li.svelte-4q74qx{list-style-type:disc;margin-left:2rem}strong.svelte-4q74qx.svelte-4q74qx{font-weight:700}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  let availableSpecies = all();
  let species = randomWeighted(availableSpecies);
  let iterations = 2;
  if (species.nameGeneratorSet.family === null) {
    throw new Error("Species does not have a family name generator.");
  }
  if (species.nameGeneratorSet.female === null) {
    throw new Error("Species does not have a female name generator.");
  }
  if (species.nameGeneratorSet.male === null) {
    throw new Error("Species does not have a male name generator.");
  }
  let familyNameGen = species.nameGeneratorSet.family;
  let femaleNameGen = species.nameGeneratorSet.female;
  let maleNameGen = species.nameGeneratorSet.male;
  let lastNameTradition = "male";
  let config = new FamilyGeneratorConfig(species, iterations, familyNameGen, femaleNameGen, maleNameGen, getDominantGender());
  let generator = new FamilyGenerator(config);
  let family = generator.generate();
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
    return `<h3 class="svelte-4q74qx">${escape(member.character.firstName)} ${escape(member.character.lastName)}</h3> <p class="svelte-4q74qx">${escape(member.character.age)}-year-old ${escape(member.character.species.name)} ${escape(member.character.ageCategory.noun)} ${member.character.status == "dead" ? `(dead)` : ``}</p> <p class="svelte-4q74qx">${escape(member.character.description)}</p> ${member.mate != -1 ? `<p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1o927ut">Mate:</strong> ${escape(family.getMate(member).character.firstName)} ${escape(family.getMate(member).character.lastName)}</p>` : ``} ${member.children.length > 0 ? `<h4 class="svelte-4q74qx" data-svelte-h="svelte-1dlzx9">Children</h4> <ul class="svelte-4q74qx">${each(family.getChildren(member), (child) => {
      return `<li class="svelte-4q74qx">${escape(child.character.firstName)} ${escape(child.character.lastName)}</li>`;
    })} </ul>` : ``} ${member.parents.length > 0 ? `<h4 class="svelte-4q74qx" data-svelte-h="svelte-muh75">Parents</h4> <ul class="svelte-4q74qx">${each(family.getParents(member), (parent) => {
      return `<li class="svelte-4q74qx">${escape(parent.character.firstName)} ${escape(parent.character.lastName)}</li>`;
    })} </ul>` : ``}`;
  })}</section>`;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map

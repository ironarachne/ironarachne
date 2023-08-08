import * as RND from '@ironarachne/rng';
import './sentry-release-injection-file-f1f7df64.js';

function modify$2(species) {
  let result = JSON.parse(JSON.stringify(species));
  let modifierName = "skeletal";
  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push("unharmed by piercing damage");
  result.tags.push("skeleton");
  result.tags.push("undead");
  result.threatLevel += 1;
  return result;
}
function modify$1(species) {
  let result = JSON.parse(JSON.stringify(species));
  let modifierName = "vampire";
  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push("drain blood to gain life");
  result.abilities.push("transform into a bat");
  result.abilities.push("transform into a wolf");
  result.abilities.push("transform into mist");
  result.abilities.push("see in the dark");
  result.abilities.push("can only be killed by a stake through the heart or by direct sunlight");
  result.tags.push("vampire");
  result.tags.push("undead");
  result.threatLevel += 5;
  return result;
}
function modify(species) {
  let result = JSON.parse(JSON.stringify(species));
  let modifierName = "zombie";
  result.name = `${modifierName} ${result.name}`;
  result.pluralName = `${modifierName} ${result.pluralName}`;
  result.adjective = `${modifierName} ${result.adjective}`;
  result.abilities.push("can only be killed by removing the head");
  let newTags = [];
  for (let i = 0; i < result.tags.length; i++) {
    if (result.tags[i] != "sentient") {
      newTags.push(result.tags[i]);
    }
  }
  result.tags = newTags;
  result.abilities.push("can bite others to transform them into zombies");
  result.tags.push("zombie");
  result.tags.push("undead");
  result.threatLevel += 1;
  return result;
}
function byTag(tag, options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(tag)) {
      result.push(options[i]);
    }
  }
  return result;
}
function getSkeletonVariants(options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    let skeleton = modify$2(options[i]);
    result.push(skeleton);
  }
  return result;
}
function getVampireVariants(options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    let vampire = modify$1(options[i]);
    result.push(vampire);
  }
  return result;
}
function getZombieVariants(options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    let zombie = modify(options[i]);
    result.push(zombie);
  }
  return result;
}
function randomUniqueSet(options, count) {
  let result = [];
  options = RND.shuffle(options);
  if (options.length >= count) {
    for (let i = 0; i < count; i++) {
      let item = options.pop();
      if (item !== void 0) {
        result.push(item);
      }
    }
  } else {
    throw new Error("Not enough options to choose from.");
  }
  return result;
}
function randomWeighted(options) {
  return RND.weighted(options);
}
function withCreatureType(creatureType, options) {
  let result = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].creatureTypes.includes(creatureType)) {
      result.push(options[i]);
    }
  }
  return result;
}

export { getVampireVariants as a, getZombieVariants as b, byTag as c, randomWeighted as d, getSkeletonVariants as g, randomUniqueSet as r, withCreatureType as w };
//# sourceMappingURL=common-696ed696.js.map

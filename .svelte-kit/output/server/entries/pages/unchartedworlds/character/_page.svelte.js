import { c as create_ssr_component, a as add_attribute, e as escape, f as each } from "../../../../chunks/ssr.js";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import "../../../../chunks/sentry-release-injection-file.js";
import random from "random";
import seedrandom from "seedrandom";
class UWCharacter {
  descriptors;
  stats;
  careers;
  origin;
  skills;
  workspace;
  advancement;
  assets;
  constructor(stats, careers, origin, workspace) {
    this.stats = stats;
    this.careers = careers;
    this.origin = origin;
    this.descriptors = "";
    this.skills = [];
    this.workspace = workspace;
    this.advancement = "";
    this.assets = [];
  }
}
function generate() {
  const stats = randomStats();
  const careers = randomCareers();
  const origin = randomOrigin();
  const workspaceOptions = careers[0].workspaces.concat(careers[1].workspaces);
  const workspace = RND.item(workspaceOptions);
  const character = new UWCharacter(stats, careers, origin, workspace);
  const descriptors = [];
  descriptors.push(RND.item(character.careers[0].descriptors));
  descriptors.push(RND.item(character.careers[1].descriptors));
  descriptors.push(RND.item(character.origin.descriptors));
  character.descriptors = Words.arrayToPhrase(descriptors);
  const skills = [];
  let careerSkills = character.careers[0].skills.concat(character.careers[1].skills);
  careerSkills = RND.shuffle(careerSkills);
  for (let i = 0; i < 3; i++) {
    const newSkill = careerSkills.pop();
    skills.push(newSkill);
  }
  const originSkills = RND.shuffle(character.origin.skills);
  skills.push(originSkills.pop());
  character.skills = skills;
  const advancements = character.careers[0].advancements.concat(character.careers[1].advancements);
  character.advancement = RND.item(advancements);
  character.assets = randomAssets();
  if (skillsInclude("Custom Flyer", character.skills)) {
    const customFlyer = randomAssetOfType("Flyer", 3);
    character.assets.push(customFlyer);
  }
  if (skillsInclude("Custom Vehicle", character.skills)) {
    const customVehicle = randomAssetOfType("Land Vehicle", 3);
    character.assets.push(customVehicle);
  }
  if (skillsInclude("Leadership", character.skills)) {
    const crew = randomAssetOfType("Crew", 3);
    character.assets.push(crew);
  }
  if (skillsInclude("Unique Weapon", character.skills)) {
    const weaponType = RND.item(["Firearm", "Heavy Weapon"]);
    const uniqueWeapon = randomAssetOfType(weaponType, 3);
    character.assets.push(uniqueWeapon);
  }
  return character;
}
class AssetType {
  name;
  description;
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}
class Upgrade {
  name;
  description;
  extraUpgrades;
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.extraUpgrades = 0;
  }
}
class UpgradeWithExtras {
  name;
  description;
  extraUpgrades;
  constructor(name, description, extraUpgrades) {
    this.name = name;
    this.description = description;
    this.extraUpgrades = extraUpgrades;
  }
}
class AssetTemplate {
  name;
  types;
  commonTraits;
  upgrades;
  constructor(name, types, commonTraits, upgrades) {
    this.name = name;
    this.types = types;
    this.commonTraits = commonTraits;
    this.upgrades = upgrades;
  }
}
class Asset {
  name;
  description;
  assetClass;
  type;
  upgrades;
  constructor(name, description, assetClass, type, upgrades) {
    this.name = name;
    this.description = description;
    this.assetClass = assetClass;
    this.type = type;
    this.upgrades = upgrades;
  }
}
function allAssets() {
  return [
    new AssetTemplate(
      "Attire",
      [
        new AssetType("Rugged", "Crude, patched, aged and worn."),
        new AssetType("Simple", "Utilitarian, favors function over looks."),
        new AssetType("Cultural", "Incorporates popular styles/elements of a culture."),
        new AssetType("Formal", "Well cut and stylish."),
        new AssetType(
          "Uniform",
          "Easily identifiable as belonging to a specific faction or group."
        )
      ],
      [],
      [
        new Upgrade("Armored", "+2 Armor."),
        new Upgrade("Carapace", "Clumsy, +3 Armor."),
        new Upgrade(
          "Comms",
          "Can receive and broadcast signals over great distances."
        ),
        new Upgrade(
          "Connected",
          "Built-in CPU with eye-piece HUD, connects wirelessly to other systems."
        ),
        new Upgrade(
          "Impressive",
          "Distinctive, intimidating, with embellishments and accessories."
        ),
        new Upgrade(
          "Jump Jets",
          "Can give small burst jumps, slow descent, and controlled flight in zero-g."
        ),
        new Upgrade("Meshweave", "+1 Armor that looks like normal fabric."),
        new Upgrade(
          "Rig",
          "Choose a Kit: That Kit is integrated in the suit. Can still carry a second Kit."
        ),
        new Upgrade("Tough", "Protects from elements, hard to damage, easy to repair."),
        new Upgrade("Sealed", "Airtight suit with helmet and oxygen tank."),
        new Upgrade(
          "Sensor",
          "Choose a type of information. The wrist screen scans for that subject."
        ),
        new Upgrade(
          "Shielded",
          "+1 Armor provided by thin, invisible energy shield projected by the suit."
        ),
        new Upgrade(
          "Stealthy",
          "Muffled, blends in to environments, difficult to pick up on scanners."
        ),
        new Upgrade("Visor", "Choose a type of information. The visor detects that subject.")
      ]
    ),
    new AssetTemplate(
      "Crew",
      [
        new AssetType(
          "Squad",
          "Disciplined and stolid. Equipped with a similar type of weaponry (pistols, stun batons, rifles, etc). Able to guard areas and engage in small-scale combat."
        ),
        new AssetType(
          "Techs",
          "Educated and well trained. Equipped with basic tools. Able to provide technical or manual assistance to a variety of scientific or engineering projects."
        ),
        new AssetType(
          "Staff",
          "Refined and professional. Able to serve guests, keep accounts, prepare meals and perform daily household chores."
        ),
        new AssetType(
          "Gang",
          "Crude and self-reliant. Equipped with a smattering of mismatched weaponry (pistols, shotguns, chains, knives, etc). Able to attack people or break things."
        )
      ],
      [],
      [
        new Upgrade(
          "Armed",
          "Choose a Class 1 Firearm. The crew is equipped with it and trained in its use."
        ),
        new Upgrade("Artillery", "Able to bombard with artillery, turrets or starship weaponry."),
        new Upgrade(
          "Athletic",
          "Graceful, swift, strong and flexible. Much better than average, physically."
        ),
        new Upgrade(
          "Beautiful",
          "Chosen for their good looks and wit. Able to distract and entertain."
        ),
        new Upgrade(
          "Builders",
          "Able to build small structures or assist in construction projects."
        ),
        new Upgrade(
          "Criminal",
          "Able to commit small-scale criminal activity or assist with larger crimes."
        ),
        new Upgrade(
          "Equipped",
          "Choose a Kit. The crew carries various tools from that kit, and can use them."
        ),
        new Upgrade(
          "Fearless",
          "Never afraid or intimidated, will follow insane orders but often go too far."
        ),
        new Upgrade("Imposing", "Imposing in some way. Able to frighten, threaten, dissuade, etc."),
        new Upgrade(
          "Informants",
          "Able to collect information and report back, or pass on information."
        ),
        new Upgrade(
          "Loyal",
          "Only take orders from you. Quickly recovers to their normal disposition."
        ),
        new Upgrade(
          "Mechanics",
          "Able to service and maintain machinery, and assist in repairs and overhauls."
        ),
        new Upgrade(
          "Medics",
          "Able to provide long-term convalescent care or assist in medical procedures."
        ),
        new Upgrade(
          "Numerous",
          "There are a large number of them, you have trouble keeping track of them all."
        ),
        new Upgrade("Rugged", "Can work in harsh climates for extended periods of time."),
        new Upgrade("Stealthy", "Able to sneak into (or out of) places, and pass unnoticed."),
        new Upgrade(
          "Teamsters",
          "Able to quickly load, unload, assemble and pack away heavy objects and cargo."
        ),
        new Upgrade("Wreckers", "Able to destroy terrain and structures.")
      ]
    ),
    new AssetTemplate(
      "Explosive",
      [
        new AssetType("Grenade", "One-handed thrown explosive. Optimal Range: Close"),
        new AssetType("Charge", "Two-handed placed explosive. Optimal Range: Melee")
      ],
      [],
      [
        new Upgrade("Breaching", "Breaches reinforced buildings and starships. Charge only."),
        new Upgrade(
          "Chemical",
          "Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc."
        ),
        new Upgrade(
          "Cluster",
          "Scatters secondary explosives in the area of effect, which then detonate."
        ),
        new Upgrade("Concealed", "Inconspicuous, easily hidden, doesn't show on scanners."),
        new Upgrade(
          "Concussive",
          "Exceptionally loud and bright. Deafens, blinds and knocks away."
        ),
        new Upgrade(
          "Destructive",
          "Causes property damage, damages machinery and vehicles. Grenade only."
        ),
        new Upgrade("Focused", "Directed high explosive force, little collateral damage."),
        new Upgrade("Haywire", "Disrupts electronic systems, scanners and advanced weaponry."),
        new Upgrade("High Yield", "Massive area of effect, city block or more. Charge only."),
        new Upgrade("Kinetic", "Heavy kinetic force that breaks bones and knocks people over."),
        new Upgrade("Plasma", "Creates a nova of incandescent energy that vaporizes matter."),
        new Upgrade("Shock", "Electrocutes, causes malfunctions in electronics and robots."),
        new Upgrade("Shrapnel", "Causes amputation, bleeding and disfigurement in a wide radius."),
        new Upgrade("Sticky", "Attaches itself to any surface, difficult to remove."),
        new Upgrade("Stun", "Non-lethal. Stuns, snares or renders unconscious."),
        new Upgrade("Stylish", "The explosion looks impressive, distinctive and unique.")
      ]
    ),
    new AssetTemplate(
      "Firearm",
      [
        new AssetType("Pistol", "One handed ranged weapon, Optimal Ranges: Adjacent, Close."),
        new AssetType("Rifle", "Two handed ranged weapon, Optimal Ranges: Close, Far.")
      ],
      [],
      [
        new Upgrade(
          "Attachment",
          "Attach Class 0 Small weapon with Sharp, Ripper, Energy or Shock."
        ),
        new Upgrade("Burst", "Instead of a single shot, sprays shots in a wide cone."),
        new Upgrade("Concealed", "Inconspicuous, easily hidden, doesn't show on scanners."),
        new Upgrade(
          "Chemical",
          "Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc."
        ),
        new Upgrade("Destructive", "Causes property damage, damages machinery and vehicles."),
        new Upgrade(
          "Explosive",
          "Loud. Causes messy wounds, property damage near the point of impact."
        ),
        new Upgrade("Impact", "Heavy kinetic force that breaks bones and knocks people over."),
        new Upgrade("Keyed", "Can only be fired by you unless you unlock it."),
        new Upgrade("Laser", "Projects focused beams of energy that can cut or melt materials."),
        new Upgrade("Launcher", "Lobbed, arcing projectile with a modest area of effect."),
        new Upgrade("Mounted", "Mounted to a forearm or shoulder rig, keeps hands free."),
        new Upgrade("Penetrating", "Ignores Armor."),
        new Upgrade("Plasma", "Fires bright bolts of supercharged, burning energy."),
        new Upgrade("Rapid Fire", "Unleashes suppressing fire at multiple targets."),
        new Upgrade("Scope", "Can fire at distant objects. Optimal Ranges: Far, Distant."),
        new Upgrade("Shock", "Electrocutes, causes malfunctions in electronics and robots."),
        new Upgrade("Shrapnel", "Causes amputation, bleeding and disfigurement in a small radius."),
        new Upgrade("Silenced", "Suppressed muzzle flash and practically silent shot."),
        new Upgrade("Stabilized", "No recoil, can be used in micro-gravity environments."),
        new Upgrade("Stun", "Non-lethal. Stuns, snares or renders unconscious."),
        new Upgrade("Stylish", "Looks impressive, distinctive and unique.")
      ]
    ),
    new AssetTemplate(
      "Flyer",
      [
        new AssetType(
          "Shuttle",
          "A tiny, maneuverable flying vehicle. Space for a pilot and at most one passenger."
        ),
        new AssetType(
          "Speeder",
          "A flying vehicle for up to six people that can hover and take off vertically."
        )
      ],
      [],
      [
        new Upgrade("Agile", "Quick, maneuverable, able to perform stunts."),
        new Upgrade("Armored", "+2 Armor."),
        new Upgrade(
          "Armed",
          "A heavy weapon (purchased separately) attached to the vehicle, fired by the pilot."
        ),
        new Upgrade("Controlled", "Can be remotely activated and given directions with Interface."),
        new Upgrade(
          "Luxury",
          "Impressive, high quality and very comfortable. Various quality-of-life features."
        ),
        new Upgrade(
          "Rugged",
          "Protects from elements, resists environmental damage, easy to repair."
        ),
        new Upgrade(
          "Sealed",
          "Fully enclosed frame with oxygen source. Can function in space, under water, etc."
        ),
        new Upgrade("Sensors", "The vehicle gathers various types of information."),
        new Upgrade(
          "Shielded",
          "+1 Armor provided by extended grav field. Blocks remote Access and hacking."
        ),
        new Upgrade(
          "Stealthy",
          "Silent, difficult to pick up on sensors, occupants invisible to sensors."
        ),
        new Upgrade(
          "Tool",
          "Choose a melee weapon upgrade to represent a tool attached to this vehicle."
        ),
        new Upgrade("Transport", "Can carry a dozen people or a cargo container. Shuttle only."),
        new Upgrade(
          "Turret",
          "A heavy weapon (purchased separately) on a swivel mount, fired by a passenger."
        ),
        new Upgrade("Workspace", "Choose a Kit to be integrated into the vehicle.")
      ]
    ),
    new AssetTemplate(
      "Heavy Weapon",
      [],
      [
        new Upgrade("Heavy Weapon", "Two-handed ranged weapon. Optimal Ranges: Far, Distant."),
        new Upgrade("Destructive", "Causes property damage, damages machinery and vehicles."),
        new Upgrade("Clumsy", "Heavy and awkward, forces Face Adversity on physical activity.")
      ],
      [
        new Upgrade("Breaching", "Damages starships and reinforced structures."),
        new Upgrade(
          "Chemical",
          "Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc."
        ),
        new Upgrade(
          "Concussive",
          "Exceptionally loud and bright. Deafens, blinds and knocks away."
        ),
        new Upgrade("Detonation", "Explodes in a large blast radius."),
        new Upgrade("Impact", "Heavy kinetic force that breaks bones and knocks people over."),
        new Upgrade("Keyed", "Can only be fired by you unless you unlock it."),
        new Upgrade("Laser", "Projects focused beams of energy that can cut or melt materials."),
        new Upgrade("Penetrating", "Ignores Armor."),
        new Upgrade("Plasma", "Fires bright bolts of supercharged, burning energy."),
        new Upgrade("Seeking", "Projectile arcs towards a moving target."),
        new Upgrade("Shock", "Electrocutes, causes malfunctions in electronics and robots."),
        new Upgrade("Shrapnel", "Causes amputation, bleeding and disfigurement in a wide radius."),
        new Upgrade(
          "Spray",
          "Reduce distance, coverage increased to wide cone. Optimal Range: Close."
        ),
        new Upgrade("Stun", "Non-lethal. Stuns, snares or renders unconscious."),
        new Upgrade("Stylish", "Looks impressive, distinctive and unique."),
        new Upgrade("Sustained", "Unleashes a constant suppressing fire at multiple targets.")
      ]
    ),
    new AssetTemplate(
      "Land Vehicle",
      [
        new AssetType(
          "Bike",
          "A fast, two-wheeled vehicle with a maneuverable frame. Up to one passenger."
        ),
        new AssetType(
          "Groundcar",
          "A sturdy 4 or 6-wheeled transport. Fits a driver plus up to 4 passengers."
        ),
        new AssetType(
          "Walker",
          "A bipedal humanoid chassis with lifter arms. 1 pilot suspended within."
        ),
        new AssetType(
          "QuadWalker",
          "A quadruped vehicle for up to 3 people. All-terrain mobility with stability."
        )
      ],
      [],
      [
        new Upgrade("Agile", "Quick, maneuverable, able to perform stunts."),
        new Upgrade(
          "Armed",
          "A heavy weapon (purchased separately) attached to the vehicle, fired by the pilot."
        ),
        new Upgrade("Boosters", "Greatly increases overland speed. Allows short jumps."),
        new Upgrade("Controlled", "Can be remotely activated and given directions."),
        new Upgrade(
          "Luxury",
          "Impressive, high quality and very comfortable. Various quality-of-life features."
        ),
        new Upgrade("Plated", "+3 Armor."),
        new Upgrade(
          "Reinforced",
          "Slow. +3 Armor. Ignores Armor Piercing and Destructive. Must be Breached."
        ),
        new Upgrade(
          "Rugged",
          "Protects from elements, resists environmental damage, easy to repair."
        ),
        new Upgrade(
          "Sealed",
          "Fully enclosed frame with oxygen source. Can function in space, under water, etc."
        ),
        new Upgrade("Sensors", "The vehicle gathers various types of information."),
        new Upgrade(
          "Stealthy",
          "Silent, difficult to pick up on sensors, occupants invisible to sensors."
        ),
        new Upgrade(
          "Tool",
          "Choose a melee weapon upgrade to represent a tool attached to this vehicle."
        ),
        new Upgrade(
          "Transport",
          "Can carry a dozen people or a cargo container. Groundcar and QuadWalker only."
        ),
        new Upgrade(
          "Turret",
          "A heavy weapon (purchased separately) on a swivel mount, fired by a passenger."
        ),
        new Upgrade("Workspace", "Choose a Kit to be integrated into the vehicle.")
      ]
    ),
    new AssetTemplate(
      "Melee Weapon",
      [],
      [
        new Upgrade("Melee Weapon", "Optimal Range: Melee."),
        new UpgradeWithExtras(
          "Basic Form",
          "Choose 1 free upgrade (basic weapon form; this is already accounted for)",
          1
        )
      ],
      [
        new Upgrade("Concealed", "Inconspicuous, easily hidden, doesn't show on scanners."),
        new Upgrade("Defensive", "Can parry, deflect and disarm."),
        new Upgrade("Destructive", "Causes property damage, damages machinery and vehicles."),
        new Upgrade("Energy", "Glows with incandescent energy, melts, burns, cauterizes."),
        new Upgrade(
          "Flexible",
          "Whip length capable of binding and lashing. Optimal Range: Adjacent"
        ),
        new Upgrade("Glove", "A heavy, weaponized glove. Can still manipulate objects."),
        new Upgrade("Hafted", "Two handed. Long reach. Sweeping attacks. Range: Melee, Adjacent"),
        new Upgrade("Heavy", "Two handed. Massive, resilient. Devastating attacks, hard to block."),
        new Upgrade("Impact", "Heavy kinetic force that breaks bones and knocks people over."),
        new Upgrade(
          "Impaling",
          "Can pin targets, pierce thin materials, and stab with great accuracy."
        ),
        new Upgrade("Penetrating", "Ignores Armor."),
        new Upgrade("Ripper", "Loud mechanical motion rips, tears, grinds or shreds."),
        new Upgrade("Severing", "Chops, cuts, causes bleeding and can sever limbs."),
        new Upgrade("Shock", "Electrocutes, causes malfunctions in electronics and robots."),
        new Upgrade("Stun", "Non-lethal. Stuns, snares or renders unconscious."),
        new Upgrade("Stylish", "Looks impressive, distinctive and unique."),
        new Upgrade(
          "Thrown",
          "Handful of small weapons/ single two-handed. Range: Adjacent, Close."
        )
      ]
    ),
    new AssetTemplate(
      "Kit",
      [
        new AssetType(
          "Broadcast",
          "Tools to send and receive signals. Collapsible broadcast antenna, signal boosters, wires, vid screens, recording hardware, portable data drives, etc."
        ),
        new AssetType(
          "Computer",
          "Tools to access, program, diagnose and repair computer systems. Laptops, diagnostic tools, wires, handheld power sources, portable data drives, etc."
        ),
        new AssetType(
          "Engineering",
          "Tools to repair and dismantle machinery. Hammers, drills, cutters, wrenches, welders, grips, cables, diagnostic tools, cage lamps, misc spare parts, etc."
        ),
        new AssetType(
          "Infiltration",
          "Tools to gain access to forbidden places. Mechanical lockpicks, intrusion hardware, chloroform, glass cutters, disguises, ropes, climbing tools, etc."
        ),
        new AssetType(
          "Medical",
          "Tools to perform medical treatments. Bandages, scalpels, gels, stimms, surgical braces, dermal regen spray, etc."
        ),
        new AssetType(
          "Research",
          "Tools to study and experiment out in the field. Specimen jars, hammer and chisel, scalpels, chemical analyser, data recorder, etc."
        ),
        new AssetType(
          "Survey",
          "Tools to observe and monitor. Range finders, tracking devices, motion sensors, deep scanner tripod, holo-map projector, data recorder, deployabletransmitter, etc."
        ),
        new AssetType(
          "Wilderness",
          "Tools to traverse hostile landscapes. Ropes, climbing tools, light sources, breather mask, tent, sleeping bag, heat lamp, thermal blanket, water filter, etc."
        )
      ],
      [],
      []
    )
  ];
}
function randomAssets() {
  const assets = [];
  const attireAsset = randomAssetOfType("Attire", 0);
  const asset1 = randomAsset(1);
  const asset2 = randomAsset(1);
  const asset3 = randomAsset(2);
  assets.push(attireAsset);
  assets.push(asset1);
  assets.push(asset2);
  assets.push(asset3);
  return assets;
}
function randomAsset(assetClass) {
  const all = allAssets();
  const assetTemplate = RND.item(all);
  const upgrades = [];
  let possibleUpgrades = [];
  let description = "";
  let extraUpgrades = 0;
  if (assetTemplate.upgrades.length > 0) {
    possibleUpgrades = RND.shuffle(assetTemplate.upgrades);
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
  let assetName = "Class " + assetClass + " " + assetTemplate.name;
  let assetType = new AssetType(assetTemplate.name, assetTemplate.description);
  if (assetTemplate.name.includes("Kit")) {
    assetName = assetTemplate.name;
  }
  if (assetTemplate.types.length > 0) {
    assetType = RND.item(assetTemplate.types);
    assetName += " (" + assetType.name + ")";
    description = assetType.description;
  }
  return new Asset(assetName, description, assetClass, assetType, upgrades);
}
function randomAssetOfType(assetTypeName, assetClass) {
  const all = allAssets();
  const options = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].name === assetTypeName) {
      options.push(all[i]);
    }
  }
  const assetTemplate = RND.item(options);
  const upgrades = [];
  let description = "";
  let extraUpgrades = 0;
  if (assetTemplate.commonTraits.length > 0) {
    for (let i = 0; i < assetTemplate.commonTraits.length; i++) {
      if (assetTemplate.commonTraits[i].extraUpgrades > 0) {
        extraUpgrades++;
      }
      upgrades.push(assetTemplate.commonTraits[i]);
    }
  }
  const possibleUpgrades = RND.shuffle(assetTemplate.upgrades);
  for (let i = 0; i < assetClass + extraUpgrades; i++) {
    const upgrade = possibleUpgrades.pop();
    upgrades.push(upgrade);
  }
  let assetName = "Class " + assetClass + " " + assetTemplate.name;
  let chosenAssetType = new AssetType(assetTemplate.name, assetTemplate.description);
  if (assetTemplate.types.length > 0) {
    chosenAssetType = RND.item(assetTemplate.types);
    assetName += " (" + chosenAssetType.name + ")";
    description = chosenAssetType.description;
  }
  return new Asset(assetName, description, assetClass, chosenAssetType, upgrades);
}
class Career {
  name;
  descriptors;
  workspaces;
  advancements;
  skills;
  constructor(name, descriptors, workspaces, advancements, skills) {
    this.name = name;
    this.descriptors = descriptors;
    this.workspaces = workspaces;
    this.advancements = advancements;
    this.skills = skills;
  }
}
class Skill {
  name;
  description;
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}
class Workspace {
  name;
  description;
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}
function allCareers() {
  return [
    new Career(
      "Academic",
      ["Thin", "Pallid", "Elderly", "Kind-hearted", "Aloof", "Distracted"],
      [
        new Workspace(
          "Medical",
          "Sterile environment. Medbay, cryotubes, surgical servo arms, isolation chamber, recovery ward."
        ),
        new Workspace(
          "Research",
          "Sensors gather scientific readings. Laboratory, containment units, sample scanners, sealed storage."
        )
      ],
      [
        "A life is saved or destroyed by science.",
        "A vital lesson is imparted.",
        "An experiment yields surprising results.",
        "A subject is thoroughly analyzed.",
        "A fascinating phenomenon is explained."
      ],
      [
        new Skill(
          "Education",
          "When you gain one or more Data Points about a subject, each ally that was present or involved also gains a Data Point about the subject."
        ),
        new Skill(
          "Chemistry",
          "When creating an antidote, vaccine, drug, poison or pathogen in a lab, state the effect you want it to have and its method of transmission (spray, injector, pill, etc).\nRoll+Expertise.\n On a 10+, you successfully create it.\n On a 7-9, it will have reduced potency or have unintended side effects."
        ),
        new Skill(
          "Surgery",
          "When using a medical facility, your Patch Up can be used to install prosthetics and perform surgical reconstruction on living beings. This treats critical injuries."
        ),
        new Skill(
          "Deduction",
          "When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.\n Who or what...\n • is most vulnerable in this situation?\n • is most dangerous in this situation?\n • caused this situation?"
        ),
        new Skill(
          "Technobabble",
          "You can Command crew using Expertise rather than Influence. Subjects of your Command can perform minor technical or scientific tasks, no matter their skill set."
        )
      ]
    ),
    new Career(
      "Clandestine",
      ["Hawk-nosed", "Sinister", "Wiry", "Bland", "Suspicious", "Bald"],
      [
        new Workspace(
          "Stealthy",
          "Difficult to detect, high tech camouflage, cloaking or concealment. Scanning bafflers, sound dampening, hidden doors/rooms."
        ),
        new Workspace(
          "Secure",
          "Sensors to track people and movement. Security cameras, monitoring stations, holding cells, security doors."
        )
      ],
      [
        'An intentional "accident" happens.',
        "A victim experiences true fear.",
        "A conspiracy is uncovered.",
        "An act is performed covertly.",
        "A dark secret is extracted."
      ],
      [
        new Skill(
          "Stealth",
          "Whenever you can move around freely and are unobserved, you can choose to vanish without a trace. While missing, you may show up in the midst of events, as long as you can explain how you got there."
        ),
        new Skill(
          "Assassination",
          "Any successful (10+) Move that results in someone's death also leaves no evidence that you committed the act."
        ),
        new Skill(
          "Surveillance",
          "After you Access someone's personal systems, you can track that person's public movements from then on (general location, interactions, transactions, etc). You can only have one surveillance subject at a time."
        ),
        new Skill(
          "Sabotage",
          "When you tamper with machines, plans, etc, describe how you go about it and Roll+[Stat].\n On a 10+ the target of your tampering is doomed to fail, just as you planned.\n On a 7-9, the target of your tampering is doomed to fail spectacularly, horrifically or comically, at the GM's discretion. "
        ),
        new Skill(
          "Interrogation",
          "When you question someone who is at your mercy, gain 3 Data Points about them: their lives, their job, their transactions, their friends, their family, their guilt, their shame, etc."
        )
      ]
    ),
    new Career(
      "Commercial",
      ["Oily", "Well-Fed", "Manicured", "Harried", "Miserly", "Cunning"],
      [
        new Workspace(
          "Mercantile",
          "Prominent advertisement, easy access. Large cargo storage space, automatic loader-unloader systems"
        ),
        new Workspace(
          "Leisure",
          "Relaxing, inviting, well-lit. Studio, lounge, entertainment systems, recreation area."
        )
      ],
      [
        "A solution is purchased.",
        "A frivolous expense is made.",
        "A celebration is held.",
        "A rich resource is found.",
        "A cargo unit is exchanged."
      ],
      [
        new Skill(
          "Outfit",
          "Own a unique Class 3 Attire. If your attire is ever lost or damaged, you can abandon it and spend an extended period of time claiming new attire as your Outfit, adding an extra upgrade to it."
        ),
        new Skill(
          "Marketing",
          "When you arrive in a civilized area, choose a type of market. You can easily find that kind of market here.\n • Elite: High class, exacting.\n • Secretive: Discrete, illicit.\n • Motivated: Fast, agreeable"
        ),
        new Skill(
          "Luxury",
          "Your clothing, belongings and quarters are all lavish and expensive. Gain one of the following NPCs as a retainer: Butler, Assistant, Consort or Advisor. Name the NPC and give them a 2-4 word description. "
        ),
        new Skill(
          "Bribe",
          "You can use Acquisition to purchase the following:\n • Political power\n • Legal decisions\n • Faction involvement\n • Diplomatic immunity"
        ),
        new Skill(
          "Acumen",
          "When you first visit a market or environment, you may ask one of the following questions, and the GM will answer honestly:\n • What is profitably exploitable here?\n • What is in high demand here?\n • Who is the biggest economic player?"
        )
      ]
    ),
    new Career(
      "Explorer",
      ["Weathered", "Battered", "Unkempt", "Rude", "Cheerful", "Brash"],
      [
        new Workspace(
          "Rugged",
          " Withstands harsh climates and weather. Decontamination units, hydroponics facilities, advanced water/air/waste recyclers, self-sufficient"
        ),
        new Workspace(
          "Survey",
          "Planetary scanners (weather, geological activity, etc). Probe launcher, topography holo-projector, motor-pool."
        )
      ],
      [
        "An alien wilderness is traversed.",
        "A bold act fails spectacularly.",
        "A needed item is scrounged up.",
        "A ludicrous stunt turns the tides.",
        "A forgotten place is excavated."
      ],
      [
        new Skill(
          "Boldly Go",
          "When leading an expedition into the unknown, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will choose 1.\n You encounter...\n • something potentially profitable\n • something currently useful\n • something uniquely awesome"
        ),
        new Skill(
          "Reconnaissance",
          "When you make an Assessment of any aspect of a wilderness (animals, plants, weather, terrain, hazards, etc) you gain 3 Data Points about that subject on a 10+, and 1 Data Point about that subject on a 7-9."
        ),
        new Skill(
          "Recklessness",
          "When you make a needlessly risky Move where the odds are a million to one, roll 1d6 instead of making a normal Roll. On a 4, 5 or 6, the Move is a fantastically lucky success. On a 1, 2 or 3, the Move is a spectacularly awful failure with harsh consequences."
        ),
        new Skill(
          "Survival",
          "You can scrounge up the following from all but the most barren, inhospitable surroundings:\n • Somewhat edible food and drink\n • Basic medicine or first-aid materials\n • Rustic Wilderness Kit\n • Primitive Class 0 melee weapon"
        ),
        new Skill(
          "Custom Vehicle",
          "You own a custom-designed Class 3 land vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new land vehicle as your Custom Vehicle, adding an extra upgrade to it."
        )
      ]
    ),
    new Career(
      "Industrial",
      ["Muscled", "Grimy", "Wrinkled", "Rigorous", "Rugged", "Focused"],
      [
        new Workspace(
          "Refinery",
          "Heavy raw-material collectors. Gathers, processes raw matter into refined materials. Material storage tanks."
        ),
        new Workspace(
          "Manufactory",
          "Engineering bays. Builds, upgrades and repairs. Workbenches, tool racks, winches, pulleys, lifts."
        )
      ],
      [
        "A piece of junk proves pivotal.",
        'A piece of technology is "improved."',
        "A breakage occurs.",
        "An explosion alters the situation.",
        "A structural weakness is exposed."
      ],
      [
        new Skill(
          "Repair",
          "When using a repair bay or workshop, your Patch Up can be used to install replacement parts and perform major reconstruction on machines. This repairs critical and fatal breakages."
        ),
        new Skill(
          "Construction",
          "A few hours of work creates a small structure with one of the following traits, or adds that trait to an existing room.\n • Shelter\n • Defensible\n • Concealed\n • Workspace"
        ),
        new Skill(
          "Tinker",
          "You can assemble the following from scrap metal and spare parts:\n • Shoddy Class 0 melee weapon\n • Makeshift Class 0 explosive\n • Crude Engineering Kit"
        ),
        new Skill(
          "Upgrade",
          "Your Patch Up can very temporarily add up to one additional upgrade to a weapon or vehicle, briefly increasing its Class by +1. "
        ),
        new Skill(
          "Dismantle",
          "When forcefully dismantling, demolishing or breaking something, Roll+Physique.\nOn a 10+, choose 2.\nOn a 7-9, choose 1.\n • It doesn't take very long.\n • It doesn't attract too much attention.\n • You recover useful components.\n • You could rebuild or reassemble it.\n • You gain a Data Point about it."
        )
      ]
    ),
    new Career(
      "Military",
      ["Scarred", "Grizzled", "Massive", "Skittish", "Weary", "Grim"],
      [
        new Workspace(
          "Armored",
          "Made of reinforced materials. Difficult to damage, can withstand direct impacts and explosions. Reinforced blast doors, structurally sound."
        ),
        new Workspace(
          "Barracks",
          "Efficient, defensible, practical. Berthing for many soldiers, lockers, gym, training ring, mobilization area."
        )
      ],
      [
        "An objective is taken by force.",
        "A perilous order is obeyed.",
        "An injury is sustained.",
        "A problem is resolved with firepower.",
        "A worthy enemy is exterminated."
      ],
      [
        new Skill(
          "Tactics",
          "When you Open Fire or Launch Assault, you choose one or more consequences on a partial success (7-9), not the GM."
        ),
        new Skill("Toughness", "You can suffer two injuries of each severity, rather than one."),
        new Skill(
          "Heavy Lifting",
          "Ignore the Clumsy trait inflicted by heavy weapons, heavy armor, encumbrance and high gravity."
        ),
        new Skill(
          "Unique Weapon",
          "Own a unique Class 3 firearm or heavy weapon. If that weapon is ever lost, you can abandon it and spend an extended period of time claiming a new weapon as your Unique Weapon, adding an extra upgrade to it."
        ),
        new Skill(
          "Authority",
          "Whenever you are in a position of clear superiority over a group of NPCs, you can Command those NPCs even if the order goes against their own traits, loyalties and willingness"
        )
      ]
    ),
    new Career(
      "Personality",
      ["Stunning", "Sexy", "Chiselled", "Placid", "Soft", "Haughty"],
      [
        new Workspace(
          "Habitation",
          "Living space for many guests or crew. Communal eating rooms, extended life-support/facilities."
        ),
        new Workspace(
          "Stately",
          "Expensive, luxurious, finely appointed décor. More expensive to maintain, but provides much higher quality of life"
        )
      ],
      [
        "A relationship changes drastically.",
        "A statement starts or ends a fight.",
        "A difficult promise is upheld.",
        "A rumor spreads like wildfire.",
        "An unlikely hero is exalted."
      ],
      [
        new Skill(
          "Fame",
          "Decide what you are famous/infamous for. Factions, groups and people of importance always know who you are when you meet them. Allies may use your +Influence if they speak in your name, but you'll suffer for any faux-pas."
        ),
        new Skill(
          "Leadership",
          "You have a hand-picked, elite Class 3 Crew. Given enough time and training, you can replace lost members of this crew with new NPCs."
        ),
        new Skill(
          "Inspiration",
          "Choose an emotion and the medium/art with which you convey it, then Roll+Influence or +Physique.\nOn a 7-9, the emotion takes hold of your audience.\nOn a 10+, as above, and choose 1:\n • You gain a keen admirer.\n • You are treated lavishly.\n • You can Command the audience"
        ),
        new Skill(
          "Contacts",
          "You have acquaintances and contacts all over the galaxy. When arriving anywhere civilized, introduce a contact. That NPC operates here."
        ),
        new Skill(
          "Diplomacy",
          "Factions will ignore political boundaries, jurisdictions, your personal relationship, and even their own prejudices when you call in a Favor."
        )
      ]
    ),
    new Career(
      "Scoundrel",
      ["Thick", "Dapper", "Sly", "Meaty", "Slick", "Cold"],
      [
        new Workspace(
          "Facade",
          "False identification/registry, disguised as something else. Crawlspaces, hidden compartments, false walls."
        ),
        new Workspace(
          "Sleazy",
          "Ramshackle, grimy, dimly lit. Space for drinking, smoking, recreational drug use, or other vices."
        )
      ],
      [
        "A deal ends in betrayal.",
        "A broken law goes unpunished.",
        "A valuable is stolen.",
        "A threat is preemptively removed.",
        "An unsuspecting victim is exploited."
      ],
      [
        new Skill(
          "Criminal",
          "Any successful (10+) Move that involves theft, smuggling, extortion or similar crimes also leaves no evidence that could indict you"
        ),
        new Skill(
          "Sneak Attack",
          "When you get the drop on someone, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will give you 2 of the following options, choose 1 of them.\n • Kill them\n • Injure them\n • Rob/disarm them\n • Capture/disable them"
        ),
        new Skill(
          "Scapegoat",
          "When you would suffer social, legal or financial consequences, name someone and Roll+Expertise.\n On a 10+, they suffer instead.\n On a 7-9, as above. They know it was you.\n On a 6-, it didn't work, and they know what you tried to do."
        ),
        new Skill(
          "False Identity",
          "You maintain a number of fake identities that have neutral standing with all factions. As long as a chosen identity holds, your actions do not incur Debt or earn Favor."
        ),
        new Skill(
          "Addict",
          "Choose one of your five stats. As long as you regularly dose yourself with your drug of choice, increase that stat by +1. Failure to subsequently dose yourself will reduce that stat by -2 until you dose yourself again or recover from the lengthy effects of withdrawal."
        )
      ]
    ),
    new Career(
      "Starfarer",
      ["Bony", "Quick", "Tall", "Sunny", "Restless", "Tolerant"],
      [
        new Workspace(
          "Navigation",
          "Wide bay windows, observation decks, star-charts, holo-screens. Satellite uplinks, orbital tracking systems, airspace control/coordination tower"
        ),
        new Workspace(
          "Launchpad",
          "Aircraft/shuttle hangar with wide bay doors, launchpads for shuttles and speeders."
        )
      ],
      [
        "A passenger reaches a destination.",
        "A solution leverages gravity.",
        "A piloting maneuver causes a reversal.",
        "A system is pushed to the limit.",
        "A new culture is experienced."
      ],
      [
        new Skill(
          "Weightless",
          "Ignore the Clumsy trait and/or movement restrictions inflicted by microgravity, low-gravity, freefall, climbing and jump jets. A successful (10+) Move while in those situations lets you describe a moment of exceptional acrobatic grace."
        ),
        new Skill(
          "Cosmopolitan",
          "When you make an Assessment of any aspect of a society (culture, traditions, laws, government, economy, etc) you gain 3 Data Points about that subject on a 10+, and 1 Data Point about that subject on a 7-9."
        ),
        new Skill(
          "Navigation",
          "When you plan a long voyage, choose 1.\nThe voyage will be:\n • Fast - You know a shortcut.\n • Safe - Choose a faction to avoid.\n • Pleasant - +2 to Cramped Quarters.\n • Profitable - If you deliver the passengers who are asking for passage."
        ),
        new Skill(
          "Calibrations",
          "When you diligently calibrate your favorite console or vehicle, make a Get Involved using Interface and record the result. The next time anyone uses it, the result of the Get Involved applies."
        ),
        new Skill(
          "Custom Flyer",
          "You own a custom-designed Class 3 shuttle or speeder vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new vehicle as your Custom Flyer, adding an extra upgrade to it."
        )
      ]
    ),
    new Career(
      "Technocrat",
      ["Nearsighted", "Lanky", "Underfed", "Smug", "Awkward", "Intense"],
      [
        new Workspace(
          "Communication",
          "High-powered communications array, transceivers, antennae. Screens, conference rooms, holo-projectors."
        ),
        new Workspace(
          "Observer",
          "Advanced, multi-band sensors, capable of long-distance scans. Probe launchers. Recording equipment, shielded data storage."
        )
      ],
      [
        "A system's security is breached.",
        "A solution is found on the SectorNet.",
        "A computer crash causes chaos.",
        "A pivotal data cluster is accessed.",
        "An offending program is expunged."
      ],
      [
        new Skill(
          "Upload",
          "Expend a Data Point on the SectorNet to have the facts about the subject:\n • be erased, hidden, classified.\n • become common knowledge.\n • be falsified, pivotally altered."
        ),
        new Skill(
          "Hijack",
          "When you Access a system, it locks out everyone else. You can open the system to anyone you wish."
        ),
        new Skill(
          "Program",
          "When you Access a system, choose a behavior that the system could perform and a condition that will trigger that behavior."
        ),
        new Skill(
          "Network",
          "You can simultaneously track the location and health of a dozen willing subjects through a console or HUD. You are able to remotely Get Involved or issue Commands"
        ),
        new Skill(
          "Artificial Intelligence",
          "You have the loyalty of a digital, artificial intelligence NPC. Give it a name and a 2-4 word description of its personality. It can enter, unlock and activate systems at your Command. Your AI can only be in one system at a time."
        )
      ]
    )
  ];
}
function randomCareers() {
  let careers = allCareers();
  careers = RND.shuffle(careers);
  const careerOne = careers.pop();
  const careerTwo = careers.pop();
  const result = [];
  if (typeof careerOne === "object") {
    result.push(careerOne);
  }
  if (typeof careerTwo === "object") {
    result.push(careerTwo);
  }
  return result;
}
class Origin {
  name;
  descriptors;
  skills;
  constructor(name, descriptors, skills) {
    this.name = name;
    this.descriptors = descriptors;
    this.skills = skills;
  }
}
function randomOrigin() {
  const origins = [
    new Origin(
      "Advanced",
      ["Angular", "Robust", "Strapping", "Carefree", "Lazy", "Arrogant"],
      [
        new Skill(
          "Cutting Edge",
          "Interacting with new, advanced technology comes naturally to you. On the other hand, dealing with old, clunky, obsolete dreck is rather aggravating. You gain +1 to your Interface stat, to a maximum of +2."
        ),
        new Skill(
          "Artificial Intelligence",
          "You have the loyalty of a digital, artificial intelligence NPC. Give it a name and a 2-4 word description of its personality. It can enter, unlock and activate systems at your Command. Your AI can only be in one system at a time."
        ),
        new Skill(
          "Custom Flyer",
          "You own a custom-designed Class 3 shuttle or speeder vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new vehicle as your Custom Vehicle, adding an extra upgrade to it."
        ),
        new Skill(
          "Surveillance",
          "After you Access someone's personal systems, you can track that person's public movements from then on (general location, interactions, transactions, etc). You can only have one surveillance subject at a time."
        )
      ]
    ),
    new Origin(
      "Brutal",
      ["Tired", "Disfigured", "Suppressed", "Cruel", "Angry", "Severe"],
      [
        new Skill(
          "Branded",
          "You have a prominent, recognisable physical mark (scars, burns, tattoos, prison barcode, slave brand), as a testament to the hardships you've survived. You gain +1 to your Physique stat, to a maximum of +2."
        ),
        new Skill(
          "Assassination",
          "Any successful (10+) Move that results in someone's death also leaves no evidence that you committed the act."
        ),
        new Skill("Toughness", "You can suffer two injuries of each severity, rather than one."),
        new Skill(
          "Sneak Attack",
          "When you get the drop on someone, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will give you 2 of the following options, choose 1 of them.\n • Kill them\n • Injure them\n • Rob/disarm them\n • Capture/disable them"
        )
      ]
    ),
    new Origin(
      "Colonist",
      ["Hard", "Serious", "Calloused", "Dusky", "Solid", "Prudent"],
      [
        new Skill(
          "Resourceful",
          "You're good at making do with limited resources, and getting the most out of what you have, making you a bit of a hoarder. You gain +1 to your Expertise stat, to a maximum of +2."
        ),
        new Skill(
          "Tinker",
          "You can assemble the following from scrap metal and spare parts:\n • Shoddy Class 0 melee weapon\n • Makeshift Class 0 explosive\n • Crude Engineering Kit"
        ),
        new Skill(
          "Custom Vehicle",
          "You own a custom-designed Class 3 land vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new land vehicle as your Custom Vehicle, adding an extra upgrade to it."
        ),
        new Skill(
          "Heavy Lifting",
          "Ignore the Clumsy trait inflicted by heavy weapons, heavy armor, encumbrance and high gravity."
        )
      ]
    ),
    new Origin(
      "Crowded",
      ["Lively", "Compact", "Stout", "Spare", "Loud", "Agoraphobic"],
      [
        new Skill(
          "Affable",
          "You get along well with almost everyone in your own way. You are most comfortable around others, and get lonely quickly. You gain +1 to your Influence stat, to a maximum of +2."
        ),
        new Skill(
          "Contacts",
          "You have acquaintances and contacts all over the galaxy. When arriving anywhere civilized, introduce a contact. That NPC operates here."
        ),
        new Skill(
          "Network",
          "You can simultaneously track the location and health of a dozen willing subjects through a console or HUD. You are able to remotely Get Involved or issue Commands."
        ),
        new Skill(
          "Bribe",
          "You can use Acquisition to purchase the following:\n • Political power\n • Legal decisions\n • Faction involvement\n • Diplomatic immunity"
        )
      ]
    ),
    new Origin(
      "Galactic",
      ["Sharp", "Guarded", "Stoic", "Isolated", "Energetic", "Graceful"],
      [
        new Skill(
          "Fine Tuning",
          "You're adept at interfacing with climate controlled living spaces; natural environments tend to be uncomfortable. You gain +1 to your Interface stat, to a maximum of +2."
        ),
        new Skill(
          "Program",
          "When you Access a system, choose a behavior that the system could perform and a condition that will trigger that behavior."
        ),
        new Skill(
          "Weightless",
          "Ignore the Clumsy trait and/or movement restrictions inflicted by microgravity, low-gravity, freefall, climbing and jump jets. A successful (10+) Move while in those situations lets you describe a moment of exceptional acrobatic grace"
        ),
        new Skill(
          "Repair",
          "When using a repair bay or workshop, your Patch Up can be used to install replacement parts and perform major reconstruction on machines. This repairs critical and fatal breakages."
        )
      ]
    ),
    new Origin(
      "Impoverished",
      ["Gaunt", "Haggard", "Sickly", "Filthy", "Vulgar", "Fierce"],
      [
        new Skill(
          "Scrappy",
          "Life has beaten you down, but you never, ever give up. No matter how bad things get, you rarely back down, even when you really should. You gain +1 to your Mettle stat, to a maximum of +2."
        ),
        new Skill(
          "Stealth",
          "Whenever you can move around freely and are unobserved, you can choose to vanish without a trace. While missing, you may show up in the midst of events, as long as you can explain how you got there."
        ),
        new Skill(
          "Recklessness",
          "When you make a needlessly risky Move where the odds are a million to one, roll 1d6 instead of making a normal Roll. On a 4, 5 or 6, the Move is a fantastically lucky success. On a 1, 2 or 3, the Move is a spectacularly awful failure with harsh consequences."
        ),
        new Skill(
          "Criminal",
          "Any successful (10+) Move that involves theft, smuggling, extortion or similar crimes also leaves no evidence that could indict you"
        )
      ]
    ),
    new Origin(
      "Privileged",
      ["Manicured", "Plump", "Groomed", "Snobbish", "Sleek", "Pompous"],
      [
        new Skill(
          "Decorum",
          "You are well versed in the rules of etiquette, civility and propriety. You can carry yourself with grace in formal affairs, but are ill-at-ease in casual settings. You gain +1 to your Influence stat, to a maximum of +2."
        ),
        new Skill(
          "Luxury",
          "Your clothing, belongings and quarters are all lavish and expensive. Gain one of the following NPCs as a retainer: Butler, Assistant, Consort or Advisor. Name the NPC and give them a 2-4 word description. "
        ),
        new Skill(
          "Fame",
          "Decide what you are famous/infamous for. Factions, groups and people of importance always know who you are when you meet them. Allies may use your +Influence if they speak in your name, but you'll suffer for any faux-pas."
        ),
        new Skill(
          "Scapegoat",
          "When you would suffer social, legal or financial consequences, name someone and Roll+Expertise.\n On a 10+, they suffer instead.\n On a 7-9, as above. They know it was you.\n On a 6-, it didn't work, and they know what you tried to do."
        )
      ]
    ),
    new Origin(
      "Productive",
      ["Slight", "Curious", "Faded", "Greying", "Detached", "Introverted"],
      [
        new Skill(
          "Vocation",
          "You've spent many years training in a variety of techniques and trades. Sadly, you've never had time for fun or relaxation. You gain +1 to your Expertise stat, to a maximum of +2"
        ),
        new Skill(
          "Calibrations",
          "When you diligently calibrate your favorite console or vehicle, make a Get Involved using Interface and record the result. The next time anyone uses it, the result of the Get Involved applies."
        ),
        new Skill(
          "Education",
          "When you gain one or more Data Points about a subject, each ally that was present or involved also gains a Data Point about the subject."
        ),
        new Skill(
          "Acumen",
          "When you first visit a market or environment, you may ask one of the following questions, and the GM will answer honestly:\n • What is profitably exploitable here?\n • What is in high demand here?\n • Who is the biggest economic player?"
        )
      ]
    ),
    new Origin(
      "Regimented",
      ["Athletic", "Meditative", "Sturdy", "Organised", "Formal", "Strict"],
      [
        new Skill(
          "Discipline",
          "You know the rules, the codes, the processes, the scripture, the laws. They give you stability. You don't deal well with change. You gain +1 to your Mettle stat, to a maximum of +2."
        ),
        new Skill(
          "Leadership",
          "You have a hand-picked, elite Class 3 Crew. Given enough time and training, you can replace lost members of this crew with new NPCs. "
        ),
        new Skill(
          "Tactics",
          "When you Open Fire or Launch Assault, you choose one or more consequences on a partial success (7-9), not the GM."
        ),
        new Skill(
          "Deduction",
          "When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.\n Who or what...\n • is most vulnerable in this situation?\n • is most dangerous in this situation?\n • caused this situation?"
        )
      ]
    ),
    new Origin(
      "Rustic",
      ["Wrinkled", "Creaking", "Wiry", "Aged", "Weary", "Strong"],
      [
        new Skill(
          "Hard Labor",
          "You can perform long grueling hours of physical labor with minimal rest. You've collected a wide variety of aches, pains and minor ailments from doing this. You gain +1 to your Physique stat, to a maximum of +2."
        ),
        new Skill(
          "Construction",
          "A few hours of work creates a small structure with one of the following traits, or adds that trait to an existing room.\n • Shelter\n • Defensible\n • Concealed\n • Workspace"
        ),
        new Skill(
          "Survival",
          "You can scrounge up the following from all but the most barren, inhospitable surroundings:\n • Somewhat edible food and drink\n • Basic medicine or first-aid materials\n • Rustic Wilderness Kit\n • Primitive Class 0 melee weapon"
        ),
        new Skill(
          "Chemistry",
          "When creating an antidote, vaccine, drug, poison or pathogen in a lab, state the effect you want it to have and its method of transmission (spray, injector, pill, etc).\nRoll+Expertise.\n On a 10+, you successfully create it.\n On a 7-9, it will have reduced potency or have unintended side effects."
        )
      ]
    )
  ];
  return RND.item(origins);
}
class StatBlock {
  physique;
  mettle;
  expertise;
  influence;
  interface;
  constructor() {
    this.physique = 0;
    this.mettle = 0;
    this.expertise = 0;
    this.influence = 0;
    this.interface = 0;
  }
}
function randomStats() {
  let stats = [2, 1, 1, 0, -1];
  const statBlock = new StatBlock();
  stats = RND.shuffle(stats);
  statBlock.physique = stats[0];
  statBlock.mettle = stats[1];
  statBlock.expertise = stats[2];
  statBlock.influence = stats[3];
  statBlock.interface = stats[4];
  return statBlock;
}
function skillsInclude(skillName, skills) {
  let includes = false;
  skills.forEach(function(element) {
    if (element.name == skillName) {
      includes = true;
    }
  });
  return includes;
}
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.svelte-fmhe6u.svelte-fmhe6u,h1.svelte-fmhe6u.svelte-fmhe6u,h2.svelte-fmhe6u.svelte-fmhe6u,h4.svelte-fmhe6u.svelte-fmhe6u,p.svelte-fmhe6u.svelte-fmhe6u,pre.svelte-fmhe6u.svelte-fmhe6u,strong.svelte-fmhe6u.svelte-fmhe6u,ul.svelte-fmhe6u.svelte-fmhe6u,li.svelte-fmhe6u.svelte-fmhe6u,label.svelte-fmhe6u.svelte-fmhe6u,section.svelte-fmhe6u.svelte-fmhe6u{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-fmhe6u.svelte-fmhe6u{display:block}ul.svelte-fmhe6u.svelte-fmhe6u{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-fmhe6u.svelte-fmhe6u,h2.svelte-fmhe6u.svelte-fmhe6u,h4.svelte-fmhe6u.svelte-fmhe6u{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}pre.svelte-fmhe6u.svelte-fmhe6u{white-space:pre-wrap}h1.svelte-fmhe6u.svelte-fmhe6u{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-fmhe6u.svelte-fmhe6u{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h4.svelte-fmhe6u.svelte-fmhe6u{font-size:1.5rem;line-height:1.5rem}p.svelte-fmhe6u.svelte-fmhe6u{margin:1rem 0}label.svelte-fmhe6u.svelte-fmhe6u{font-weight:700;margin-right:1rem}input.svelte-fmhe6u.svelte-fmhe6u{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-fmhe6u.svelte-fmhe6u{margin-bottom:1rem}ul.svelte-fmhe6u li.svelte-fmhe6u{list-style-type:disc;margin-left:2rem}strong.svelte-fmhe6u.svelte-fmhe6u{font-weight:700}pre.svelte-fmhe6u.svelte-fmhe6u{font-family:monospace;background-color:#454343;color:#fff;padding:0.5rem;font-size:0.85rem}section.main.svelte-fmhe6u.svelte-fmhe6u{padding:0.5rem}#seed.svelte-fmhe6u.svelte-fmhe6u{font-family:monospace}.scifi.svelte-fmhe6u.svelte-fmhe6u{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-fmhe6u h1.svelte-fmhe6u,.scifi.svelte-fmhe6u h2.svelte-fmhe6u,.scifi.svelte-fmhe6u h4.svelte-fmhe6u{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-fmhe6u button.svelte-fmhe6u{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-fmhe6u button.svelte-fmhe6u:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-fmhe6u button.svelte-fmhe6u:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let character = generate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-12oxiei_START -->${$$result.title = `<title>Uncharted Worlds Character Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-12oxiei_END -->`, ""} <section class="main scifi svelte-fmhe6u"><h1 class="svelte-fmhe6u" data-svelte-h="svelte-1ijvbbj">Uncharted Worlds Character Generator</h1> <p class="svelte-fmhe6u" data-svelte-h="svelte-1i7bvin">Generate starting characters for Uncharted Worlds.</p> <div class="input-group svelte-fmhe6u"><label for="seed" class="svelte-fmhe6u" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-fmhe6u"${add_attribute("value", seed, 0)}></div> <button class="svelte-fmhe6u" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-fmhe6u" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <button class="svelte-fmhe6u" data-svelte-h="svelte-13jabvw">Save</button> <h2 class="svelte-fmhe6u" data-svelte-h="svelte-2s02c5">Statistics</h2> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-ub16vk">Physique:</strong> ${escape(character.stats.physique)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1mjwavd">Mettle:</strong> ${escape(character.stats.mettle)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-a74prj">Expertise:</strong> ${escape(character.stats.expertise)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-zr9hhj">Influence:</strong> ${escape(character.stats.influence)}</p> <p class="svelte-fmhe6u"><strong class="svelte-fmhe6u" data-svelte-h="svelte-1oj8f3n">Interface:</strong> ${escape(character.stats.interface)}</p> <h2 class="svelte-fmhe6u" data-svelte-h="svelte-if5pdr">Careers</h2> ${each(character.careers, (career) => {
    return `<div class="svelte-fmhe6u">${escape(career.name)}</div>`;
  })} <h2 class="svelte-fmhe6u" data-svelte-h="svelte-nyjvb0">Origin</h2> <p class="svelte-fmhe6u">${escape(character.origin.name)}</p> <h2 class="svelte-fmhe6u" data-svelte-h="svelte-12vc7mg">Descriptors</h2> <p class="svelte-fmhe6u">${escape(character.descriptors)}</p> <h2 class="svelte-fmhe6u" data-svelte-h="svelte-1w8bmy8">Skills</h2> <ul class="svelte-fmhe6u">${each(character.skills, (skill) => {
    return `<li class="svelte-fmhe6u"><strong class="svelte-fmhe6u">${escape(skill.name)}:</strong> <pre class="svelte-fmhe6u">${escape(skill.description)}</pre> </li>`;
  })}</ul> <h2 class="svelte-fmhe6u" data-svelte-h="svelte-1r1ltq4">Advancement</h2> <p class="svelte-fmhe6u">${escape(character.advancement)}</p> <h2 class="svelte-fmhe6u" data-svelte-h="svelte-zpvci3">Assets</h2> <div class="asset svelte-fmhe6u"><h4 class="svelte-fmhe6u">Workspace: ${escape(character.workspace.name)}</h4> <p class="svelte-fmhe6u">${escape(character.workspace.description)}</p></div> ${each(character.assets, (asset) => {
    return `<div class="svelte-fmhe6u"><h4 class="svelte-fmhe6u">${escape(asset.name)}</h4> <p class="svelte-fmhe6u">${escape(asset.description)}</p> ${asset.upgrades.length > 0 ? `<ul class="svelte-fmhe6u">${each(asset.upgrades, (upgrade) => {
      return `<li class="svelte-fmhe6u"><strong class="svelte-fmhe6u">${escape(upgrade.name)}:</strong> ${escape(upgrade.description)} </li>`;
    })} </ul>` : ``} </div>`;
  })}</section>`;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map

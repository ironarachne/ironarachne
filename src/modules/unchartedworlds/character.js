import * as iarnd from "../random.js";
import * as Words from "../words.js";
import * as Text from "../textformat.js";

export function generate() {
  let character = {
    stats: randomStats(),
    careers: randomCareers(),
    origin: randomOrigin(),
  };

  let descriptors = [];
  descriptors.push(iarnd.item(character.careers[0].descriptors));
  descriptors.push(iarnd.item(character.careers[1].descriptors));
  descriptors.push(iarnd.item(character.origin.descriptors));

  character.descriptors = Words.arrayToPhrase(descriptors);

  let skills = [];
  let careerSkills = character.careers[0].skills.concat(
    character.careers[1].skills
  );

  careerSkills = iarnd.shuffle(careerSkills);

  for (let i = 0; i < 3; i++) {
    let newSkill = careerSkills.pop();
    skills.push(newSkill);
  }

  let originSkills = iarnd.shuffle(character.origin.skills);

  skills.push(originSkills.pop());

  character.skills = skills;

  let workspaceOptions = character.careers[0].workspaces.concat(
    character.careers[1].workspaces
  );

  character.workspace = iarnd.item(workspaceOptions);

  let advancements = character.careers[0].advancements.concat(
    character.careers[1].advancements
  );

  character.advancement = iarnd.item(advancements);

  character.assets = randomAssets();

  if (skillsInclude("Custom Flyer", character.skills)) {
    let customFlyer = randomAssetOfType("Flyer", 3);
    character.assets.push(customFlyer);
  }

  if (skillsInclude("Custom Vehicle", character.skills)) {
    let customVehicle = randomAssetOfType("Land Vehicle", 3);
    character.assets.push(customVehicle);
  }

  if (skillsInclude("Leadership", character.skills)) {
    let crew = randomAssetOfType("Crew", 3);
    character.assets.push(crew);
  }

  if (skillsInclude("Unique Weapon", character.skills)) {
    let weaponType = iarnd.item(["Firearm", "Heavy Weapon"]);

    let uniqueWeapon = randomAssetOfType(weaponType, 3);
    character.assets.push(uniqueWeapon);
  }

  return character;
}

function allAssets() {
  return [
    {
      name: "Attire",
      types: [
        {
          name: "Rugged",
          description: "Crude, patched, aged and worn.",
        },
        {
          name: "Simple",
          description: "Utilitarian, favors function over looks.",
        },
        {
          name: "Cultural",
          description: "Incorporates popular styles/elements of a culture.",
        },
        {
          name: "Formal",
          description: "Well cut and stylish.",
        },
        {
          name: "Uniform",
          description:
            "Easily identifiable as belonging to a specific faction or group.",
        },
      ],
      commonTraits: [],
      upgrades: [
        {
          name: "Armored",
          description: "+2 Armor.",
        },
        {
          name: "Carapace",
          description: "Clumsy, +3 Armor.",
        },
        {
          name: "Comms",
          description:
            "Can receive and broadcast signals over great distances.",
        },
        {
          name: "Connected",
          description:
            "Built-in CPU with eye-piece HUD, connects wirelessly to other systems.",
        },
        {
          name: "Impressive",
          description:
            "Distinctive, intimidating, with embellishments and accessories.",
        },
        {
          name: "Jump Jets",
          description:
            "Can give small burst jumps, slow descent, and controlled flight in zero-g.",
        },
        {
          name: "Meshweave",
          description: "+1 Armor that looks like normal fabric.",
        },
        {
          name: "Rig",
          description:
            "Choose a Kit: That Kit is integrated in the suit. Can still carry a second Kit.",
        },
        {
          name: "Tough",
          description:
            "Protects from elements, hard to damage, easy to repair.",
        },
        {
          name: "Sealed",
          description: "Airtight suit with helmet and oxygen tank.",
        },
        {
          name: "Sensor",
          description:
            "Choose a type of information. The wrist screen scans for that subject.",
        },
        {
          name: "Shielded",
          description:
            "+1 Armor provided by thin, invisible energy shield projected by the suit.",
        },
        {
          name: "Stealthy",
          description:
            "Muffled, blends in to environments, difficult to pick up on scanners.",
        },
        {
          name: "Visor",
          description:
            "Choose a type of information. The visor detects that subject.",
        },
      ],
    },
    {
      name: "Crew",
      types: [
        {
          name: "Squad",
          description:
            "Disciplined and stolid. Equipped with a similar type of weaponry (pistols, stun batons, rifles, etc). Able to guard areas and engage in small-scale combat.",
        },
        {
          name: "Techs",
          description:
            "Educated and well trained. Equipped with basic tools. Able to provide technical or manual assistance to a variety of scientific or engineering projects.",
        },
        {
          name: "Staff",
          description:
            "Refined and professional. Able to serve guests, keep accounts, prepare meals and perform daily household chores.",
        },
        {
          name: "Gang",
          description:
            "Crude and self-reliant. Equipped with a smattering of mismatched weaponry (pistols, shotguns, chains, knives, etc). Able to attack people or break things.",
        },
      ],
      commonTraits: [],
      upgrades: [
        {
          name: "Armed",
          description:
            "Choose a Class 1 Firearm. The crew is equipped with it and trained in its use.",
        },
        {
          name: "Artillery",
          description:
            "Able to bombard with artillery, turrets or starship weaponry.",
        },
        {
          name: "Athletic",
          description:
            "Graceful, swift, strong and flexible. Much better than average, physically.",
        },
        {
          name: "Beautiful",
          description:
            "Chosen for their good looks and wit. Able to distract and entertain.",
        },
        {
          name: "Builders",
          description:
            "Able to build small structures or assist in construction projects.",
        },
        {
          name: "Criminal",
          description:
            "Able to commit small-scale criminal activity or assist with larger crimes.",
        },
        {
          name: "Equipped",
          description:
            "Choose a Kit. The crew carries various tools from that kit, and can use them.",
        },
        {
          name: "Fearless",
          description:
            "Never afraid or intimidated, will follow insane orders but often go too far.",
        },
        {
          name: "Imposing",
          description:
            "Imposing in some way. Able to frighten, threaten, dissuade, etc.",
        },
        {
          name: "Informants",
          description:
            "Able to collect information and report back, or pass on information.",
        },
        {
          name: "Loyal",
          description:
            "Only take orders from you. Quickly recovers to their normal disposition.",
        },
        {
          name: "Mechanics",
          description:
            "Able to service and maintain machinery, and assist in repairs and overhauls.",
        },
        {
          name: "Medics",
          description:
            "Able to provide long-term convalescent care or assist in medical procedures.",
        },
        {
          name: "Numerous",
          description:
            "There are a large number of them, you have trouble keeping track of them all.",
        },
        {
          name: "Rugged",
          description:
            "Can work in harsh climates for extended periods of time.",
        },
        {
          name: "Stealthy",
          description:
            "Able to sneak into (or out of) places, and pass unnoticed.",
        },
        {
          name: "Teamsters",
          description:
            "Able to quickly load, unload, assemble and pack away heavy objects and cargo.",
        },
        {
          name: "Wreckers",
          description: "Able to destroy terrain and structures.",
        },
      ],
    },
    {
      name: "Explosive",
      types: [
        {
          name: "Grenade",
          description: "One-handed thrown explosive. Optimal Range: Close",
        },
        {
          name: "Charge",
          description: "Two-handed placed explosive. Optimal Range: Melee",
        },
      ],
      commonTraits: [],
      upgrades: [
        {
          name: "Breaching",
          description:
            "Breaches reinforced buildings and starships. Charge only.",
        },
        {
          name: "Chemical",
          description:
            "Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc.",
        },
        {
          name: "Cluster",
          description:
            "Scatters secondary explosives in the area of effect, which then detonate.",
        },
        {
          name: "Concealed",
          description:
            "Inconspicuous, easily hidden, doesn't show on scanners.",
        },
        {
          name: "Concussive",
          description:
            "Exceptionally loud and bright. Deafens, blinds and knocks away.",
        },
        {
          name: "Destructive",
          description:
            "Causes property damage, damages machinery and vehicles. Grenade only.",
        },
        {
          name: "Focused",
          description:
            "Directed high explosive force, little collateral damage.",
        },
        {
          name: "Haywire",
          description:
            "Disrupts electronic systems, scanners and advanced weaponry.",
        },
        {
          name: "High Yield",
          description:
            "Massive area of effect, city block or more. Charge only.",
        },
        {
          name: "Kinetic",
          description:
            "Heavy kinetic force that breaks bones and knocks people over.",
        },
        {
          name: "Plasma",
          description:
            "Creates a nova of incandescent energy that vaporizes matter.",
        },
        {
          name: "Shock",
          description:
            "Electrocutes, causes malfunctions in electronics and robots.",
        },
        {
          name: "Shrapnel",
          description:
            "Causes amputation, bleeding and disfigurement in a wide radius.",
        },
        {
          name: "Sticky",
          description: "Attaches itself to any surface, difficult to remove.",
        },
        {
          name: "Stun",
          description: "Non-lethal. Stuns, snares or renders unconscious.",
        },
        {
          name: "Stylish",
          description:
            "The explosion looks impressive, distinctive and unique.",
        },
      ],
    },
    {
      name: "Firearm",
      types: [
        {
          name: "Pistol",
          description:
            "One handed ranged weapon, Optimal Ranges: Adjacent, Close.",
        },
        {
          name: "Rifle",
          description: "Two handed ranged weapon, Optimal Ranges: Close, Far.",
        },
      ],
      commonTraits: [],
      upgrades: [
        {
          name: "Attachment",
          description:
            "Attach Class 0 Small weapon with Sharp, Ripper, Energy or Shock.",
        },
        {
          name: "Burst",
          description: "Instead of a single shot, sprays shots in a wide cone.",
        },
        {
          name: "Concealed",
          description:
            "Inconspicuous, easily hidden, doesn't show on scanners.",
        },
        {
          name: "Chemical",
          description:
            "Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc.",
        },
        {
          name: "Destructive",
          description:
            "Causes property damage, damages machinery and vehicles.",
        },
        {
          name: "Explosive",
          description:
            "Loud. Causes messy wounds, property damage near the point of impact.",
        },
        {
          name: "Impact",
          description:
            "Heavy kinetic force that breaks bones and knocks people over.",
        },
        {
          name: "Keyed",
          description: "Can only be fired by you unless you unlock it.",
        },
        {
          name: "Laser",
          description:
            "Projects focused beams of energy that can cut or melt materials.",
        },
        {
          name: "Launcher",
          description:
            "Lobbed, arcing projectile with a modest area of effect.",
        },
        {
          name: "Mounted",
          description:
            "Mounted to a forearm or shoulder rig, keeps hands free.",
        },
        {
          name: "Penetrating",
          description: "Ignores Armor.",
        },
        {
          name: "Plasma",
          description: "Fires bright bolts of supercharged, burning energy.",
        },
        {
          name: "Rapid Fire",
          description: "Unleashes suppressing fire at multiple targets.",
        },
        {
          name: "Scope",
          description:
            "Can fire at distant objects. Optimal Ranges: Far, Distant.",
        },
        {
          name: "Shock",
          description:
            "Electrocutes, causes malfunctions in electronics and robots.",
        },
        {
          name: "Shrapnel",
          description:
            "Causes amputation, bleeding and disfigurement in a small radius.",
        },
        {
          name: "Silenced",
          description: "Suppressed muzzle flash and practically silent shot.",
        },
        {
          name: "Stabilized",
          description: "No recoil, can be used in micro-gravity environments.",
        },
        {
          name: "Stun",
          description: "Non-lethal. Stuns, snares or renders unconscious.",
        },
        {
          name: "Stylish",
          description: "Looks impressive, distinctive and unique.",
        },
      ],
    },
    {
      name: "Flyer",
      types: [
        {
          name: "Shuttle",
          description:
            "A tiny, maneuverable flying vehicle. Space for a pilot and at most one passenger.",
        },
        {
          name: "Speeder",
          description:
            "A flying vehicle for up to six people that can hover and take off vertically.",
        },
      ],
      commonTraits: [],
      upgrades: [
        {
          name: "Agile",
          description: "Quick, maneuverable, able to perform stunts.",
        },
        {
          name: "Armored",
          description: "+2 Armor.",
        },
        {
          name: "Armed",
          description:
            "A heavy weapon (purchased separately) attached to the vehicle, fired by the pilot.",
        },
        {
          name: "Controlled",
          description:
            "Can be remotely activated and given directions with Interface.",
        },
        {
          name: "Luxury",
          description:
            "Impressive, high quality and very comfortable. Various quality-of-life features.",
        },
        {
          name: "Rugged",
          description:
            "Protects from elements, resists environmental damage, easy to repair.",
        },
        {
          name: "Sealed",
          description:
            "Fully enclosed frame with oxygen source. Can function in space, under water, etc.",
        },
        {
          name: "Sensors",
          description: "The vehicle gathers various types of information.",
        },
        {
          name: "Shielded",
          description:
            "+1 Armor provided by extended grav field. Blocks remote Access and hacking.",
        },
        {
          name: "Stealthy",
          description:
            "Silent, difficult to pick up on sensors, occupants invisible to sensors.",
        },
        {
          name: "Tool",
          description:
            "Choose a melee weapon upgrade to represent a tool attached to this vehicle.",
        },
        {
          name: "Transport",
          description:
            "Can carry a dozen people or a cargo container. Shuttle only.",
        },
        {
          name: "Turret",
          description:
            "A heavy weapon (purchased separately) on a swivel mount, fired by a passenger.",
        },
        {
          name: "Workspace",
          description: "Choose a Kit to be integrated into the vehicle.",
        },
      ],
    },
    {
      name: "Heavy Weapon",
      types: [],
      commonTraits: [
        {
          name: "Heavy Weapon",
          description:
            "Two-handed ranged weapon. Optimal Ranges: Far, Distant.",
        },
        {
          name: "Destructive",
          description:
            "Causes property damage, damages machinery and vehicles.",
        },
        {
          name: "Clumsy",
          description:
            "Heavy and awkward, forces Face Adversity on physical activity.",
        },
      ],
      upgrades: [
        {
          name: "Breaching",
          description: "Damages starships and reinforced structures.",
        },
        {
          name: "Chemical",
          description:
            "Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc.",
        },
        {
          name: "Concussive",
          description:
            "Exceptionally loud and bright. Deafens, blinds and knocks away.",
        },
        {
          name: "Detonation",
          description: "Explodes in a large blast radius.",
        },
        {
          name: "Impact",
          description:
            "Heavy kinetic force that breaks bones and knocks people over.",
        },
        {
          name: "Keyed",
          description: "Can only be fired by you unless you unlock it.",
        },
        {
          name: "Laser",
          description:
            "Projects focused beams of energy that can cut or melt materials.",
        },
        {
          name: "Penetrating",
          description: "Ignores Armor.",
        },
        {
          name: "Plasma",
          description: "Fires bright bolts of supercharged, burning energy.",
        },
        {
          name: "Seeking",
          description: "Projectile arcs towards a moving target.",
        },
        {
          name: "Shock",
          description:
            "Electrocutes, causes malfunctions in electronics and robots.",
        },
        {
          name: "Shrapnel",
          description:
            "Causes amputation, bleeding and disfigurement in a wide radius.",
        },
        {
          name: "Spray",
          description:
            "Reduce distance, coverage increased to wide cone. Optimal Range: Close.",
        },
        {
          name: "Stun",
          description: "Non-lethal. Stuns, snares or renders unconscious.",
        },
        {
          name: "Stylish",
          description: "Looks impressive, distinctive and unique.",
        },
        {
          name: "Sustained",
          description:
            "Unleashes a constant suppressing fire at multiple targets.",
        },
      ],
    },
    {
      name: "Land Vehicle",
      types: [
        {
          name: "Bike",
          description:
            "A fast, two-wheeled vehicle with a maneuverable frame. Up to one passenger.",
        },
        {
          name: "Groundcar",
          description:
            "A sturdy 4 or 6-wheeled transport. Fits a driver plus up to 4 passengers.",
        },
        {
          name: "Walker",
          description:
            "A bipedal humanoid chassis with lifter arms. 1 pilot suspended within.",
        },
        {
          name: "QuadWalker",
          description:
            "A quadruped vehicle for up to 3 people. All-terrain mobility with stability.",
        },
      ],
      commonTraits: [],
      upgrades: [
        {
          name: "Agile",
          description: "Quick, maneuverable, able to perform stunts.",
        },
        {
          name: "Armed",
          description:
            "A heavy weapon (purchased separately) attached to the vehicle, fired by the pilot.",
        },
        {
          name: "Boosters",
          description: "Greatly increases overland speed. Allows short jumps.",
        },
        {
          name: "Controlled",
          description: "Can be remotely activated and given directions.",
        },
        {
          name: "Luxury",
          description:
            "Impressive, high quality and very comfortable. Various quality-of-life features.",
        },
        {
          name: "Plated",
          description: "+3 Armor.",
        },
        {
          name: "Reinforced",
          description:
            "Slow. +3 Armor. Ignores Armor Piercing and Destructive. Must be Breached.",
        },
        {
          name: "Rugged",
          description:
            "Protects from elements, resists environmental damage, easy to repair.",
        },
        {
          name: "Sealed",
          description:
            "Fully enclosed frame with oxygen source. Can function in space, under water, etc.",
        },
        {
          name: "Sensors",
          description: "The vehicle gathers various types of information.",
        },
        {
          name: "Stealthy",
          description:
            "Silent, difficult to pick up on sensors, occupants invisible to sensors.",
        },
        {
          name: "Tool",
          description:
            "Choose a melee weapon upgrade to represent a tool attached to this vehicle.",
        },
        {
          name: "Transport",
          description:
            "Can carry a dozen people or a cargo container. Groundcar and QuadWalker only.",
        },
        {
          name: "Turret",
          description:
            "A heavy weapon (purchased separately) on a swivel mount, fired by a passenger.",
        },
        {
          name: "Workspace",
          description: "Choose a Kit to be integrated into the vehicle.",
        },
      ],
    },
    {
      name: "Melee Weapon",
      types: [],
      commonTraits: [
        {
          name: "Melee Weapon",
          description: "Optimal Range: Melee.",
        },
        {
          name: "Basic Form",
          description:
            "Choose 1 free upgrade (basic weapon form; this is already accounted for)",
          extraUpgrades: 1,
        },
      ],
      upgrades: [
        {
          name: "Concealed",
          description:
            "Inconspicuous, easily hidden, doesn't show on scanners.",
        },
        {
          name: "Defensive",
          description: "Can parry, deflect and disarm.",
        },
        {
          name: "Destructive",
          description:
            "Causes property damage, damages machinery and vehicles.",
        },
        {
          name: "Energy",
          description:
            "Glows with incandescent energy, melts, burns, cauterizes.",
        },
        {
          name: "Flexible",
          description:
            "Whip length capable of binding and lashing. Optimal Range: Adjacent",
        },
        {
          name: "Glove",
          description:
            "A heavy, weaponized glove. Can still manipulate objects.",
        },
        {
          name: "Hafted",
          description:
            "Two handed. Long reach. Sweeping attacks. Range: Melee, Adjacent",
        },
        {
          name: "Heavy",
          description:
            "Two handed. Massive, resilient. Devastating attacks, hard to block.",
        },
        {
          name: "Impact",
          description:
            "Heavy kinetic force that breaks bones and knocks people over.",
        },
        {
          name: "Impaling",
          description:
            "Can pin targets, pierce thin materials, and stab with great accuracy.",
        },
        {
          name: "Penetrating",
          description: "Ignores Armor.",
        },
        {
          name: "Ripper",
          description: "Loud mechanical motion rips, tears, grinds or shreds.",
        },
        {
          name: "Severing",
          description: "Chops, cuts, causes bleeding and can sever limbs.",
        },
        {
          name: "Shock",
          description:
            "Electrocutes, causes malfunctions in electronics and robots.",
        },
        {
          name: "Stun",
          description: "Non-lethal. Stuns, snares or renders unconscious.",
        },
        {
          name: "Stylish",
          description: "Looks impressive, distinctive and unique.",
        },
        {
          name: "Thrown",
          description:
            "Handful of small weapons/ single two-handed. Range: Adjacent, Close.",
        },
      ],
    },
    {
      name: "Kit",
      types: [
        {
          name: "Broadcast",
          description:
            "Tools to send and receive signals. Collapsible broadcast antenna, signal boosters, wires, vid screens, recording hardware, portable data drives, etc.",
        },
        {
          name: "Computer",
          description:
            "Tools to access, program, diagnose and repair computer systems. Laptops, diagnostic tools, wires, handheld power sources, portable data drives, etc.",
        },
        {
          name: "Engineering",
          description:
            "Tools to repair and dismantle machinery. Hammers, drills, cutters, wrenches, welders, grips, cables, diagnostic tools, cage lamps, misc spare parts, etc.",
        },
        {
          name: "Infiltration",
          description:
            "Tools to gain access to forbidden places. Mechanical lockpicks, intrusion hardware, chloroform, glass cutters, disguises, ropes, climbing tools, etc.",
        },
        {
          name: "Medical",
          description:
            "Tools to perform medical treatments. Bandages, scalpels, gels, stimms, surgical braces, dermal regen spray, etc.",
        },
        {
          name: "Research",
          description:
            "Tools to study and experiment out in the field. Specimen jars, hammer and chisel, scalpels, chemical analyser, data recorder, etc.",
        },
        {
          name: "Survey",
          description:
            "Tools to observe and monitor. Range finders, tracking devices, motion sensors, deep scanner tripod, holo-map projector, data recorder, deployabletransmitter, etc.",
        },
        {
          name: "Wilderness",
          description:
            "Tools to traverse hostile landscapes. Ropes, climbing tools, light sources, breather mask, tent, sleeping bag, heat lamp, thermal blanket, water filter, etc.",
        },
      ],
      commonTraits: [],
      upgrades: [],
    },
  ];
}

function randomAssets() {
  let assets = [];

  let attireAsset = randomAssetOfType("Attire", 0);
  let asset1 = randomAsset(1);
  let asset2 = randomAsset(1);
  let asset3 = randomAsset(2);

  assets.push(attireAsset);
  assets.push(asset1);
  assets.push(asset2);
  assets.push(asset3);

  return assets;
}

function randomAsset(assetClass) {
  let all = allAssets();

  let assetTemplate = iarnd.item(all);
  let upgrades = [];

  let possibleUpgrades = [];
  let description = "";
  let extraUpgrades = 0;

  if (assetTemplate.upgrades.length > 0) {
    possibleUpgrades = iarnd.shuffle(assetTemplate.upgrades);
  }

  if (assetTemplate.commonTraits.length > 0) {
    assetTemplate.commonTraits.forEach(function (asset) {
      if (asset.extraUpgrades > 0) {
        extraUpgrades++;
      }
      upgrades.push(asset);
    });
  }

  if (possibleUpgrades.length > 0) {
    for (let i = 0; i < assetClass + extraUpgrades; i++) {
      let upgrade = possibleUpgrades.pop();
      upgrades.push(upgrade);
    }
  }

  let assetName = "Class " + assetClass + " " + assetTemplate.name;
  let assetType = "";

  if (assetTemplate.name.includes("Kit")) {
    assetName = assetTemplate.name;
  }

  if (assetTemplate.types.length > 0) {
    assetType = iarnd.item(assetTemplate.types);
    assetName += " (" + assetType.name + ")";
    description = assetType.description;
  }

  let asset = {
    name: assetName,
    description: description,
    class: assetClass,
    type: assetType,
    upgrades: upgrades,
  };

  return asset;
}

function randomAssetOfType(assetType, assetClass) {
  let all = allAssets();

  let options = [];

  all.forEach(function (asset) {
    if (asset.name == assetType) {
      options.push(asset);
    }
  });

  let assetTemplate = iarnd.item(options);
  let upgrades = [];

  let description = "";
  let extraUpgrades = 0;

  if (assetTemplate.commonTraits.length > 0) {
    assetTemplate.commonTraits.forEach(function (asset) {
      if (asset.extraUpgrades > 0) {
        extraUpgrades++;
      }
      upgrades.push(asset);
    });
  }

  let possibleUpgrades = iarnd.shuffle(assetTemplate.upgrades);

  for (let i = 0; i < assetClass + extraUpgrades; i++) {
    let upgrade = possibleUpgrades.pop();
    upgrades.push(upgrade);
  }

  let assetName = "Class " + assetClass + " " + assetTemplate.name;
  let chosenAssetType = "";

  if (assetTemplate.types.length > 0) {
    chosenAssetType = iarnd.item(assetTemplate.types);
    assetName += " (" + chosenAssetType.name + ")";
    description = chosenAssetType.description;
  }

  let asset = {
    name: assetName,
    description: description,
    class: assetClass,
    type: chosenAssetType,
    upgrades: upgrades,
  };

  return asset;
}

function randomCareers() {
  let careers = [
    {
      name: "Academic",
      descriptors: [
        "Thin",
        "Pallid",
        "Elderly",
        "Kind-hearted",
        "Aloof",
        "Distracted",
      ],
      workspaces: [
        {
          name: "Medical",
          description:
            "Sterile environment. Medbay, cryotubes, surgical servo arms, isolation chamber, recovery ward.",
        },
        {
          name: "Research",
          description:
            "Sensors gather scientific readings. Laboratory, containment units, sample scanners, sealed storage.",
        },
      ],
      advancements: [
        "A life is saved or destroyed by science.",
        "A vital lesson is imparted.",
        "An experiment yields surprising results.",
        "A subject is thoroughly analyzed.",
        "A fascinating phenomenon is explained.",
      ],
      skills: [
        {
          name: "Education",
          description:
            "When you gain one or more Data Points about a subject, each ally that was present or involved also gains a Data Point about the subject.",
        },
        {
          name: "Chemistry",
          description:
            "When creating an antidote, vaccine, drug, poison or pathogen in a lab, state the effect you want it to have and its method of transmission (spray, injector, pill, etc).\nRoll+Expertise.\n On a 10+, you successfully create it.\n On a 7-9, it will have reduced potency or have unintended side effects.",
        },
        {
          name: "Surgery",
          description:
            "When using a medical facility, your Patch Up can be used to install prosthetics and perform surgical reconstruction on living beings. This treats critical injuries.",
        },
        {
          name: "Deduction",
          description:
            "When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.\n Who or what...\n • is most vulnerable in this situation?\n • is most dangerous in this situation?\n • caused this situation?",
        },
        {
          name: "Technobabble",
          description:
            "You can Command crew using Expertise rather than Influence. Subjects of your Command can perform minor technical or scientific tasks, no matter their skill set.",
        },
      ],
    },
    {
      name: "Clandestine",
      descriptors: [
        "Hawk-nosed",
        "Sinister",
        "Wiry",
        "Bland",
        "Suspicious",
        "Bald",
      ],
      workspaces: [
        {
          name: "Stealthy",
          description:
            "Difficult to detect, high tech camouflage, cloaking or concealment. Scanning bafflers, sound dampening, hidden doors/rooms.",
        },
        {
          name: "Secure",
          description:
            "Sensors to track people and movement. Security cameras, monitoring stations, holding cells, security doors.",
        },
      ],
      advancements: [
        'An intentional "accident" happens.',
        "A victim experiences true fear.",
        "A conspiracy is uncovered.",
        "An act is performed covertly.",
        "A dark secret is extracted.",
      ],
      skills: [
        {
          name: "Stealth",
          description:
            "Whenever you can move around freely and are unobserved, you can choose to vanish without a trace. While missing, you may show up in the midst of events, as long as you can explain how you got there.",
        },
        {
          name: "Assassination",
          description:
            "Any successful (10+) Move that results in someone's death also leaves no evidence that you committed the act.",
        },
        {
          name: "Surveillance",
          description:
            "After you Access someone's personal systems, you can track that person's public movements from then on (general location, interactions, transactions, etc). You can only have one surveillance subject at a time.",
        },
        {
          name: "Sabotage",
          description:
            "When you tamper with machines, plans, etc, describe how you go about it and Roll+[Stat].\n On a 10+ the target of your tampering is doomed to fail, just as you planned.\n On a 7-9, the target of your tampering is doomed to fail spectacularly, horrifically or comically, at the GM's discretion. ",
        },
        {
          name: "Interrogation",
          description:
            "When you question someone who is at your mercy, gain 3 Data Points about them: their lives, their job, their transactions, their friends, their family, their guilt, their shame, etc.",
        },
      ],
    },
    {
      name: "Commercial",
      descriptors: [
        "Oily",
        "Well-Fed",
        "Manicured",
        "Harried",
        "Miserly",
        "Cunning",
      ],
      workspaces: [
        {
          name: "Mercantile",
          description:
            "Prominent advertisement, easy access. Large cargo storage space, automatic loader-unloader systems",
        },
        {
          name: "Leisure",
          description:
            "Relaxing, inviting, well-lit. Studio, lounge, entertainment systems, recreation area.",
        },
      ],
      advancements: [
        "A solution is purchased.",
        "A frivolous expense is made.",
        "A celebration is held.",
        "A rich resource is found.",
        "A cargo unit is exchanged.",
      ],
      skills: [
        {
          name: "Outfit",
          description:
            "Own a unique Class 3 Attire. If your attire is ever lost or damaged, you can abandon it and spend an extended period of time claiming new attire as your Outfit, adding an extra upgrade to it.",
        },
        {
          name: "Marketing",
          description:
            "When you arrive in a civilized area, choose a type of market. You can easily find that kind of market here.\n • Elite: High class, exacting.\n • Secretive: Discrete, illicit.\n • Motivated: Fast, agreeable",
        },
        {
          name: "Luxury",
          description:
            "Your clothing, belongings and quarters are all lavish and expensive. Gain one of the following NPCs as a retainer: Butler, Assistant, Consort or Advisor. Name the NPC and give them a 2-4 word description. ",
        },
        {
          name: "Bribe",
          description:
            "You can use Acquisition to purchase the following:\n • Political power\n • Legal decisions\n • Faction involvement\n • Diplomatic immunity",
        },
        {
          name: "Acumen",
          description:
            "When you first visit a market or environment, you may ask one of the following questions, and the GM will answer honestly:\n • What is profitably exploitable here?\n • What is in high demand here?\n • Who is the biggest economic player?",
        },
      ],
    },
    {
      name: "Explorer",
      descriptors: [
        "Weathered",
        "Battered",
        "Unkempt",
        "Rude",
        "Cheerful",
        "Brash",
      ],
      workspaces: [
        {
          name: "Rugged",
          description:
            " Withstands harsh climates and weather. Decontamination units, hydroponics facilities, advanced water/air/waste recyclers, self-sufficient",
        },
        {
          name: "Survey",
          description:
            "Planetary scanners (weather, geological activity, etc). Probe launcher, topography holo-projector, motor-pool.",
        },
      ],
      advancements: [
        "An alien wilderness is traversed.",
        "A bold act fails spectacularly.",
        "A needed item is scrounged up.",
        "A ludicrous stunt turns the tides.",
        "A forgotten place is excavated.",
      ],
      skills: [
        {
          name: "Boldly Go",
          description:
            "When leading an expedition into the unknown, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will choose 1.\n You encounter...\n • something potentially profitable\n • something currently useful\n • something uniquely awesome",
        },
        {
          name: "Reconnaissance",
          description:
            "When you make an Assessment of any aspect of a wilderness (animals, plants, weather, terrain, hazards, etc) you gain 3 Data Points about that subject on a 10+, and 1 Data Point about that subject on a 7-9.",
        },
        {
          name: "Recklessness",
          description:
            "When you make a needlessly risky Move where the odds are a million to one, roll 1d6 instead of making a normal Roll. On a 4, 5 or 6, the Move is a fantastically lucky success. On a 1, 2 or 3, the Move is a spectacularly awful failure with harsh consequences.",
        },
        {
          name: "Survival",
          description:
            "You can scrounge up the following from all but the most barren, inhospitable surroundings:\n • Somewhat edible food and drink\n • Basic medicine or first-aid materials\n • Rustic Wilderness Kit\n • Primitive Class 0 melee weapon",
        },
        {
          name: "Custom Vehicle",
          description:
            "You own a custom-designed Class 3 land vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new land vehicle as your Custom Vehicle, adding an extra upgrade to it.",
        },
      ],
    },
    {
      name: "Industrial",
      descriptors: [
        "Muscled",
        "Grimy",
        "Wrinkled",
        "Rigorous",
        "Rugged",
        "Focused",
      ],
      workspaces: [
        {
          name: "Refinery",
          description:
            "Heavy raw-material collectors. Gathers, processes raw matter into refined materials. Material storage tanks.",
        },
        {
          name: "Manufactory",
          description:
            "Engineering bays. Builds, upgrades and repairs. Workbenches, tool racks, winches, pulleys, lifts.",
        },
      ],
      advancements: [
        "A piece of junk proves pivotal.",
        'A piece of technology is "improved."',
        "A breakage occurs.",
        "An explosion alters the situation.",
        "A structural weakness is exposed.",
      ],
      skills: [
        {
          name: "Repair",
          description:
            "When using a repair bay or workshop, your Patch Up can be used to install replacement parts and perform major reconstruction on machines. This repairs critical and fatal breakages.",
        },
        {
          name: "Construction",
          description:
            "A few hours of work creates a small structure with one of the following traits, or adds that trait to an existing room.\n • Shelter\n • Defensible\n • Concealed\n • Workspace",
        },
        {
          name: "Tinker",
          description:
            "You can assemble the following from scrap metal and spare parts:\n • Shoddy Class 0 melee weapon\n • Makeshift Class 0 explosive\n • Crude Engineering Kit",
        },
        {
          name: "Upgrade",
          description:
            "Your Patch Up can very temporarily add up to one additional upgrade to a weapon or vehicle, briefly increasing its Class by +1. ",
        },
        {
          name: "Dismantle",
          description:
            "When forcefully dismantling, demolishing or breaking something, Roll+Physique.\nOn a 10+, choose 2.\nOn a 7-9, choose 1.\n • It doesn't take very long.\n • It doesn't attract too much attention.\n • You recover useful components.\n • You could rebuild or reassemble it.\n • You gain a Data Point about it.",
        },
      ],
    },
    {
      name: "Military",
      descriptors: [
        "Scarred",
        "Grizzled",
        "Massive",
        "Skittish",
        "Weary",
        "Grim",
      ],
      workspaces: [
        {
          name: "Armored",
          description:
            "Made of reinforced materials. Difficult to damage, can withstand direct impacts and explosions. Reinforced blast doors, structurally sound.",
        },
        {
          name: "Barracks",
          description:
            "Efficient, defensible, practical. Berthing for many soldiers, lockers, gym, training ring, mobilization area.",
        },
      ],
      advancements: [
        "An objective is taken by force.",
        "A perilous order is obeyed.",
        "An injury is sustained.",
        "A problem is resolved with firepower.",
        "A worthy enemy is exterminated.",
      ],
      skills: [
        {
          name: "Tactics",
          description:
            "When you Open Fire or Launch Assault, you choose one or more consequences on a partial success (7-9), not the GM.",
        },
        {
          name: "Toughness",
          description:
            "You can suffer two injuries of each severity, rather than one.",
        },
        {
          name: "Heavy Lifting",
          description:
            "Ignore the Clumsy trait inflicted by heavy weapons, heavy armor, encumbrance and high gravity.",
        },
        {
          name: "Unique Weapon",
          description:
            "Own a unique Class 3 firearm or heavy weapon. If that weapon is ever lost, you can abandon it and spend an extended period of time claiming a new weapon as your Unique Weapon, adding an extra upgrade to it.",
        },
        {
          name: "Authority",
          description:
            "Whenever you are in a position of clear superiority over a group of NPCs, you can Command those NPCs even if the order goes against their own traits, loyalties and willingness",
        },
      ],
    },
    {
      name: "Personality",
      descriptors: [
        "Stunning",
        "Sexy",
        "Chiselled",
        "Placid",
        "Soft",
        "Haughty",
      ],
      workspaces: [
        {
          name: "Habitation",
          description:
            "Living space for many guests or crew. Communal eating rooms, extended life-support/facilities.",
        },
        {
          name: "Stately",
          description:
            "Expensive, luxurious, finely appointed décor. More expensive to maintain, but provides much higher quality of life",
        },
      ],
      advancements: [
        "A relationship changes drastically.",
        "A statement starts or ends a fight.",
        "A difficult promise is upheld.",
        "A rumor spreads like wildfire.",
        "An unlikely hero is exalted.",
      ],
      skills: [
        {
          name: "Fame",
          description:
            "Decide what you are famous/infamous for. Factions, groups and people of importance always know who you are when you meet them. Allies may use your +Influence if they speak in your name, but you'll suffer for any faux-pas.",
        },
        {
          name: "Leadership",
          description:
            "You have a hand-picked, elite Class 3 Crew. Given enough time and training, you can replace lost members of this crew with new NPCs.",
        },
        {
          name: "Inspiration",
          description:
            "Choose an emotion and the medium/art with which you convey it, then Roll+Influence or +Physique.\nOn a 7-9, the emotion takes hold of your audience.\nOn a 10+, as above, and choose 1:\n • You gain a keen admirer.\n • You are treated lavishly.\n • You can Command the audience",
        },
        {
          name: "Contacts",
          description:
            "You have acquaintances and contacts all over the galaxy. When arriving anywhere civilized, introduce a contact. That NPC operates here.",
        },
        {
          name: "Diplomacy",
          description:
            "Factions will ignore political boundaries, jurisdictions, your personal relationship, and even their own prejudices when you call in a Favor.",
        },
      ],
    },
    {
      name: "Scoundrel",
      descriptors: ["Thick", "Dapper", "Sly", "Meaty", "Slick", "Cold"],
      workspaces: [
        {
          name: "Facade",
          description:
            "False identification/registry, disguised as something else. Crawlspaces, hidden compartments, false walls.",
        },
        {
          name: "Sleazy",
          description:
            "Ramshackle, grimy, dimly lit. Space for drinking, smoking, recreational drug use, or other vices.",
        },
      ],
      advancements: [
        "A deal ends in betrayal.",
        "A broken law goes unpunished.",
        "A valuable is stolen.",
        "A threat is preemptively removed.",
        "An unsuspecting victim is exploited.",
      ],
      skills: [
        {
          name: "Criminal",
          description:
            "Any successful (10+) Move that involves theft, smuggling, extortion or similar crimes also leaves no evidence that could indict you",
        },
        {
          name: "Sneak Attack",
          description:
            "When you get the drop on someone, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will give you 2 of the following options, choose 1 of them.\n • Kill them\n • Injure them\n • Rob/disarm them\n • Capture/disable them",
        },
        {
          name: "Scapegoat",
          description:
            "When you would suffer social, legal or financial consequences, name someone and Roll+Expertise.\n On a 10+, they suffer instead.\n On a 7-9, as above. They know it was you.\n On a 6-, it didn't work, and they know what you tried to do.",
        },
        {
          name: "False Identity",
          description:
            "You maintain a number of fake identities that have neutral standing with all factions. As long as a chosen identity holds, your actions do not incur Debt or earn Favor.",
        },
        {
          name: "Addict",
          description:
            "Choose one of your five stats. As long as you regularly dose yourself with your drug of choice, increase that stat by +1. Failure to subsequently dose yourself will reduce that stat by -2 until you dose yourself again or recover from the lengthy effects of withdrawal.",
        },
      ],
    },
    {
      name: "Starfarer",
      descriptors: ["Bony", "Quick", "Tall", "Sunny", "Restless", "Tolerant"],
      workspaces: [
        {
          name: "Navigation",
          description:
            "Wide bay windows, observation decks, star-charts, holo-screens. Satellite uplinks, orbital tracking systems, airspace control/coordination tower",
        },
        {
          name: "Launchpad",
          description:
            "Aircraft/shuttle hangar with wide bay doors, launchpads for shuttles and speeders.",
        },
      ],
      advancements: [
        "A passenger reaches a destination.",
        "A solution leverages gravity.",
        "A piloting maneuver causes a reversal.",
        "A system is pushed to the limit.",
        "A new culture is experienced.",
      ],
      skills: [
        {
          name: "Weightless",
          description:
            "Ignore the Clumsy trait and/or movement restrictions inflicted by microgravity, low-gravity, freefall, climbing and jump jets. A successful (10+) Move while in those situations lets you describe a moment of exceptional acrobatic grace.",
        },
        {
          name: "Cosmopolitan",
          description:
            "When you make an Assessment of any aspect of a society (culture, traditions, laws, government, economy, etc) you gain 3 Data Points about that subject on a 10+, and 1 Data Point about that subject on a 7-9.",
        },
        {
          name: "Navigation",
          description:
            "When you plan a long voyage, choose 1.\nThe voyage will be:\n • Fast - You know a shortcut.\n • Safe - Choose a faction to avoid.\n • Pleasant - +2 to Cramped Quarters.\n • Profitable - If you deliver the passengers who are asking for passage.",
        },
        {
          name: "Calibrations",
          description:
            "When you diligently calibrate your favorite console or vehicle, make a Get Involved using Interface and record the result. The next time anyone uses it, the result of the Get Involved applies.",
        },
        {
          name: "Custom Flyer",
          description:
            "You own a custom-designed Class 3 shuttle or speeder vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new vehicle as your Custom Flyer, adding an extra upgrade to it.",
        },
      ],
    },
    {
      name: "Technocrat",
      descriptors: [
        "Nearsighted",
        "Lanky",
        "Underfed",
        "Smug",
        "Awkward",
        "Intense",
      ],
      workspaces: [
        {
          name: "Communication",
          description:
            "High-powered communications array, transceivers, antennae. Screens, conference rooms, holo-projectors.",
        },
        {
          name: "Observer",
          description:
            "Advanced, multi-band sensors, capable of long-distance scans. Probe launchers. Recording equipment, shielded data storage.",
        },
      ],
      advancements: [
        "A system's security is breached.",
        "A solution is found on the SectorNet.",
        "A computer crash causes chaos.",
        "A pivotal data cluster is accessed.",
        "An offending program is expunged.",
      ],
      skills: [
        {
          name: "Upload",
          description:
            "Expend a Data Point on the SectorNet to have the facts about the subject:\n • be erased, hidden, classified.\n • become common knowledge.\n • be falsified, pivotally altered.",
        },
        {
          name: "Hijack",
          description:
            "When you Access a system, it locks out everyone else. You can open the system to anyone you wish.",
        },
        {
          name: "Program",
          description:
            "When you Access a system, choose a behavior that the system could perform and a condition that will trigger that behavior.",
        },
        {
          name: "Network",
          description:
            "You can simultaneously track the location and health of a dozen willing subjects through a console or HUD. You are able to remotely Get Involved or issue Commands",
        },
        {
          name: "Artificial Intelligence",
          description:
            "You have the loyalty of a digital, artificial intelligence NPC. Give it a name and a 2-4 word description of its personality. It can enter, unlock and activate systems at your Command. Your AI can only be in one system at a time.",
        },
      ],
    },
  ];

  let careerOne = iarnd.item(careers);

  let newCareerList = [];

  careers.forEach(function (element) {
    if (element.name != careerOne.name) {
      newCareerList.push(element);
    }
  });

  let careerTwo = iarnd.item(newCareerList);

  return [careerOne, careerTwo];
}

function randomOrigin() {
  let origins = [
    {
      name: "Advanced",
      descriptors: [
        "Angular",
        "Robust",
        "Strapping",
        "Carefree",
        "Lazy",
        "Arrogant",
      ],
      skills: [
        {
          name: "Cutting Edge",
          description:
            "Interacting with new, advanced technology comes naturally to you. On the other hand, dealing with old, clunky, obsolete dreck is rather aggravating. You gain +1 to your Interface stat, to a maximum of +2.",
        },
        {
          name: "Artificial Intelligence",
          description:
            "You have the loyalty of a digital, artificial intelligence NPC. Give it a name and a 2-4 word description of its personality. It can enter, unlock and activate systems at your Command. Your AI can only be in one system at a time.",
        },
        {
          name: "Custom Flyer",
          description:
            "You own a custom-designed Class 3 shuttle or speeder vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new vehicle as your Custom Vehicle, adding an extra upgrade to it.",
        },
        {
          name: "Surveillance",
          description:
            "After you Access someone's personal systems, you can track that person's public movements from then on (general location, interactions, transactions, etc). You can only have one surveillance subject at a time.",
        },
      ],
    },
    {
      name: "Brutal",
      descriptors: [
        "Tired",
        "Disfigured",
        "Suppressed",
        "Cruel",
        "Angry",
        "Severe",
      ],
      skills: [
        {
          name: "Branded",
          description:
            "You have a prominent, recognisable physical mark (scars, burns, tattoos, prison barcode, slave brand), as a testament to the hardships you've survived. You gain +1 to your Physique stat, to a maximum of +2.",
        },
        {
          name: "Assassination",
          description:
            "Any successful (10+) Move that results in someone's death also leaves no evidence that you committed the act.",
        },
        {
          name: "Toughness",
          description:
            "You can suffer two injuries of each severity, rather than one.",
        },
        {
          name: "Sneak Attack",
          description:
            "When you get the drop on someone, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will give you 2 of the following options, choose 1 of them.\n • Kill them\n • Injure them\n • Rob/disarm them\n • Capture/disable them",
        },
      ],
    },
    {
      name: "Colonist",
      descriptors: [
        "Hard",
        "Serious",
        "Calloused",
        "Dusky",
        "Solid",
        "Prudent",
      ],
      skills: [
        {
          name: "Resourceful",
          description:
            "You're good at making do with limited resources, and getting the most out of what you have, making you a bit of a hoarder. You gain +1 to your Expertise stat, to a maximum of +2.",
        },
        {
          name: "Tinker",
          description:
            "You can assemble the following from scrap metal and spare parts:\n • Shoddy Class 0 melee weapon\n • Makeshift Class 0 explosive\n • Crude Engineering Kit",
        },
        {
          name: "Custom Vehicle",
          description:
            "You own a custom-designed Class 3 land vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new land vehicle as your Custom Vehicle, adding an extra upgrade to it.",
        },
        {
          name: "Heavy Lifting",
          description:
            "Ignore the Clumsy trait inflicted by heavy weapons, heavy armor, encumbrance and high gravity.",
        },
      ],
    },
    {
      name: "Crowded",
      descriptors: [
        "Lively",
        "Compact",
        "Stout",
        "Spare",
        "Loud",
        "Agoraphobic",
      ],
      skills: [
        {
          name: "Affable",
          description:
            "You get along well with almost everyone in your own way. You are most comfortable around others, and get lonely quickly. You gain +1 to your Influence stat, to a maximum of +2.",
        },
        {
          name: "Contacts",
          description:
            "You have acquaintances and contacts all over the galaxy. When arriving anywhere civilized, introduce a contact. That NPC operates here.",
        },
        {
          name: "Network",
          description:
            "You can simultaneously track the location and health of a dozen willing subjects through a console or HUD. You are able to remotely Get Involved or issue Commands.",
        },
        {
          name: "Bribe",
          description:
            "You can use Acquisition to purchase the following:\n • Political power\n • Legal decisions\n • Faction involvement\n • Diplomatic immunity",
        },
      ],
    },
    {
      name: "Galactic",
      descriptors: [
        "Sharp",
        "Guarded",
        "Stoic",
        "Isolated",
        "Energetic",
        "Graceful",
      ],
      skills: [
        {
          name: "Fine Tuning",
          description:
            "You're adept at interfacing with climate controlled living spaces; natural environments tend to be uncomfortable. You gain +1 to your Interface stat, to a maximum of +2.",
        },
        {
          name: "Program",
          description:
            "When you Access a system, choose a behavior that the system could perform and a condition that will trigger that behavior.",
        },
        {
          name: "Weightless",
          description:
            "Ignore the Clumsy trait and/or movement restrictions inflicted by microgravity, low-gravity, freefall, climbing and jump jets. A successful (10+) Move while in those situations lets you describe a moment of exceptional acrobatic grace",
        },
        {
          name: "Repair",
          description:
            "When using a repair bay or workshop, your Patch Up can be used to install replacement parts and perform major reconstruction on machines. This repairs critical and fatal breakages.",
        },
      ],
    },
    {
      name: "Impoverished",
      descriptors: ["Gaunt", "Haggard", "Sickly", "Filthy", "Vulgar", "Fierce"],
      skills: [
        {
          name: "Scrappy",
          description:
            "Life has beaten you down, but you never, ever give up. No matter how bad things get, you rarely back down, even when you really should. You gain +1 to your Mettle stat, to a maximum of +2.",
        },
        {
          name: "Stealth",
          description:
            "Whenever you can move around freely and are unobserved, you can choose to vanish without a trace. While missing, you may show up in the midst of events, as long as you can explain how you got there.",
        },
        {
          name: "Recklessness",
          description:
            "When you make a needlessly risky Move where the odds are a million to one, roll 1d6 instead of making a normal Roll. On a 4, 5 or 6, the Move is a fantastically lucky success. On a 1, 2 or 3, the Move is a spectacularly awful failure with harsh consequences.",
        },
        {
          name: "Criminal",
          description:
            "Any successful (10+) Move that involves theft, smuggling, extortion or similar crimes also leaves no evidence that could indict you",
        },
      ],
    },
    {
      name: "Privileged",
      descriptors: [
        "Manicured",
        "Plump",
        "Groomed",
        "Snobbish",
        "Sleek",
        "Pompous",
      ],
      skills: [
        {
          name: "Decorum",
          description:
            "You are well versed in the rules of etiquette, civility and propriety. You can carry yourself with grace in formal affairs, but are ill-at-ease in casual settings. You gain +1 to your Influence stat, to a maximum of +2.",
        },
        {
          name: "Luxury",
          description:
            "Your clothing, belongings and quarters are all lavish and expensive. Gain one of the following NPCs as a retainer: Butler, Assistant, Consort or Advisor. Name the NPC and give them a 2-4 word description. ",
        },
        {
          name: "Fame",
          description:
            "Decide what you are famous/infamous for. Factions, groups and people of importance always know who you are when you meet them. Allies may use your +Influence if they speak in your name, but you'll suffer for any faux-pas.",
        },
        {
          name: "Scapegoat",
          description:
            "When you would suffer social, legal or financial consequences, name someone and Roll+Expertise.\n On a 10+, they suffer instead.\n On a 7-9, as above. They know it was you.\n On a 6-, it didn't work, and they know what you tried to do.",
        },
      ],
    },
    {
      name: "Productive",
      descriptors: [
        "Slight",
        "Curious",
        "Faded",
        "Greying",
        "Detached",
        "Introverted",
      ],
      skills: [
        {
          name: "Vocation",
          description:
            "You've spent many years training in a variety of techniques and trades. Sadly, you've never had time for fun or relaxation. You gain +1 to your Expertise stat, to a maximum of +2",
        },
        {
          name: "Calibrations",
          description:
            "When you diligently calibrate your favorite console or vehicle, make a Get Involved using Interface and record the result. The next time anyone uses it, the result of the Get Involved applies.",
        },
        {
          name: "Education",
          description:
            "When you gain one or more Data Points about a subject, each ally that was present or involved also gains a Data Point about the subject.",
        },
        {
          name: "Acumen",
          description:
            "When you first visit a market or environment, you may ask one of the following questions, and the GM will answer honestly:\n • What is profitably exploitable here?\n • What is in high demand here?\n • Who is the biggest economic player?",
        },
      ],
    },
    {
      name: "Regimented",
      descriptors: [
        "Athletic",
        "Meditative",
        "Sturdy",
        "Organised",
        "Formal",
        "Strict",
      ],
      skills: [
        {
          name: "Discipline",
          description:
            "You know the rules, the codes, the processes, the scripture, the laws. They give you stability. You don't deal well with change. You gain +1 to your Mettle stat, to a maximum of +2.",
        },
        {
          name: "Leadership",
          description:
            "You have a hand-picked, elite Class 3 Crew. Given enough time and training, you can replace lost members of this crew with new NPCs. ",
        },
        {
          name: "Tactics",
          description:
            "When you Open Fire or Launch Assault, you choose one or more consequences on a partial success (7-9), not the GM.",
        },
        {
          name: "Deduction",
          description:
            "When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.\n Who or what...\n • is most vulnerable in this situation?\n • is most dangerous in this situation?\n • caused this situation?",
        },
      ],
    },
    {
      name: "Rustic",
      descriptors: ["Wrinkled", "Creaking", "Wiry", "Aged", "Weary", "Strong"],
      skills: [
        {
          name: "Hard Labor",
          description:
            "You can perform long grueling hours of physical labor with minimal rest. You've collected a wide variety of aches, pains and minor ailments from doing this. You gain +1 to your Physique stat, to a maximum of +2.",
        },
        {
          name: "Construction",
          description:
            "A few hours of work creates a small structure with one of the following traits, or adds that trait to an existing room.\n • Shelter\n • Defensible\n • Concealed\n • Workspace",
        },
        {
          name: "Survival",
          description:
            "You can scrounge up the following from all but the most barren, inhospitable surroundings:\n • Somewhat edible food and drink\n • Basic medicine or first-aid materials\n • Rustic Wilderness Kit\n • Primitive Class 0 melee weapon",
        },
        {
          name: "Chemistry",
          description:
            "When creating an antidote, vaccine, drug, poison or pathogen in a lab, state the effect you want it to have and its method of transmission (spray, injector, pill, etc).\nRoll+Expertise.\n On a 10+, you successfully create it.\n On a 7-9, it will have reduced potency or have unintended side effects.",
        },
      ],
    },
  ];
  return iarnd.item(origins);
}

function randomStats() {
  let stats = ["+2", "+1", "+1", "+0", "-1"];

  let result = {
    physique: "",
    mettle: "",
    expertise: "",
    influence: "",
    interface: "",
  };

  stats = iarnd.shuffle(stats);

  result.physique = stats.pop();
  result.mettle = stats.pop();
  result.expertise = stats.pop();
  result.influence = stats.pop();
  result.interface = stats.pop();

  return result;
}

function skillsInclude(skillName, skills) {
  let includes = false;

  skills.forEach(function (element) {
    if (element.name == skillName) {
      includes = true;
    }
  });

  return includes;
}

export function formatAsText(character) {
  let description = Text.header("Uncharted Worlds Character");

  description += Text.header("Statistics");

  description += "Physique: " + character.stats.physique + "\n";
  description += "Mettle: " + character.stats.mettle + "\n";
  description += "Expertise: " + character.stats.expertise + "\n";
  description += "Influence: " + character.stats.influence + "\n";
  description += "Interface: " + character.stats.interface + "\n";

  description += Text.header("Careers");

  let careers = [];

  for (let i=0;i<character.careers.length;i++) {
    careers.push(character.careers[i].name);
  }

  description += Text.list(careers);

  description += "Origin: " + character.origin.name + "\n";

  description += "Descriptors: " + character.descriptors + "\n";

  description += Text.header("Skills");

  for (let i=0;i<character.skills.length;i++) {
    description += Text.header(character.skills[i].name);
    description += character.skills[i].description + "\n";
  }

  description += "\nAdvancement: " + character.advancement + "\n";

  description += Text.header("Assets");

  for (let i=0;i<character.assets.length;i++) {
    description += Text.header(character.assets[i].name);

    description += character.assets[i].description + "\n";

    for (let j=0;j<character.assets[i].upgrades.length;j++) {
      description += character.assets[i].upgrades[j].name + ": " + character.assets[i].upgrades[j].description + "\n";
    }
  }

  return description;
}

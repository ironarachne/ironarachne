import type { AssetTemplate } from './character';

/**
 * The gear a character can start play with, as templates rather than finished assets.
 *
 * A template names the kinds an asset comes in (`types`), the upgrades every one of them has
 * (`commonTraits`), and the ones bought with an asset's class points (`upgrades`). Character
 * generation picks a template, a type, and then as many upgrades as the asset's class allows.
 */
export const ASSET_TEMPLATES: AssetTemplate[] = [
  {
    name: 'Attire',
    types: [
      {
        name: 'Rugged',
        description: 'Crude, patched, aged and worn.',
      },
      {
        name: 'Simple',
        description: 'Utilitarian, favors function over looks.',
      },
      {
        name: 'Cultural',
        description: 'Incorporates popular styles/elements of a culture.',
      },
      {
        name: 'Formal',
        description: 'Well cut and stylish.',
      },
      {
        name: 'Uniform',
        description: 'Easily identifiable as belonging to a specific faction or group.',
      },
    ],
    commonTraits: [],
    upgrades: [
      {
        name: 'Armored',
        description: '+2 Armor.',
        extraUpgrades: 0,
      },
      {
        name: 'Carapace',
        description: 'Clumsy, +3 Armor.',
        extraUpgrades: 0,
      },
      {
        name: 'Comms',
        description: 'Can receive and broadcast signals over great distances.',
        extraUpgrades: 0,
      },
      {
        name: 'Connected',
        description: 'Built-in CPU with eye-piece HUD, connects wirelessly to other systems.',
        extraUpgrades: 0,
      },
      {
        name: 'Impressive',
        description: 'Distinctive, intimidating, with embellishments and accessories.',
        extraUpgrades: 0,
      },
      {
        name: 'Jump Jets',
        description: 'Can give small burst jumps, slow descent, and controlled flight in zero-g.',
        extraUpgrades: 0,
      },
      {
        name: 'Meshweave',
        description: '+1 Armor that looks like normal fabric.',
        extraUpgrades: 0,
      },
      {
        name: 'Rig',
        description:
          'Choose a Kit: That Kit is integrated in the suit. Can still carry a second Kit.',
        extraUpgrades: 0,
      },
      {
        name: 'Tough',
        description: 'Protects from elements, hard to damage, easy to repair.',
        extraUpgrades: 0,
      },
      {
        name: 'Sealed',
        description: 'Airtight suit with helmet and oxygen tank.',
        extraUpgrades: 0,
      },
      {
        name: 'Sensor',
        description: 'Choose a type of information. The wrist screen scans for that subject.',
        extraUpgrades: 0,
      },
      {
        name: 'Shielded',
        description: '+1 Armor provided by thin, invisible energy shield projected by the suit.',
        extraUpgrades: 0,
      },
      {
        name: 'Stealthy',
        description: 'Muffled, blends in to environments, difficult to pick up on scanners.',
        extraUpgrades: 0,
      },
      {
        name: 'Visor',
        description: 'Choose a type of information. The visor detects that subject.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Crew',
    types: [
      {
        name: 'Squad',
        description:
          'Disciplined and stolid. Equipped with a similar type of weaponry (pistols, stun batons, rifles, etc). Able to guard areas and engage in small-scale combat.',
      },
      {
        name: 'Techs',
        description:
          'Educated and well trained. Equipped with basic tools. Able to provide technical or manual assistance to a variety of scientific or engineering projects.',
      },
      {
        name: 'Staff',
        description:
          'Refined and professional. Able to serve guests, keep accounts, prepare meals and perform daily household chores.',
      },
      {
        name: 'Gang',
        description:
          'Crude and self-reliant. Equipped with a smattering of mismatched weaponry (pistols, shotguns, chains, knives, etc). Able to attack people or break things.',
      },
    ],
    commonTraits: [],
    upgrades: [
      {
        name: 'Armed',
        description:
          'Choose a Class 1 Firearm. The crew is equipped with it and trained in its use.',
        extraUpgrades: 0,
      },
      {
        name: 'Artillery',
        description: 'Able to bombard with artillery, turrets or starship weaponry.',
        extraUpgrades: 0,
      },
      {
        name: 'Athletic',
        description: 'Graceful, swift, strong and flexible. Much better than average, physically.',
        extraUpgrades: 0,
      },
      {
        name: 'Beautiful',
        description: 'Chosen for their good looks and wit. Able to distract and entertain.',
        extraUpgrades: 0,
      },
      {
        name: 'Builders',
        description: 'Able to build small structures or assist in construction projects.',
        extraUpgrades: 0,
      },
      {
        name: 'Criminal',
        description: 'Able to commit small-scale criminal activity or assist with larger crimes.',
        extraUpgrades: 0,
      },
      {
        name: 'Equipped',
        description:
          'Choose a Kit. The crew carries various tools from that kit, and can use them.',
        extraUpgrades: 0,
      },
      {
        name: 'Fearless',
        description: 'Never afraid or intimidated, will follow insane orders but often go too far.',
        extraUpgrades: 0,
      },
      {
        name: 'Imposing',
        description: 'Imposing in some way. Able to frighten, threaten, dissuade, etc.',
        extraUpgrades: 0,
      },
      {
        name: 'Informants',
        description: 'Able to collect information and report back, or pass on information.',
        extraUpgrades: 0,
      },
      {
        name: 'Loyal',
        description: 'Only take orders from you. Quickly recovers to their normal disposition.',
        extraUpgrades: 0,
      },
      {
        name: 'Mechanics',
        description: 'Able to service and maintain machinery, and assist in repairs and overhauls.',
        extraUpgrades: 0,
      },
      {
        name: 'Medics',
        description: 'Able to provide long-term convalescent care or assist in medical procedures.',
        extraUpgrades: 0,
      },
      {
        name: 'Numerous',
        description:
          'There are a large number of them, you have trouble keeping track of them all.',
        extraUpgrades: 0,
      },
      {
        name: 'Rugged',
        description: 'Can work in harsh climates for extended periods of time.',
        extraUpgrades: 0,
      },
      {
        name: 'Stealthy',
        description: 'Able to sneak into (or out of) places, and pass unnoticed.',
        extraUpgrades: 0,
      },
      {
        name: 'Teamsters',
        description:
          'Able to quickly load, unload, assemble and pack away heavy objects and cargo.',
        extraUpgrades: 0,
      },
      {
        name: 'Wreckers',
        description: 'Able to destroy terrain and structures.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Explosive',
    types: [
      {
        name: 'Grenade',
        description: 'One-handed thrown explosive. Optimal Range: Close',
      },
      {
        name: 'Charge',
        description: 'Two-handed placed explosive. Optimal Range: Melee',
      },
    ],
    commonTraits: [],
    upgrades: [
      {
        name: 'Breaching',
        description: 'Breaches reinforced buildings and starships. Charge only.',
        extraUpgrades: 0,
      },
      {
        name: 'Chemical',
        description: 'Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc.',
        extraUpgrades: 0,
      },
      {
        name: 'Cluster',
        description: 'Scatters secondary explosives in the area of effect, which then detonate.',
        extraUpgrades: 0,
      },
      {
        name: 'Concealed',
        description: "Inconspicuous, easily hidden, doesn't show on scanners.",
        extraUpgrades: 0,
      },
      {
        name: 'Concussive',
        description: 'Exceptionally loud and bright. Deafens, blinds and knocks away.',
        extraUpgrades: 0,
      },
      {
        name: 'Destructive',
        description: 'Causes property damage, damages machinery and vehicles. Grenade only.',
        extraUpgrades: 0,
      },
      {
        name: 'Focused',
        description: 'Directed high explosive force, little collateral damage.',
        extraUpgrades: 0,
      },
      {
        name: 'Haywire',
        description: 'Disrupts electronic systems, scanners and advanced weaponry.',
        extraUpgrades: 0,
      },
      {
        name: 'High Yield',
        description: 'Massive area of effect, city block or more. Charge only.',
        extraUpgrades: 0,
      },
      {
        name: 'Kinetic',
        description: 'Heavy kinetic force that breaks bones and knocks people over.',
        extraUpgrades: 0,
      },
      {
        name: 'Plasma',
        description: 'Creates a nova of incandescent energy that vaporizes matter.',
        extraUpgrades: 0,
      },
      {
        name: 'Shock',
        description: 'Electrocutes, causes malfunctions in electronics and robots.',
        extraUpgrades: 0,
      },
      {
        name: 'Shrapnel',
        description: 'Causes amputation, bleeding and disfigurement in a wide radius.',
        extraUpgrades: 0,
      },
      {
        name: 'Sticky',
        description: 'Attaches itself to any surface, difficult to remove.',
        extraUpgrades: 0,
      },
      {
        name: 'Stun',
        description: 'Non-lethal. Stuns, snares or renders unconscious.',
        extraUpgrades: 0,
      },
      {
        name: 'Stylish',
        description: 'The explosion looks impressive, distinctive and unique.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Firearm',
    types: [
      {
        name: 'Pistol',
        description: 'One handed ranged weapon, Optimal Ranges: Adjacent, Close.',
      },
      {
        name: 'Rifle',
        description: 'Two handed ranged weapon, Optimal Ranges: Close, Far.',
      },
    ],
    commonTraits: [],
    upgrades: [
      {
        name: 'Attachment',
        description: 'Attach Class 0 Small weapon with Sharp, Ripper, Energy or Shock.',
        extraUpgrades: 0,
      },
      {
        name: 'Burst',
        description: 'Instead of a single shot, sprays shots in a wide cone.',
        extraUpgrades: 0,
      },
      {
        name: 'Concealed',
        description: "Inconspicuous, easily hidden, doesn't show on scanners.",
        extraUpgrades: 0,
      },
      {
        name: 'Chemical',
        description: 'Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc.',
        extraUpgrades: 0,
      },
      {
        name: 'Destructive',
        description: 'Causes property damage, damages machinery and vehicles.',
        extraUpgrades: 0,
      },
      {
        name: 'Explosive',
        description: 'Loud. Causes messy wounds, property damage near the point of impact.',
        extraUpgrades: 0,
      },
      {
        name: 'Impact',
        description: 'Heavy kinetic force that breaks bones and knocks people over.',
        extraUpgrades: 0,
      },
      {
        name: 'Keyed',
        description: 'Can only be fired by you unless you unlock it.',
        extraUpgrades: 0,
      },
      {
        name: 'Laser',
        description: 'Projects focused beams of energy that can cut or melt materials.',
        extraUpgrades: 0,
      },
      {
        name: 'Launcher',
        description: 'Lobbed, arcing projectile with a modest area of effect.',
        extraUpgrades: 0,
      },
      {
        name: 'Mounted',
        description: 'Mounted to a forearm or shoulder rig, keeps hands free.',
        extraUpgrades: 0,
      },
      {
        name: 'Penetrating',
        description: 'Ignores Armor.',
        extraUpgrades: 0,
      },
      {
        name: 'Plasma',
        description: 'Fires bright bolts of supercharged, burning energy.',
        extraUpgrades: 0,
      },
      {
        name: 'Rapid Fire',
        description: 'Unleashes suppressing fire at multiple targets.',
        extraUpgrades: 0,
      },
      {
        name: 'Scope',
        description: 'Can fire at distant objects. Optimal Ranges: Far, Distant.',
        extraUpgrades: 0,
      },
      {
        name: 'Shock',
        description: 'Electrocutes, causes malfunctions in electronics and robots.',
        extraUpgrades: 0,
      },
      {
        name: 'Shrapnel',
        description: 'Causes amputation, bleeding and disfigurement in a small radius.',
        extraUpgrades: 0,
      },
      {
        name: 'Silenced',
        description: 'Suppressed muzzle flash and practically silent shot.',
        extraUpgrades: 0,
      },
      {
        name: 'Stabilized',
        description: 'No recoil, can be used in micro-gravity environments.',
        extraUpgrades: 0,
      },
      {
        name: 'Stun',
        description: 'Non-lethal. Stuns, snares or renders unconscious.',
        extraUpgrades: 0,
      },
      {
        name: 'Stylish',
        description: 'Looks impressive, distinctive and unique.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Flyer',
    types: [
      {
        name: 'Shuttle',
        description:
          'A tiny, maneuverable flying vehicle. Space for a pilot and at most one passenger.',
      },
      {
        name: 'Speeder',
        description:
          'A flying vehicle for up to six people that can hover and take off vertically.',
      },
    ],
    commonTraits: [],
    upgrades: [
      {
        name: 'Agile',
        description: 'Quick, maneuverable, able to perform stunts.',
        extraUpgrades: 0,
      },
      {
        name: 'Armored',
        description: '+2 Armor.',
        extraUpgrades: 0,
      },
      {
        name: 'Armed',
        description:
          'A heavy weapon (purchased separately) attached to the vehicle, fired by the pilot.',
        extraUpgrades: 0,
      },
      {
        name: 'Controlled',
        description: 'Can be remotely activated and given directions with Interface.',
        extraUpgrades: 0,
      },
      {
        name: 'Luxury',
        description:
          'Impressive, high quality and very comfortable. Various quality-of-life features.',
        extraUpgrades: 0,
      },
      {
        name: 'Rugged',
        description: 'Protects from elements, resists environmental damage, easy to repair.',
        extraUpgrades: 0,
      },
      {
        name: 'Sealed',
        description:
          'Fully enclosed frame with oxygen source. Can function in space, under water, etc.',
        extraUpgrades: 0,
      },
      {
        name: 'Sensors',
        description: 'The vehicle gathers various types of information.',
        extraUpgrades: 0,
      },
      {
        name: 'Shielded',
        description: '+1 Armor provided by extended grav field. Blocks remote Access and hacking.',
        extraUpgrades: 0,
      },
      {
        name: 'Stealthy',
        description: 'Silent, difficult to pick up on sensors, occupants invisible to sensors.',
        extraUpgrades: 0,
      },
      {
        name: 'Tool',
        description: 'Choose a melee weapon upgrade to represent a tool attached to this vehicle.',
        extraUpgrades: 0,
      },
      {
        name: 'Transport',
        description: 'Can carry a dozen people or a cargo container. Shuttle only.',
        extraUpgrades: 0,
      },
      {
        name: 'Turret',
        description:
          'A heavy weapon (purchased separately) on a swivel mount, fired by a passenger.',
        extraUpgrades: 0,
      },
      {
        name: 'Workspace',
        description: 'Choose a Kit to be integrated into the vehicle.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Heavy Weapon',
    types: [],
    commonTraits: [
      {
        name: 'Heavy Weapon',
        description: 'Two-handed ranged weapon. Optimal Ranges: Far, Distant.',
        extraUpgrades: 0,
      },
      {
        name: 'Destructive',
        description: 'Causes property damage, damages machinery and vehicles.',
        extraUpgrades: 0,
      },
      {
        name: 'Clumsy',
        description: 'Heavy and awkward, forces Face Adversity on physical activity.',
        extraUpgrades: 0,
      },
    ],
    upgrades: [
      {
        name: 'Breaching',
        description: 'Damages starships and reinforced structures.',
        extraUpgrades: 0,
      },
      {
        name: 'Chemical',
        description: 'Creates lasting chemical reaction. Ex: fire, corrosion, frost, smoke, etc.',
        extraUpgrades: 0,
      },
      {
        name: 'Concussive',
        description: 'Exceptionally loud and bright. Deafens, blinds and knocks away.',
        extraUpgrades: 0,
      },
      {
        name: 'Detonation',
        description: 'Explodes in a large blast radius.',
        extraUpgrades: 0,
      },
      {
        name: 'Impact',
        description: 'Heavy kinetic force that breaks bones and knocks people over.',
        extraUpgrades: 0,
      },
      {
        name: 'Keyed',
        description: 'Can only be fired by you unless you unlock it.',
        extraUpgrades: 0,
      },
      {
        name: 'Laser',
        description: 'Projects focused beams of energy that can cut or melt materials.',
        extraUpgrades: 0,
      },
      {
        name: 'Penetrating',
        description: 'Ignores Armor.',
        extraUpgrades: 0,
      },
      {
        name: 'Plasma',
        description: 'Fires bright bolts of supercharged, burning energy.',
        extraUpgrades: 0,
      },
      {
        name: 'Seeking',
        description: 'Projectile arcs towards a moving target.',
        extraUpgrades: 0,
      },
      {
        name: 'Shock',
        description: 'Electrocutes, causes malfunctions in electronics and robots.',
        extraUpgrades: 0,
      },
      {
        name: 'Shrapnel',
        description: 'Causes amputation, bleeding and disfigurement in a wide radius.',
        extraUpgrades: 0,
      },
      {
        name: 'Spray',
        description: 'Reduce distance, coverage increased to wide cone. Optimal Range: Close.',
        extraUpgrades: 0,
      },
      {
        name: 'Stun',
        description: 'Non-lethal. Stuns, snares or renders unconscious.',
        extraUpgrades: 0,
      },
      {
        name: 'Stylish',
        description: 'Looks impressive, distinctive and unique.',
        extraUpgrades: 0,
      },
      {
        name: 'Sustained',
        description: 'Unleashes a constant suppressing fire at multiple targets.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Land Vehicle',
    types: [
      {
        name: 'Bike',
        description: 'A fast, two-wheeled vehicle with a maneuverable frame. Up to one passenger.',
      },
      {
        name: 'Groundcar',
        description: 'A sturdy 4 or 6-wheeled transport. Fits a driver plus up to 4 passengers.',
      },
      {
        name: 'Walker',
        description: 'A bipedal humanoid chassis with lifter arms. 1 pilot suspended within.',
      },
      {
        name: 'QuadWalker',
        description: 'A quadruped vehicle for up to 3 people. All-terrain mobility with stability.',
      },
    ],
    commonTraits: [],
    upgrades: [
      {
        name: 'Agile',
        description: 'Quick, maneuverable, able to perform stunts.',
        extraUpgrades: 0,
      },
      {
        name: 'Armed',
        description:
          'A heavy weapon (purchased separately) attached to the vehicle, fired by the pilot.',
        extraUpgrades: 0,
      },
      {
        name: 'Boosters',
        description: 'Greatly increases overland speed. Allows short jumps.',
        extraUpgrades: 0,
      },
      {
        name: 'Controlled',
        description: 'Can be remotely activated and given directions.',
        extraUpgrades: 0,
      },
      {
        name: 'Luxury',
        description:
          'Impressive, high quality and very comfortable. Various quality-of-life features.',
        extraUpgrades: 0,
      },
      {
        name: 'Plated',
        description: '+3 Armor.',
        extraUpgrades: 0,
      },
      {
        name: 'Reinforced',
        description: 'Slow. +3 Armor. Ignores Armor Piercing and Destructive. Must be Breached.',
        extraUpgrades: 0,
      },
      {
        name: 'Rugged',
        description: 'Protects from elements, resists environmental damage, easy to repair.',
        extraUpgrades: 0,
      },
      {
        name: 'Sealed',
        description:
          'Fully enclosed frame with oxygen source. Can function in space, under water, etc.',
        extraUpgrades: 0,
      },
      {
        name: 'Sensors',
        description: 'The vehicle gathers various types of information.',
        extraUpgrades: 0,
      },
      {
        name: 'Stealthy',
        description: 'Silent, difficult to pick up on sensors, occupants invisible to sensors.',
        extraUpgrades: 0,
      },
      {
        name: 'Tool',
        description: 'Choose a melee weapon upgrade to represent a tool attached to this vehicle.',
        extraUpgrades: 0,
      },
      {
        name: 'Transport',
        description:
          'Can carry a dozen people or a cargo container. Groundcar and QuadWalker only.',
        extraUpgrades: 0,
      },
      {
        name: 'Turret',
        description:
          'A heavy weapon (purchased separately) on a swivel mount, fired by a passenger.',
        extraUpgrades: 0,
      },
      {
        name: 'Workspace',
        description: 'Choose a Kit to be integrated into the vehicle.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Melee Weapon',
    types: [],
    commonTraits: [
      {
        name: 'Melee Weapon',
        description: 'Optimal Range: Melee.',
        extraUpgrades: 0,
      },
      {
        name: 'Basic Form',
        description: 'Choose 1 free upgrade (basic weapon form; this is already accounted for)',
        extraUpgrades: 1,
      },
    ],
    upgrades: [
      {
        name: 'Concealed',
        description: "Inconspicuous, easily hidden, doesn't show on scanners.",
        extraUpgrades: 0,
      },
      {
        name: 'Defensive',
        description: 'Can parry, deflect and disarm.',
        extraUpgrades: 0,
      },
      {
        name: 'Destructive',
        description: 'Causes property damage, damages machinery and vehicles.',
        extraUpgrades: 0,
      },
      {
        name: 'Energy',
        description: 'Glows with incandescent energy, melts, burns, cauterizes.',
        extraUpgrades: 0,
      },
      {
        name: 'Flexible',
        description: 'Whip length capable of binding and lashing. Optimal Range: Adjacent',
        extraUpgrades: 0,
      },
      {
        name: 'Glove',
        description: 'A heavy, weaponized glove. Can still manipulate objects.',
        extraUpgrades: 0,
      },
      {
        name: 'Hafted',
        description: 'Two handed. Long reach. Sweeping attacks. Range: Melee, Adjacent',
        extraUpgrades: 0,
      },
      {
        name: 'Heavy',
        description: 'Two handed. Massive, resilient. Devastating attacks, hard to block.',
        extraUpgrades: 0,
      },
      {
        name: 'Impact',
        description: 'Heavy kinetic force that breaks bones and knocks people over.',
        extraUpgrades: 0,
      },
      {
        name: 'Impaling',
        description: 'Can pin targets, pierce thin materials, and stab with great accuracy.',
        extraUpgrades: 0,
      },
      {
        name: 'Penetrating',
        description: 'Ignores Armor.',
        extraUpgrades: 0,
      },
      {
        name: 'Ripper',
        description: 'Loud mechanical motion rips, tears, grinds or shreds.',
        extraUpgrades: 0,
      },
      {
        name: 'Severing',
        description: 'Chops, cuts, causes bleeding and can sever limbs.',
        extraUpgrades: 0,
      },
      {
        name: 'Shock',
        description: 'Electrocutes, causes malfunctions in electronics and robots.',
        extraUpgrades: 0,
      },
      {
        name: 'Stun',
        description: 'Non-lethal. Stuns, snares or renders unconscious.',
        extraUpgrades: 0,
      },
      {
        name: 'Stylish',
        description: 'Looks impressive, distinctive and unique.',
        extraUpgrades: 0,
      },
      {
        name: 'Thrown',
        description: 'Handful of small weapons/ single two-handed. Range: Adjacent, Close.',
        extraUpgrades: 0,
      },
    ],
  },
  {
    name: 'Kit',
    types: [
      {
        name: 'Broadcast',
        description:
          'Tools to send and receive signals. Collapsible broadcast antenna, signal boosters, wires, vid screens, recording hardware, portable data drives, etc.',
      },
      {
        name: 'Computer',
        description:
          'Tools to access, program, diagnose and repair computer systems. Laptops, diagnostic tools, wires, handheld power sources, portable data drives, etc.',
      },
      {
        name: 'Engineering',
        description:
          'Tools to repair and dismantle machinery. Hammers, drills, cutters, wrenches, welders, grips, cables, diagnostic tools, cage lamps, misc spare parts, etc.',
      },
      {
        name: 'Infiltration',
        description:
          'Tools to gain access to forbidden places. Mechanical lockpicks, intrusion hardware, chloroform, glass cutters, disguises, ropes, climbing tools, etc.',
      },
      {
        name: 'Medical',
        description:
          'Tools to perform medical treatments. Bandages, scalpels, gels, stimms, surgical braces, dermal regen spray, etc.',
      },
      {
        name: 'Research',
        description:
          'Tools to study and experiment out in the field. Specimen jars, hammer and chisel, scalpels, chemical analyser, data recorder, etc.',
      },
      {
        name: 'Survey',
        description:
          'Tools to observe and monitor. Range finders, tracking devices, motion sensors, deep scanner tripod, holo-map projector, data recorder, deployabletransmitter, etc.',
      },
      {
        name: 'Wilderness',
        description:
          'Tools to traverse hostile landscapes. Ropes, climbing tools, light sources, breather mask, tent, sleeping bag, heat lamp, thermal blanket, water filter, etc.',
      },
    ],
    commonTraits: [],
    upgrades: [],
  },
];

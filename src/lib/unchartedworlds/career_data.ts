import type { Career } from './character';

/**
 * The careers a character can have had, each with the workspaces it grants access to, the
 * story beats it puts on the table (`advancements`), and the skills it can teach.
 */
export const CAREERS: Career[] = [
  {
    name: 'Academic',
    descriptors: ['Thin', 'Pallid', 'Elderly', 'Kind-hearted', 'Aloof', 'Distracted'],
    workspaces: [
      {
        name: 'Medical',
        description:
          'Sterile environment. Medbay, cryotubes, surgical servo arms, isolation chamber, recovery ward.',
      },
      {
        name: 'Research',
        description:
          'Sensors gather scientific readings. Laboratory, containment units, sample scanners, sealed storage.',
      },
    ],
    advancements: [
      'A life is saved or destroyed by science.',
      'A vital lesson is imparted.',
      'An experiment yields surprising results.',
      'A subject is thoroughly analyzed.',
      'A fascinating phenomenon is explained.',
    ],
    skills: [
      {
        name: 'Education',
        description:
          'When you gain one or more Data Points about a subject, each ally that was present or involved also gains a Data Point about the subject.',
      },
      {
        name: 'Chemistry',
        description:
          'When creating an antidote, vaccine, drug, poison or pathogen in a lab, state the effect you want it to have and its method of transmission (spray, injector, pill, etc).\nRoll+Expertise.\n On a 10+, you successfully create it.\n On a 7-9, it will have reduced potency or have unintended side effects.',
      },
      {
        name: 'Surgery',
        description:
          'When using a medical facility, your Patch Up can be used to install prosthetics and perform surgical reconstruction on living beings. This treats critical injuries.',
      },
      {
        name: 'Deduction',
        description:
          'When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.\n Who or what...\n • is most vulnerable in this situation?\n • is most dangerous in this situation?\n • caused this situation?',
      },
      {
        name: 'Technobabble',
        description:
          'You can Command crew using Expertise rather than Influence. Subjects of your Command can perform minor technical or scientific tasks, no matter their skill set.',
      },
    ],
  },
  {
    name: 'Clandestine',
    descriptors: ['Hawk-nosed', 'Sinister', 'Wiry', 'Bland', 'Suspicious', 'Bald'],
    workspaces: [
      {
        name: 'Stealthy',
        description:
          'Difficult to detect, high tech camouflage, cloaking or concealment. Scanning bafflers, sound dampening, hidden doors/rooms.',
      },
      {
        name: 'Secure',
        description:
          'Sensors to track people and movement. Security cameras, monitoring stations, holding cells, security doors.',
      },
    ],
    advancements: [
      'An intentional "accident" happens.',
      'A victim experiences true fear.',
      'A conspiracy is uncovered.',
      'An act is performed covertly.',
      'A dark secret is extracted.',
    ],
    skills: [
      {
        name: 'Stealth',
        description:
          'Whenever you can move around freely and are unobserved, you can choose to vanish without a trace. While missing, you may show up in the midst of events, as long as you can explain how you got there.',
      },
      {
        name: 'Assassination',
        description:
          "Any successful (10+) Move that results in someone's death also leaves no evidence that you committed the act.",
      },
      {
        name: 'Surveillance',
        description:
          "After you Access someone's personal systems, you can track that person's public movements from then on (general location, interactions, transactions, etc). You can only have one surveillance subject at a time.",
      },
      {
        name: 'Sabotage',
        description:
          "When you tamper with machines, plans, etc, describe how you go about it and Roll+[Stat].\n On a 10+ the target of your tampering is doomed to fail, just as you planned.\n On a 7-9, the target of your tampering is doomed to fail spectacularly, horrifically or comically, at the GM's discretion. ",
      },
      {
        name: 'Interrogation',
        description:
          'When you question someone who is at your mercy, gain 3 Data Points about them: their lives, their job, their transactions, their friends, their family, their guilt, their shame, etc.',
      },
    ],
  },
  {
    name: 'Commercial',
    descriptors: ['Oily', 'Well-Fed', 'Manicured', 'Harried', 'Miserly', 'Cunning'],
    workspaces: [
      {
        name: 'Mercantile',
        description:
          'Prominent advertisement, easy access. Large cargo storage space, automatic loader-unloader systems',
      },
      {
        name: 'Leisure',
        description:
          'Relaxing, inviting, well-lit. Studio, lounge, entertainment systems, recreation area.',
      },
    ],
    advancements: [
      'A solution is purchased.',
      'A frivolous expense is made.',
      'A celebration is held.',
      'A rich resource is found.',
      'A cargo unit is exchanged.',
    ],
    skills: [
      {
        name: 'Outfit',
        description:
          'Own a unique Class 3 Attire. If your attire is ever lost or damaged, you can abandon it and spend an extended period of time claiming new attire as your Outfit, adding an extra upgrade to it.',
      },
      {
        name: 'Marketing',
        description:
          'When you arrive in a civilized area, choose a type of market. You can easily find that kind of market here.\n • Elite: High class, exacting.\n • Secretive: Discrete, illicit.\n • Motivated: Fast, agreeable',
      },
      {
        name: 'Luxury',
        description:
          'Your clothing, belongings and quarters are all lavish and expensive. Gain one of the following NPCs as a retainer: Butler, Assistant, Consort or Advisor. Name the NPC and give them a 2-4 word description. ',
      },
      {
        name: 'Bribe',
        description:
          'You can use Acquisition to purchase the following:\n • Political power\n • Legal decisions\n • Faction involvement\n • Diplomatic immunity',
      },
      {
        name: 'Acumen',
        description:
          'When you first visit a market or environment, you may ask one of the following questions, and the GM will answer honestly:\n • What is profitably exploitable here?\n • What is in high demand here?\n • Who is the biggest economic player?',
      },
    ],
  },
  {
    name: 'Explorer',
    descriptors: ['Weathered', 'Battered', 'Unkempt', 'Rude', 'Cheerful', 'Brash'],
    workspaces: [
      {
        name: 'Rugged',
        description:
          ' Withstands harsh climates and weather. Decontamination units, hydroponics facilities, advanced water/air/waste recyclers, self-sufficient',
      },
      {
        name: 'Survey',
        description:
          'Planetary scanners (weather, geological activity, etc). Probe launcher, topography holo-projector, motor-pool.',
      },
    ],
    advancements: [
      'An alien wilderness is traversed.',
      'A bold act fails spectacularly.',
      'A needed item is scrounged up.',
      'A ludicrous stunt turns the tides.',
      'A forgotten place is excavated.',
    ],
    skills: [
      {
        name: 'Boldly Go',
        description:
          'When leading an expedition into the unknown, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will choose 1.\n You encounter...\n • something potentially profitable\n • something currently useful\n • something uniquely awesome',
      },
      {
        name: 'Reconnaissance',
        description:
          'When you make an Assessment of any aspect of a wilderness (animals, plants, weather, terrain, hazards, etc) you gain 3 Data Points about that subject on a 10+, and 1 Data Point about that subject on a 7-9.',
      },
      {
        name: 'Recklessness',
        description:
          'When you make a needlessly risky Move where the odds are a million to one, roll 1d6 instead of making a normal Roll. On a 4, 5 or 6, the Move is a fantastically lucky success. On a 1, 2 or 3, the Move is a spectacularly awful failure with harsh consequences.',
      },
      {
        name: 'Survival',
        description:
          'You can scrounge up the following from all but the most barren, inhospitable surroundings:\n • Somewhat edible food and drink\n • Basic medicine or first-aid materials\n • Rustic Wilderness Kit\n • Primitive Class 0 melee weapon',
      },
      {
        name: 'Custom Vehicle',
        description:
          'You own a custom-designed Class 3 land vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new land vehicle as your Custom Vehicle, adding an extra upgrade to it.',
      },
    ],
  },
  {
    name: 'Industrial',
    descriptors: ['Muscled', 'Grimy', 'Wrinkled', 'Rigorous', 'Rugged', 'Focused'],
    workspaces: [
      {
        name: 'Refinery',
        description:
          'Heavy raw-material collectors. Gathers, processes raw matter into refined materials. Material storage tanks.',
      },
      {
        name: 'Manufactory',
        description:
          'Engineering bays. Builds, upgrades and repairs. Workbenches, tool racks, winches, pulleys, lifts.',
      },
    ],
    advancements: [
      'A piece of junk proves pivotal.',
      'A piece of technology is "improved."',
      'A breakage occurs.',
      'An explosion alters the situation.',
      'A structural weakness is exposed.',
    ],
    skills: [
      {
        name: 'Repair',
        description:
          'When using a repair bay or workshop, your Patch Up can be used to install replacement parts and perform major reconstruction on machines. This repairs critical and fatal breakages.',
      },
      {
        name: 'Construction',
        description:
          'A few hours of work creates a small structure with one of the following traits, or adds that trait to an existing room.\n • Shelter\n • Defensible\n • Concealed\n • Workspace',
      },
      {
        name: 'Tinker',
        description:
          'You can assemble the following from scrap metal and spare parts:\n • Shoddy Class 0 melee weapon\n • Makeshift Class 0 explosive\n • Crude Engineering Kit',
      },
      {
        name: 'Upgrade',
        description:
          'Your Patch Up can very temporarily add up to one additional upgrade to a weapon or vehicle, briefly increasing its Class by +1. ',
      },
      {
        name: 'Dismantle',
        description:
          "When forcefully dismantling, demolishing or breaking something, Roll+Physique.\nOn a 10+, choose 2.\nOn a 7-9, choose 1.\n • It doesn't take very long.\n • It doesn't attract too much attention.\n • You recover useful components.\n • You could rebuild or reassemble it.\n • You gain a Data Point about it.",
      },
    ],
  },
  {
    name: 'Military',
    descriptors: ['Scarred', 'Grizzled', 'Massive', 'Skittish', 'Weary', 'Grim'],
    workspaces: [
      {
        name: 'Armored',
        description:
          'Made of reinforced materials. Difficult to damage, can withstand direct impacts and explosions. Reinforced blast doors, structurally sound.',
      },
      {
        name: 'Barracks',
        description:
          'Efficient, defensible, practical. Berthing for many soldiers, lockers, gym, training ring, mobilization area.',
      },
    ],
    advancements: [
      'An objective is taken by force.',
      'A perilous order is obeyed.',
      'An injury is sustained.',
      'A problem is resolved with firepower.',
      'A worthy enemy is exterminated.',
    ],
    skills: [
      {
        name: 'Tactics',
        description:
          'When you Open Fire or Launch Assault, you choose one or more consequences on a partial success (7-9), not the GM.',
      },
      {
        name: 'Toughness',
        description: 'You can suffer two injuries of each severity, rather than one.',
      },
      {
        name: 'Heavy Lifting',
        description:
          'Ignore the Clumsy trait inflicted by heavy weapons, heavy armor, encumbrance and high gravity.',
      },
      {
        name: 'Unique Weapon',
        description:
          'Own a unique Class 3 firearm or heavy weapon. If that weapon is ever lost, you can abandon it and spend an extended period of time claiming a new weapon as your Unique Weapon, adding an extra upgrade to it.',
      },
      {
        name: 'Authority',
        description:
          'Whenever you are in a position of clear superiority over a group of NPCs, you can Command those NPCs even if the order goes against their own traits, loyalties and willingness',
      },
    ],
  },
  {
    name: 'Personality',
    descriptors: ['Stunning', 'Sexy', 'Chiselled', 'Placid', 'Soft', 'Haughty'],
    workspaces: [
      {
        name: 'Habitation',
        description:
          'Living space for many guests or crew. Communal eating rooms, extended life-support/facilities.',
      },
      {
        name: 'Stately',
        description:
          'Expensive, luxurious, finely appointed décor. More expensive to maintain, but provides much higher quality of life',
      },
    ],
    advancements: [
      'A relationship changes drastically.',
      'A statement starts or ends a fight.',
      'A difficult promise is upheld.',
      'A rumor spreads like wildfire.',
      'An unlikely hero is exalted.',
    ],
    skills: [
      {
        name: 'Fame',
        description:
          "Decide what you are famous/infamous for. Factions, groups and people of importance always know who you are when you meet them. Allies may use your +Influence if they speak in your name, but you'll suffer for any faux-pas.",
      },
      {
        name: 'Leadership',
        description:
          'You have a hand-picked, elite Class 3 Crew. Given enough time and training, you can replace lost members of this crew with new NPCs.',
      },
      {
        name: 'Inspiration',
        description:
          'Choose an emotion and the medium/art with which you convey it, then Roll+Influence or +Physique.\nOn a 7-9, the emotion takes hold of your audience.\nOn a 10+, as above, and choose 1:\n • You gain a keen admirer.\n • You are treated lavishly.\n • You can Command the audience',
      },
      {
        name: 'Contacts',
        description:
          'You have acquaintances and contacts all over the galaxy. When arriving anywhere civilized, introduce a contact. That NPC operates here.',
      },
      {
        name: 'Diplomacy',
        description:
          'Factions will ignore political boundaries, jurisdictions, your personal relationship, and even their own prejudices when you call in a Favor.',
      },
    ],
  },
  {
    name: 'Scoundrel',
    descriptors: ['Thick', 'Dapper', 'Sly', 'Meaty', 'Slick', 'Cold'],
    workspaces: [
      {
        name: 'Facade',
        description:
          'False identification/registry, disguised as something else. Crawlspaces, hidden compartments, false walls.',
      },
      {
        name: 'Sleazy',
        description:
          'Ramshackle, grimy, dimly lit. Space for drinking, smoking, recreational drug use, or other vices.',
      },
    ],
    advancements: [
      'A deal ends in betrayal.',
      'A broken law goes unpunished.',
      'A valuable is stolen.',
      'A threat is preemptively removed.',
      'An unsuspecting victim is exploited.',
    ],
    skills: [
      {
        name: 'Criminal',
        description:
          'Any successful (10+) Move that involves theft, smuggling, extortion or similar crimes also leaves no evidence that could indict you',
      },
      {
        name: 'Sneak Attack',
        description:
          'When you get the drop on someone, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will give you 2 of the following options, choose 1 of them.\n • Kill them\n • Injure them\n • Rob/disarm them\n • Capture/disable them',
      },
      {
        name: 'Scapegoat',
        description:
          "When you would suffer social, legal or financial consequences, name someone and Roll+Expertise.\n On a 10+, they suffer instead.\n On a 7-9, as above. They know it was you.\n On a 6-, it didn't work, and they know what you tried to do.",
      },
      {
        name: 'False Identity',
        description:
          'You maintain a number of fake identities that have neutral standing with all factions. As long as a chosen identity holds, your actions do not incur Debt or earn Favor.',
      },
      {
        name: 'Addict',
        description:
          'Choose one of your five stats. As long as you regularly dose yourself with your drug of choice, increase that stat by +1. Failure to subsequently dose yourself will reduce that stat by -2 until you dose yourself again or recover from the lengthy effects of withdrawal.',
      },
    ],
  },
  {
    name: 'Starfarer',
    descriptors: ['Bony', 'Quick', 'Tall', 'Sunny', 'Restless', 'Tolerant'],
    workspaces: [
      {
        name: 'Navigation',
        description:
          'Wide bay windows, observation decks, star-charts, holo-screens. Satellite uplinks, orbital tracking systems, airspace control/coordination tower',
      },
      {
        name: 'Launchpad',
        description:
          'Aircraft/shuttle hangar with wide bay doors, launchpads for shuttles and speeders.',
      },
    ],
    advancements: [
      'A passenger reaches a destination.',
      'A solution leverages gravity.',
      'A piloting maneuver causes a reversal.',
      'A system is pushed to the limit.',
      'A new culture is experienced.',
    ],
    skills: [
      {
        name: 'Weightless',
        description:
          'Ignore the Clumsy trait and/or movement restrictions inflicted by microgravity, low-gravity, freefall, climbing and jump jets. A successful (10+) Move while in those situations lets you describe a moment of exceptional acrobatic grace.',
      },
      {
        name: 'Cosmopolitan',
        description:
          'When you make an Assessment of any aspect of a society (culture, traditions, laws, government, economy, etc) you gain 3 Data Points about that subject on a 10+, and 1 Data Point about that subject on a 7-9.',
      },
      {
        name: 'Navigation',
        description:
          'When you plan a long voyage, choose 1.\nThe voyage will be:\n • Fast - You know a shortcut.\n • Safe - Choose a faction to avoid.\n • Pleasant - +2 to Cramped Quarters.\n • Profitable - If you deliver the passengers who are asking for passage.',
      },
      {
        name: 'Calibrations',
        description:
          'When you diligently calibrate your favorite console or vehicle, make a Get Involved using Interface and record the result. The next time anyone uses it, the result of the Get Involved applies.',
      },
      {
        name: 'Custom Flyer',
        description:
          'You own a custom-designed Class 3 shuttle or speeder vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new vehicle as your Custom Flyer, adding an extra upgrade to it.',
      },
    ],
  },
  {
    name: 'Technocrat',
    descriptors: ['Nearsighted', 'Lanky', 'Underfed', 'Smug', 'Awkward', 'Intense'],
    workspaces: [
      {
        name: 'Communication',
        description:
          'High-powered communications array, transceivers, antennae. Screens, conference rooms, holo-projectors.',
      },
      {
        name: 'Observer',
        description:
          'Advanced, multi-band sensors, capable of long-distance scans. Probe launchers. Recording equipment, shielded data storage.',
      },
    ],
    advancements: [
      "A system's security is breached.",
      'A solution is found on the SectorNet.',
      'A computer crash causes chaos.',
      'A pivotal data cluster is accessed.',
      'An offending program is expunged.',
    ],
    skills: [
      {
        name: 'Upload',
        description:
          'Expend a Data Point on the SectorNet to have the facts about the subject:\n • be erased, hidden, classified.\n • become common knowledge.\n • be falsified, pivotally altered.',
      },
      {
        name: 'Hijack',
        description:
          'When you Access a system, it locks out everyone else. You can open the system to anyone you wish.',
      },
      {
        name: 'Program',
        description:
          'When you Access a system, choose a behavior that the system could perform and a condition that will trigger that behavior.',
      },
      {
        name: 'Network',
        description:
          'You can simultaneously track the location and health of a dozen willing subjects through a console or HUD. You are able to remotely Get Involved or issue Commands',
      },
      {
        name: 'Artificial Intelligence',
        description:
          'You have the loyalty of a digital, artificial intelligence NPC. Give it a name and a 2-4 word description of its personality. It can enter, unlock and activate systems at your Command. Your AI can only be in one system at a time.',
      },
    ],
  },
];

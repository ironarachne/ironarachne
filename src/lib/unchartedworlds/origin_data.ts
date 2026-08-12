import type { Origin } from './character';

/**
 * Where a character came from: the descriptors that colour their appearance and manner, and
 * the skills that upbringing left them with.
 */
export const ORIGINS: Origin[] = [
  {
    name: 'Advanced',
    descriptors: ['Angular', 'Robust', 'Strapping', 'Carefree', 'Lazy', 'Arrogant'],
    skills: [
      {
        name: 'Cutting Edge',
        description:
          'Interacting with new, advanced technology comes naturally to you. On the other hand, dealing with old, clunky, obsolete dreck is rather aggravating. You gain +1 to your Interface stat, to a maximum of +2.',
      },
      {
        name: 'Artificial Intelligence',
        description:
          'You have the loyalty of a digital, artificial intelligence NPC. Give it a name and a 2-4 word description of its personality. It can enter, unlock and activate systems at your Command. Your AI can only be in one system at a time.',
      },
      {
        name: 'Custom Flyer',
        description:
          'You own a custom-designed Class 3 shuttle or speeder vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new vehicle as your Custom Vehicle, adding an extra upgrade to it.',
      },
      {
        name: 'Surveillance',
        description:
          "After you Access someone's personal systems, you can track that person's public movements from then on (general location, interactions, transactions, etc). You can only have one surveillance subject at a time.",
      },
    ],
  },
  {
    name: 'Brutal',
    descriptors: ['Tired', 'Disfigured', 'Suppressed', 'Cruel', 'Angry', 'Severe'],
    skills: [
      {
        name: 'Branded',
        description:
          "You have a prominent, recognisable physical mark (scars, burns, tattoos, prison barcode, slave brand), as a testament to the hardships you've survived. You gain +1 to your Physique stat, to a maximum of +2.",
      },
      {
        name: 'Assassination',
        description:
          "Any successful (10+) Move that results in someone's death also leaves no evidence that you committed the act.",
      },
      {
        name: 'Toughness',
        description: 'You can suffer two injuries of each severity, rather than one.',
      },
      {
        name: 'Sneak Attack',
        description:
          'When you get the drop on someone, Roll+Mettle.\n On a 10+, choose 1.\n On a 7-9, the GM will give you 2 of the following options, choose 1 of them.\n • Kill them\n • Injure them\n • Rob/disarm them\n • Capture/disable them',
      },
    ],
  },
  {
    name: 'Colonist',
    descriptors: ['Hard', 'Serious', 'Calloused', 'Dusky', 'Solid', 'Prudent'],
    skills: [
      {
        name: 'Resourceful',
        description:
          "You're good at making do with limited resources, and getting the most out of what you have, making you a bit of a hoarder. You gain +1 to your Expertise stat, to a maximum of +2.",
      },
      {
        name: 'Tinker',
        description:
          'You can assemble the following from scrap metal and spare parts:\n • Shoddy Class 0 melee weapon\n • Makeshift Class 0 explosive\n • Crude Engineering Kit',
      },
      {
        name: 'Custom Vehicle',
        description:
          'You own a custom-designed Class 3 land vehicle. If that vehicle is ever lost, you can spend an extended period of time claiming a new land vehicle as your Custom Vehicle, adding an extra upgrade to it.',
      },
      {
        name: 'Heavy Lifting',
        description:
          'Ignore the Clumsy trait inflicted by heavy weapons, heavy armor, encumbrance and high gravity.',
      },
    ],
  },
  {
    name: 'Crowded',
    descriptors: ['Lively', 'Compact', 'Stout', 'Spare', 'Loud', 'Agoraphobic'],
    skills: [
      {
        name: 'Affable',
        description:
          'You get along well with almost everyone in your own way. You are most comfortable around others, and get lonely quickly. You gain +1 to your Influence stat, to a maximum of +2.',
      },
      {
        name: 'Contacts',
        description:
          'You have acquaintances and contacts all over the galaxy. When arriving anywhere civilized, introduce a contact. That NPC operates here.',
      },
      {
        name: 'Network',
        description:
          'You can simultaneously track the location and health of a dozen willing subjects through a console or HUD. You are able to remotely Get Involved or issue Commands.',
      },
      {
        name: 'Bribe',
        description:
          'You can use Acquisition to purchase the following:\n • Political power\n • Legal decisions\n • Faction involvement\n • Diplomatic immunity',
      },
    ],
  },
  {
    name: 'Galactic',
    descriptors: ['Sharp', 'Guarded', 'Stoic', 'Isolated', 'Energetic', 'Graceful'],
    skills: [
      {
        name: 'Fine Tuning',
        description:
          "You're adept at interfacing with climate controlled living spaces; natural environments tend to be uncomfortable. You gain +1 to your Interface stat, to a maximum of +2.",
      },
      {
        name: 'Program',
        description:
          'When you Access a system, choose a behavior that the system could perform and a condition that will trigger that behavior.',
      },
      {
        name: 'Weightless',
        description:
          'Ignore the Clumsy trait and/or movement restrictions inflicted by microgravity, low-gravity, freefall, climbing and jump jets. A successful (10+) Move while in those situations lets you describe a moment of exceptional acrobatic grace',
      },
      {
        name: 'Repair',
        description:
          'When using a repair bay or workshop, your Patch Up can be used to install replacement parts and perform major reconstruction on machines. This repairs critical and fatal breakages.',
      },
    ],
  },
  {
    name: 'Impoverished',
    descriptors: ['Gaunt', 'Haggard', 'Sickly', 'Filthy', 'Vulgar', 'Fierce'],
    skills: [
      {
        name: 'Scrappy',
        description:
          'Life has beaten you down, but you never, ever give up. No matter how bad things get, you rarely back down, even when you really should. You gain +1 to your Mettle stat, to a maximum of +2.',
      },
      {
        name: 'Stealth',
        description:
          'Whenever you can move around freely and are unobserved, you can choose to vanish without a trace. While missing, you may show up in the midst of events, as long as you can explain how you got there.',
      },
      {
        name: 'Recklessness',
        description:
          'When you make a needlessly risky Move where the odds are a million to one, roll 1d6 instead of making a normal Roll. On a 4, 5 or 6, the Move is a fantastically lucky success. On a 1, 2 or 3, the Move is a spectacularly awful failure with harsh consequences.',
      },
      {
        name: 'Criminal',
        description:
          'Any successful (10+) Move that involves theft, smuggling, extortion or similar crimes also leaves no evidence that could indict you',
      },
    ],
  },
  {
    name: 'Privileged',
    descriptors: ['Manicured', 'Plump', 'Groomed', 'Snobbish', 'Sleek', 'Pompous'],
    skills: [
      {
        name: 'Decorum',
        description:
          'You are well versed in the rules of etiquette, civility and propriety. You can carry yourself with grace in formal affairs, but are ill-at-ease in casual settings. You gain +1 to your Influence stat, to a maximum of +2.',
      },
      {
        name: 'Luxury',
        description:
          'Your clothing, belongings and quarters are all lavish and expensive. Gain one of the following NPCs as a retainer: Butler, Assistant, Consort or Advisor. Name the NPC and give them a 2-4 word description. ',
      },
      {
        name: 'Fame',
        description:
          "Decide what you are famous/infamous for. Factions, groups and people of importance always know who you are when you meet them. Allies may use your +Influence if they speak in your name, but you'll suffer for any faux-pas.",
      },
      {
        name: 'Scapegoat',
        description:
          "When you would suffer social, legal or financial consequences, name someone and Roll+Expertise.\n On a 10+, they suffer instead.\n On a 7-9, as above. They know it was you.\n On a 6-, it didn't work, and they know what you tried to do.",
      },
    ],
  },
  {
    name: 'Productive',
    descriptors: ['Slight', 'Curious', 'Faded', 'Greying', 'Detached', 'Introverted'],
    skills: [
      {
        name: 'Vocation',
        description:
          "You've spent many years training in a variety of techniques and trades. Sadly, you've never had time for fun or relaxation. You gain +1 to your Expertise stat, to a maximum of +2",
      },
      {
        name: 'Calibrations',
        description:
          'When you diligently calibrate your favorite console or vehicle, make a Get Involved using Interface and record the result. The next time anyone uses it, the result of the Get Involved applies.',
      },
      {
        name: 'Education',
        description:
          'When you gain one or more Data Points about a subject, each ally that was present or involved also gains a Data Point about the subject.',
      },
      {
        name: 'Acumen',
        description:
          'When you first visit a market or environment, you may ask one of the following questions, and the GM will answer honestly:\n • What is profitably exploitable here?\n • What is in high demand here?\n • Who is the biggest economic player?',
      },
    ],
  },
  {
    name: 'Regimented',
    descriptors: ['Athletic', 'Meditative', 'Sturdy', 'Organised', 'Formal', 'Strict'],
    skills: [
      {
        name: 'Discipline',
        description:
          "You know the rules, the codes, the processes, the scripture, the laws. They give you stability. You don't deal well with change. You gain +1 to your Mettle stat, to a maximum of +2.",
      },
      {
        name: 'Leadership',
        description:
          'You have a hand-picked, elite Class 3 Crew. Given enough time and training, you can replace lost members of this crew with new NPCs. ',
      },
      {
        name: 'Tactics',
        description:
          'When you Open Fire or Launch Assault, you choose one or more consequences on a partial success (7-9), not the GM.',
      },
      {
        name: 'Deduction',
        description:
          'When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.\n Who or what...\n • is most vulnerable in this situation?\n • is most dangerous in this situation?\n • caused this situation?',
      },
    ],
  },
  {
    name: 'Rustic',
    descriptors: ['Wrinkled', 'Creaking', 'Wiry', 'Aged', 'Weary', 'Strong'],
    skills: [
      {
        name: 'Hard Labor',
        description:
          "You can perform long grueling hours of physical labor with minimal rest. You've collected a wide variety of aches, pains and minor ailments from doing this. You gain +1 to your Physique stat, to a maximum of +2.",
      },
      {
        name: 'Construction',
        description:
          'A few hours of work creates a small structure with one of the following traits, or adds that trait to an existing room.\n • Shelter\n • Defensible\n • Concealed\n • Workspace',
      },
      {
        name: 'Survival',
        description:
          'You can scrounge up the following from all but the most barren, inhospitable surroundings:\n • Somewhat edible food and drink\n • Basic medicine or first-aid materials\n • Rustic Wilderness Kit\n • Primitive Class 0 melee weapon',
      },
      {
        name: 'Chemistry',
        description:
          'When creating an antidote, vaccine, drug, poison or pathogen in a lab, state the effect you want it to have and its method of transmission (spray, injector, pill, etc).\nRoll+Expertise.\n On a 10+, you successfully create it.\n On a 7-9, it will have reduced potency or have unintended side effects.',
      },
    ],
  },
];

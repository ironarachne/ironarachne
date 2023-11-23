import './sentry-release-injection-file-d0339e6f.js';

class Domain {
  name;
  holyItems;
  holySymbols;
  weaponEffects;
  otherEffects;
  constructor() {
    this.name = "";
    this.holyItems = [];
    this.holySymbols = [];
    this.weaponEffects = [];
    this.otherEffects = [];
  }
}
const allDomains = [
  newDomain(
    "air",
    ["feather"],
    ["cloud", "circle with three squiggly lines in parallel"],
    [],
    ["allows its wielder to fly", "can summon powerful gusts of wind"]
  ),
  newDomain(
    "animals",
    ["talon", "fang"],
    ["dog's face", "beast"],
    [],
    [
      "allows its bearer to talk to animals",
      "allows its bearer to transform into a specific type of animal"
    ]
  ),
  newDomain(
    "art",
    ["brush", "quill pen"],
    ["paint palette", "multi-colored spiral"],
    [
      "causes the blood of its victims to turn to ink",
      "causes the blood of its victims to turn to paint"
    ],
    [
      "makes the bearer an artist of incredible skill in one medium",
      "contains the trapped soul of a long-dead master artist who speaks to the bearer"
    ]
  ),
  newDomain(
    "autumn",
    ["leaf"],
    ["leaf", "sun setting on the horizon"],
    [],
    ["surrounds its bearer with a storm of dead leaves"]
  ),
  newDomain(
    "balance",
    ["scale"],
    ["circle divided in half"],
    ["causes its wielder to take the same damage dealt to its victims"],
    ["can transfer wounds from one person to another"]
  ),
  newDomain(
    "chaos",
    ["eight-pointed star"],
    ["eight-pointed star"],
    [],
    ["slowly drives its bearer insane"]
  ),
  newDomain(
    "darkness",
    ["cloak"],
    ["black circle", "eclipse"],
    ["causes its victims to go blind"],
    [
      "surrounds its bearer with a sphere of magical darkness",
      "causes all nearby light sources to temporarily go out"
    ]
  ),
  newDomain("dawn", ["torch"], ["radiant sun rising"], [], ["glows bright yellow on command"]),
  newDomain(
    "death",
    ["funerary mask", "sickle", "scythe", "skull"],
    ["skull", "scythe", "death's head", "funerary mask"],
    ["instantly kills anyone harmed by it"],
    ["reveals to the bearer the cause of death for any corpse in sight"]
  ),
  newDomain(
    "demons",
    ["three-legged bowl", "cauldron"],
    ["upside-down pentagram", "evil eye"],
    ["steals the blood from wounds caused by it to power devilish magic"],
    [
      "can summon a swarm of imps from the depths of the underworld",
      "allows the wielder to summon and banish demons"
    ]
  ),
  newDomain(
    "destruction",
    ["sword", "axe"],
    ["skull", "spiked gauntlet"],
    ["causes everything around the target to be damaged on a strike except the wielder"],
    []
  ),
  newDomain(
    "dusk",
    ["mask"],
    ["sun setting on the horizon", "half-circle"],
    [],
    ["slowly reduces the light level in the area until it seems to be dusk"]
  ),
  newDomain(
    "earth",
    ["pick", "mallet"],
    ["mountain"],
    ["turns its victims into stone"],
    [
      "can cause stone to melt and reform near the bearer",
      "enables its bearer to make their skin as hard as stone"
    ]
  ),
  newDomain(
    "evil",
    ["spiral dagger"],
    ["evil eye", "spider"],
    ["causes unbearable pain in anything struck by it"],
    ["glows bright red on command", "slowly turns its bearer into a murderous psychopath"]
  ),
  newDomain(
    "fear",
    ["mask"],
    ["screaming face"],
    ["forces anyone struck by it to run in terror"],
    ["causes fear in all who see it other than its bearer"]
  ),
  newDomain(
    "fertility",
    ["egg"],
    ["pregnant woman", "penis", "vagina"],
    [],
    ["causes barren soil and living things to become fertile"]
  ),
  newDomain(
    "fire",
    ["torch", "brazier"],
    ["fire", "flame"],
    ["lights its victims on fire"],
    [
      "can become wreathed in flame on command",
      "is wreathed in flame that does not harm its bearer"
    ]
  ),
  newDomain(
    "foxes",
    ["fox tail", "fox paw"],
    ["fox's face", "fox running"],
    [],
    ["allows its bearer to transform into a fox"]
  ),
  newDomain(
    "good",
    ["shield"],
    ["radiant sun", "smiling face"],
    ["absolves the sins of anything it kills"],
    ["makes everyone seeing it feel calm and tranquil"]
  ),
  newDomain(
    "harvests",
    ["scythe", "sickle"],
    ["sickle", "scythe"],
    ["traps the soul of anything it kills"],
    ["allows its bearer to transform anything into food"]
  ),
  newDomain("healing", ["wand"], ["wreath of flowers", "open hand"], [], ["can heal any wound"]),
  newDomain("hope", ["hoop"], ["open hand", "circle"], [], ["glows with a soft, warm light"]),
  newDomain(
    "horses",
    ["horse skull", "horse tooth"],
    ["horse's face", "horse"],
    ["neighs when it strikes"],
    ["can summon a magical steed on command", "allows its bearer to transform into a horse"]
  ),
  newDomain(
    "hunting",
    ["bow", "arrow", "spear"],
    ["bow and arrow", "beast"],
    ["never misses"],
    ["allows its bearer to track any living thing unerringly"]
  ),
  newDomain(
    "justice",
    ["scale", "sword"],
    ["blind man", "blind woman", "scale", "sword"],
    ["deals much greater damage to those who have wronged another"],
    ["compels its bearer to right all wrongs they perceive"]
  ),
  newDomain(
    "knowledge",
    ["book"],
    ["book", "open eye", "pyramid"],
    ["drains its victims of knowledge"],
    [
      "is sentient and has great knowledge of ages past",
      "enhances its bearer's knowledge in one particular area"
    ]
  ),
  newDomain(
    "languages",
    ["book", "scroll"],
    ["speaking face", "scroll", "book"],
    ["temporarily prevents its victims from understanding or speaking any language"],
    ["embues its bearer with the ability to understand and speak all languages"]
  ),
  newDomain(
    "law",
    ["book", "sword", "hammer"],
    [
      "hammer",
      "hammer overlapping a book",
      "crossed sword and hammer",
      "sword",
      "sword overlapping a book"
    ],
    [],
    ["prevents all in its presence from breaking any law"]
  ),
  newDomain(
    "life",
    ["egg", "seed"],
    ["ouroboros", "circle entwined in vines", "egg"],
    [],
    ["causes flowers to spring up in its bearer's footsteps", "can restore the dead to life"]
  ),
  newDomain(
    "light",
    ["torch"],
    ["beams of light coming from the sky", "radiant sun"],
    ["causes its victims to emit light from their eyes after death"],
    ["glows with a bright light on command"]
  ),
  newDomain(
    "lightning",
    ["rod"],
    ["lightning bolt", "crossed pair of lightning bolts"],
    ["electrocutes anything struck by it"],
    ["allows the wielder to call down lightning from the heavens"]
  ),
  newDomain(
    "love",
    ["red string"],
    ["heart"],
    ["causes anyone struck by it to fall in love with the first compatible person they see"],
    ["encourages the seed of love to blossom in everyone in its presence"]
  ),
  newDomain(
    "luck",
    ["rabbit's foot", "dice", "playing cards"],
    ["grinning face", "face split into a grinning side and a frowning side"],
    ["curses its victims with uncanny bad luck for a time"],
    ["endows its bearer with uncanny good luck"]
  ),
  newDomain(
    "mercy",
    ["blunt sword"],
    ["open hand", "wreath of vines"],
    ["prevents its wielder's targets from dying"],
    ["glows with a soft white light"]
  ),
  newDomain(
    "music",
    ["harp", "lute", "lyre", "drum"],
    ["encircled heart", "harp", "lute", "lyre"],
    [],
    [
      "allows its bearer to fill the area with unearthly music",
      "enhances its bearer's musical ability"
    ]
  ),
  newDomain(
    "nature",
    ["staff"],
    ["tree", "flower"],
    [],
    ["can make plants grow to full size from just a touch"]
  ),
  newDomain(
    "nobility",
    ["crown"],
    ["crown"],
    [],
    [
      "protects its bearer from filthy peasants",
      "makes its bearer appear to be wealthy beyond compare"
    ]
  ),
  newDomain(
    "oceans",
    ["shell"],
    ["wave", "series of waves", "seashell", "mermaid"],
    [],
    ["allows its bearer to breathe underwater", "can summon seawater from the ground"]
  ),
  newDomain(
    "persistence",
    ["shield"],
    ["man standing resolute", "fist"],
    [],
    ["prevents its bearer from dying", "allows its bearer to ignore pain"]
  ),
  newDomain(
    "plants",
    ["hoe"],
    ["plant", "tree"],
    [],
    ["causes seeds to grow and flowers to bloom near it"]
  ),
  newDomain(
    "protection",
    ["shield"],
    ["shield", "gauntlet"],
    [],
    [
      "greatly enhances its bearer's speed when trying to reach a friend in need",
      "makes its bearer very difficult to hit",
      "protects its bearer from magic"
    ]
  ),
  newDomain(
    "revenge",
    ["broken dagger"],
    ["evil eye", "broken circle"],
    [],
    ["causes anyone who strikes its bearer to take the same damage and effects in return"]
  ),
  newDomain("sky", ["flute", "kite"], ["cloud"], [], ["allows its bearer to fly"]),
  newDomain(
    "spring",
    ["staff"],
    ["wreath of flowers", "flower"],
    [],
    ["causes seeds to grow and flowers to bloom around its bearer"]
  ),
  newDomain(
    "strength",
    ["gauntlet"],
    ["muscled arm", "fist", "tower"],
    ["slams its victims back a hundred feet when struck"],
    [
      "imparts great strength to its bearer",
      "allows its bearer to leap hundreds of feet in a single bound"
    ]
  ),
  newDomain(
    "summer",
    ["wreath"],
    ["radiant sun", "fire"],
    [],
    [
      "gleams brightly in sunlight",
      "warms the surrounding area to the temperature of a tropical day"
    ]
  ),
  newDomain(
    "thieves",
    ["dagger", "coin purse"],
    ["dagger", "pierced circle"],
    [],
    [
      "hides its bearer's features, making them blurry or difficult to look at",
      "periodically teleports objects valuable to their owners into the bearer's pockets or backpack"
    ]
  ),
  newDomain(
    "the moon",
    ["plate"],
    ["crescent moon"],
    [],
    ["shimmers with a white light at night"]
  ),
  newDomain(
    "the sun",
    ["plate"],
    ["radiant sun"],
    ["flares brightly when it strikes"],
    ["can glow blindingly bright on command"]
  ),
  newDomain(
    "thunder",
    ["drum", "hammer"],
    ["lightning bolt", "lightning bolt over a hammer", "hammer", "drum"],
    ["creates a thunderous boom when it hits"],
    ["creates a thunderous boom on command"]
  ),
  newDomain(
    "time",
    ["sundial", "hourglass"],
    ["hourglass", "ouroboros"],
    ["drains its wielder's victims of remaining years of life"],
    ["lets its bearer pause time for the rest of creation for a few seconds at a time"]
  ),
  newDomain(
    "trade",
    ["scale", "coin"],
    ["coin", "scale", "book and scale"],
    ["makes its enemies bleed molten gold"],
    ["can influence trade bargains in its bearer's favor"]
  ),
  newDomain(
    "travel",
    ["staff"],
    ["man walking", "road disappearing into the horizon"],
    ["lets its wielder move twice as fast"],
    ["can summon a mystical steed for its bearer to ride"]
  ),
  newDomain(
    "trickery",
    ["two-faced mask"],
    ["face bearing an evil half and a good half"],
    ["allows its wielder to create the illusion of attacking from two places at once"],
    ["is sentient and fights its bearer whenever it can"]
  ),
  newDomain(
    "war",
    ["sword", "spear"],
    ["sword", "crossed pair of axes", "helmeted face"],
    ["enhances its wielder's martial abilities"],
    ["is sentient and desires combat"]
  ),
  newDomain(
    "water",
    ["flask"],
    ["wave", "fountain"],
    [],
    [
      "allows the bearer to swim twice as fast",
      "lets the bearer breathe underwater",
      "makes the bearer grow gills underwater"
    ]
  ),
  newDomain(
    "winter",
    ["cloak"],
    ["snowflake", "icicle"],
    ["coats its victims in frost"],
    [
      "cloaks the bearer in a perpetual swirl of snow",
      "causes the bearer and their belongings to be covered in harmless frost",
      "makes the bearer immune to cold"
    ]
  ),
  newDomain(
    "wisdom",
    ["book"],
    ["book", "scroll", "book and scroll"],
    ["guides its wielder to openings in the target's defenses"],
    ["is sentient and aids its bearer"]
  )
];
function getAllDomainNames() {
  const result = [];
  for (let i = 0; i < allDomains.length; i++) {
    result.push(allDomains[i].name);
  }
  return result;
}
function getSpecificDomain(name) {
  for (let i = 0; i < allDomains.length; i++) {
    if (allDomains[i].name == name) {
      return allDomains[i];
    }
  }
  throw new Error("failed to find domain name: " + name);
}
function newDomain(name, holyItems, holySymbols, weaponEffects, otherEffects) {
  let domain = new Domain();
  domain.name = name;
  domain.holyItems = holyItems;
  domain.holySymbols = holySymbols;
  domain.weaponEffects = weaponEffects;
  domain.otherEffects = otherEffects;
  return domain;
}

export { Domain as D, allDomains as a, getSpecificDomain as b, getAllDomainNames as g };
//# sourceMappingURL=domains-3f4ce49c.js.map

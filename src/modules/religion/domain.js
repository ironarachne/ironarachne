export class Domain {
  constructor(name, holyItems, holySymbols) {
    this.name = name
    this.holyItems = holyItems
    this.holySymbols = holySymbols
  }
}

export function all() {
  return [
    new Domain(
      "air",
      ["feather"],
      ["cloud", "circle with three squiggly lines in parallel"]
    ),
    new Domain(
      "animals",
      ["talon", "fang"],
      ["dog's face", "beast"]
    ),
    new Domain(
      "art",
      ["brush", "quill pen"],
      ["paint palette", "multi-colored spiral"]
    ),
    new Domain(
      "autumn",
      ["leaf"],
      ["leaf", "sun setting on the horizon"]
    ),
    new Domain(
      "balance",
      ["scale"],
      ["circle divided in half"]
    ),
    new Domain(
      "chaos",
      ["eight-pointed star"],
      ["eight-pointed star"]
    ),
    new Domain(
      "darkness",
      ["cloak"],
      ["black circle", "eclipse"]
    ),
    new Domain(
      "dawn",
      ["torch"],
      ["radiant sun rising"]
    ),
    new Domain(
      "death",
      ["funerary mask", "sickle", "scythe", "skull"],
      ["skull", "scythe", "death's head", "funerary mask"]
    ),
    new Domain(
      "demons",
      ["three-legged bowl", "cauldron"],
      ["upside-down pentagram", "evil eye"]
    ),
    new Domain(
      "destruction",
      ["sword", "axe"],
      ["skull", "spiked gauntlet"]
    ),
    new Domain(
      "dusk",
      ["mask"],
      ["sun setting on the horizon", "half-circle"]
    ),
    new Domain(
      "earth",
      ["pick", "mallet"],
      ["mountain"]
    ),
    new Domain(
      "evil",
      ["spiral dagger"],
      ["evil eye", "spider"]
    ),
    new Domain(
      "fear",
      ["mask"],
      ["screaming face"]
    ),
    new Domain(
      "fertility",
      ["egg"],
      ["pregnant woman", "penis", "vagina"]
    ),
    new Domain(
      "fire",
      ["torch", "brazier"],
      ["fire", "flame"]
    ),
    new Domain(
      "foxes",
      ["fox tail", "fox paw"],
      ["fox's face", "fox running"]
    ),
    new Domain(
      "good",
      ["shield"],
      ["radiant sun", "smiling face"]
    ),
    new Domain(
      "harvests",
      ["scythe", "sickle"],
      ["sickle", "scythe"]
    ),
    new Domain(
      "healing",
      ["wand"],
      ["wreath of flowers", "open hand"]
    ),
    new Domain(
      "hope",
      ["hoop"],
      ["open hand", "circle"]
    ),
    new Domain(
      "horses",
      ["horse skull", "horse tooth"],
      ["horse's face", "horse"]
    ),
    new Domain(
      "hunting",
      ["bow", "arrow", "spear"],
      ["bow and arrow", "beast"]
    ),
    new Domain(
      "justice",
      ["scale", "sword"],
      ["blind man", "blind woman", "scale", "sword"]
    ),
    new Domain(
      "knowledge",
      ["book"],
      ["book", "open eye", "pyramid"]
    ),
    new Domain(
      "language",
      ["book", "scroll"],
      ["speaking face", "scroll", "book"]
    ),
    new Domain(
      "law",
      ["book", "sword", "hammer"],
      ["hammer", "hammer overlapping a book", "crossed sword and hammer", "sword", "sword overlapping a book"]
    ),
    new Domain(
      "life",
      ["egg", "seed"],
      ["ouroboros", "circle entwined in vines", "egg"]
    ),
    new Domain(
      "light",
      ["torch"],
      ["beams of light coming from the sky", "radiant sun"]
    ),
    new Domain(
      "lightning",
      ["rod"],
      ["lightning bolt", "crossed pair of lightning bolts"]
    ),
    new Domain(
      "love",
      ["red string"],
      ["heart"]
    ),
    new Domain(
      "luck",
      ["rabbit's foot", "dice", "playing cards"],
      ["grinning face", "face split into a grinning side and a frowning side"]
    ),
    new Domain(
      "mercy",
      ["blunt sword"],
      ["open hand", "wreath of vines"]
    ),
    new Domain(
      "music",
      ["harp", "lute", "lyre", "drum"],
      ["encircled heart", "harp", "lute", "lyre"]
    ),
    new Domain(
      "nature",
      ["staff"],
      ["tree", "flower"]
    ),
    new Domain(
      "nobility",
      ["crown"],
      ["crown"]
    ),
    new Domain(
      "oceans",
      ["shell"],
      ["wave"]
    ),
    new Domain(
      "persistence",
      ["shield"],
      ["man standing resolute", "fist"]
    ),
    new Domain(
      "plants",
      ["hoe"],
      ["plant", "tree"]
    ),
    new Domain(
      "protection",
      ["shield"],
      ["shield", "gauntlet"]
    ),
    new Domain(
      "revenge",
      ["broken dagger"],
      ["evil eye", "broken circle"]
    ),
    new Domain(
      "sky",
      ["flute", "kite"],
      ["cloud"]
    ),
    new Domain(
      "spring",
      ["staff"],
      ["wreath of flowers", "flower"]
    ),
    new Domain(
      "strength",
      ["gauntlet"],
      ["muscled arm", "fist", "tower"]
    ),
    new Domain(
      "summer",
      ["wreath"],
      ["radiant sun", "fire"]
    ),
    new Domain(
      "thieves",
      ["dagger", "coin purse"],
      ["dagger", "pierced circle"]
    ),
    new Domain(
      "the moon",
      ["plate"],
      ["crescent moon"]
    ),
    new Domain(
      "the sun",
      ["plate"],
      ["radiant sun"]
    ),
    new Domain(
      "thunder",
      ["drum", "hammer"],
      ["lightning bolt", "lightning bolt over a hammer", "hammer", "drum"]
    ),
    new Domain(
      "time",
      ["sundial", "hourglass"],
      ["hourglass", "ouroboros"]
    ),
    new Domain(
      "trade",
      ["scale", "coin"],
      ["coin", "scale", "book and scale"]
    ),
    new Domain(
      "travel",
      ["staff"],
      ["man walking", "road disappearing into the horizon"]
    ),
    new Domain(
      "trickery",
      ["two-faced mask"],
      ["face bearing an evil half and a good half"]
    ),
    new Domain(
      "war",
      ["sword", "spear"],
      ["sword", "crossed pair of axes", "helmeted face"]
    ),
    new Domain(
      "water",
      ["flask"],
      ["wave", "fountain"]
    ),
    new Domain(
      "winter",
      ["cloak"],
      ["snowflake", "icicle"]
    ),
    new Domain(
      "wisdom",
      ["book"],
      ["book", "scroll", "book and scroll"]
    )
  ]
}

export function getAllDomainNames() {
  let allDomains = all()

  let result = []

  for (let i=0;i<allDomains.length;i++) {
    result.push(allDomains[i].name)
  }

  return result
}

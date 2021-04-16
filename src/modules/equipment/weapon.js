import * as Descriptor from "./descriptor.js"
import * as Material from "./material.js"
import * as Domain from "../religion/domain.js"
import * as iarnd from "../random.js"
import * as Words from "../words.js"
import * as Name from "../names/magicitems.js"

export class Weapon {
  constructor(name, description, weaponType, effect) {
    this.name = name
    this.description = description
    this.weaponType = weaponType
    this.effect = effect
  }
}

export class WeaponType {
  constructor(name, hands, category) {
    this.name = name
    this.hands = hands
    this.category = category
  }
}

export class WeaponEffect {
  constructor(description, tags) {
    this.description = description
    this.tags = tags
  }
}

export function generate(category, theme) {
  if (theme == 'any') {
    let domains = Domain.getAllDomainNames()
    theme = iarnd.item(domains)
  }

  let all = getAllDescriptors()

  let types = getWeaponTypesOfCategory(category)

  let weaponType = iarnd.item(types)

  let materialSet = Material.getRandomMaterialSetForCategory(category)
  let bodyMaterial = Material.getRandomMaterialForCategory(materialSet.body)
  let headMaterial = Material.getRandomMaterialForCategory(materialSet.head)
  let ornamentationMaterial = Material.getRandomMaterialForCategory(materialSet.ornamentation)

  let descriptors = Descriptor.getDescriptorsMatchingType(all, category)

  descriptors = Descriptor.getDescriptorsMatchingTag(descriptors, theme)

  let effects = getAllEffectsForTheme(theme)
  let effect = iarnd.item(effects)

  let descriptor = iarnd.item(descriptors)
  let descriptorDescription = descriptor.description.replace('{head}', headMaterial.name)
  descriptorDescription = descriptorDescription.replace('{ornamentation}', ornamentationMaterial.name)

  let name = Name.generate()

  let description = Words.article(bodyMaterial.name) + ` ${bodyMaterial.name} ${weaponType.name} `
  description += descriptorDescription

  return new Weapon(name, description, weaponType, effect)
}

export function checkForMissingMatches() {
  let allDomains = Domain.getAllDomainNames()
  let domainsMissingEffects = []
  let domainsMissingDescriptors = []
  let domainsMissingWeaponDescriptors = []

  let descriptors = getAllDescriptors()

  let allWeaponCategories = getAllWeaponCategories()

  for (let i=0;i<allDomains.length;i++) {
    let countEffects = getAllEffectsForTheme(allDomains[i])
    if (countEffects.length == 0) {
      domainsMissingEffects.push(allDomains[i])
    }
    let countDescriptors = Descriptor.getDescriptorsMatchingTag(descriptors, allDomains[i])
    if (countDescriptors.length == 0) {
      domainsMissingDescriptors.push(allDomains[i])
    }
    for (let j=0;j<allWeaponCategories.length;j++) {
      let weaponDescriptors = Descriptor.getDescriptorsMatchingType(descriptors, allWeaponCategories[j])
      let domainWeaponDescriptors = Descriptor.getDescriptorsMatchingTag(weaponDescriptors, allDomains[i])
      if (domainWeaponDescriptors.length == 0) {
        domainsMissingWeaponDescriptors.push(allDomains[i] + ' for ' + allWeaponCategories[j])
      }
    }
  }

  let theList = 'Domains missing effects: ' + Words.arrayToPhrase(domainsMissingEffects)
  theList += '; and domains missing descriptors: ' + Words.arrayToPhrase(domainsMissingDescriptors)
  theList += '; and domains missing descriptors for specific weapons: ' + Words.arrayToPhrase(domainsMissingWeaponDescriptors)

  return theList
}

function getAllDescriptors() {
  let bladed = ['sword', 'axe', 'knife', 'dagger', 'scythe']
  let hilted = ['sword', 'dagger']
  let shafted = ['staff', 'spear', 'polearm']
  let blunt = ['hammer', 'mace', 'club']
  let blunthead = ['hammer', 'mace']
  let woodbodied = ['staff', 'bow', 'crossbow', 'club', 'spear', 'polearm', 'scythe', 'mace', 'hammer']
  let staff = ['staff']
  let whip = ['whip']

  let descriptors = [
    new Descriptor.Descriptor('topped with a {head} wing', staff, ['air', 'wing', 'bird']),
    new Descriptor.Descriptor('topped with a cluster of carved {head} wings', staff, ['air', 'wing', 'bird']),
    new Descriptor.Descriptor('carved with sunrises in relief', blunt, ['air', 'the sun', 'dawn', 'good']),
    new Descriptor.Descriptor('with a {ornamentation} hilt engraved with a sunrise', hilted, ['air', 'the sun', 'dawn']),
    new Descriptor.Descriptor('with a {ornamentation} hilt engraved with a starlit sky', hilted, ['stars', 'night', 'air']),
    new Descriptor.Descriptor('with a {ornamentation} hilt engraved with a crescent moon', hilted, ['the moon', 'night']),
    new Descriptor.Descriptor('with a {ornamentation} hilt engraved with a cloud', hilted, ['cloud', 'air']),
    new Descriptor.Descriptor('with a {ornamentation} hilt engraved with a thunderbolt', hilted, ['thunder', 'storm']),
    new Descriptor.Descriptor('with two tails ending in barbs', whip, ['animals', 'monsters', 'war']),
    new Descriptor.Descriptor('with three tails ending in barbs', whip, ['animals', 'monsters', 'war']),
    new Descriptor.Descriptor('with nine tails ending in barbs', whip, ['animals', 'monsters', 'war']),
    new Descriptor.Descriptor('with a wickedly serrated blade', bladed, ['war', 'evil', 'hate', 'destruction']),
    new Descriptor.Descriptor('with a blade engraved in malevolent runes', bladed, ['war', 'evil', 'hate', 'demons', 'revenge']),
    new Descriptor.Descriptor('with a multicolored blade', bladed, ['art', 'chaos']),
    new Descriptor.Descriptor('carved with sunrises in relief', woodbodied, ['sky', 'the sun', 'dawn', 'good']),
    new Descriptor.Descriptor('carved with an erupting volcano', woodbodied, ['fire', 'destruction']),
    new Descriptor.Descriptor('carved with depictions of many beasts', woodbodied, ['animals', 'forest']),
    new Descriptor.Descriptor('carved with a large, ornate tree', woodbodied, ['forest', 'nature']),
    new Descriptor.Descriptor('carved with leaves', woodbodied, ['autumn', 'forest', 'nature']),
    new Descriptor.Descriptor('with a {ornamentation} hilt engraved with a scale', hilted, ['justice', 'balance', 'trade']),
    new Descriptor.Descriptor('with several tails that seem to shimmer and shift', whip, ['chaos', 'trickery']),
    new Descriptor.Descriptor('with a blade that seems to shimmer and shift', bladed, ['chaos', 'trickery']),
    new Descriptor.Descriptor('with a {head} head decorated with an eight-pointed star made of {ornamentation}', blunthead, ['chaos']),
    new Descriptor.Descriptor('with a blade enshrouded in darkness', bladed, ['darkness', 'evil', 'fear', 'hate', 'thieves']),
    new Descriptor.Descriptor('with a skull-shaped head made of {head}', blunthead, ['death', 'evil', 'fear']),
    new Descriptor.Descriptor('with a {ornamentation} hilt shaped like a skull', hilted, ['death', 'evil', 'fear']),
    new Descriptor.Descriptor('with a {head} blade that looks like a perpetually-moving sea of demons', bladed, ['demons', 'evil']),
    new Descriptor.Descriptor('carved with a setting sun laid in {ornamentation}', woodbodied, ['dusk', 'darkness']),
    new Descriptor.Descriptor('topped with a {head} head carved with a mountain in relief', blunthead, ['earth']),
    new Descriptor.Descriptor('carved with a scene of people dancing', woodbodied, ['fertility', 'music']),
    new Descriptor.Descriptor('carved with a scene of a couple entwined', woodbodied, ['fertility', 'love']),
    new Descriptor.Descriptor('with a {head} blade carved with dancing flames', bladed, ['fire']),
    new Descriptor.Descriptor('whose top is a {head} carving of a fox', staff, ['foxes', 'animals']),
    new Descriptor.Descriptor('with a carving of a resplendent sun in {ornamentation}', woodbodied, ['good', 'the sun', 'life', 'summer']),
    new Descriptor.Descriptor('engraved with a scene of a harvest', bladed, ['harvests']),
    new Descriptor.Descriptor('with carvings of radiant light throughout the shaft', woodbodied, ['healing', 'good', 'light', 'hope', 'life']),
    new Descriptor.Descriptor('engraved with hands outstretched', bladed, ['hope', 'healing', 'good', 'mercy']),
    new Descriptor.Descriptor('carved with horses running', woodbodied, ['horses']),
    new Descriptor.Descriptor('engraved with a horse\'s head', bladed, ['horses']),
    new Descriptor.Descriptor('with a {head} blade engraved with a blindfolded face', bladed, ['justice']),
    new Descriptor.Descriptor('with a carving of a stag', woodbodied, ['forest', 'hunting']),
    new Descriptor.Descriptor('with many intricate paintings of books', staff, ['knowledge']),
    new Descriptor.Descriptor('stained with symbols of books', woodbodied, ['knowledge']),
    new Descriptor.Descriptor('shaped like many intertwined tongues', staff, ['language']),
    new Descriptor.Descriptor('covered in engravings of open mouths', bladed, ['language']),
    new Descriptor.Descriptor('bearing an engraving of a sword laying on a book', bladed, ['law']),
    new Descriptor.Descriptor('carved in the shape of many intertwined vines', staff, ['life', 'nature', 'plants']),
    new Descriptor.Descriptor('inlaid in {ornamentation} with many lightning bolts', bladed, ['lightning', 'thunder']),
    new Descriptor.Descriptor('inlaid in {ornamentation} with heart symbols', bladed, ['love']),
    new Descriptor.Descriptor('ornamented with {ornamentation} on the hilt', hilted, ['love']),
    new Descriptor.Descriptor('ornamented with intertwined {ornamentation} lines running up and down the shaft', shafted, ['luck']),
    new Descriptor.Descriptor('topped with a {head} six-sided die inlaid with {ornamentation}', blunthead, ['luck']),
    new Descriptor.Descriptor('bearing a carving of an open hand', woodbodied, ['mercy']),
    new Descriptor.Descriptor('intricately painted with scenes of musicians playing', woodbodied, ['music']),
    new Descriptor.Descriptor('with a {ornamentation} crown on the hilt', hilted, ['nobility']),
    new Descriptor.Descriptor('carved with roaring waves', woodbodied, ['oceans', 'water']),
    new Descriptor.Descriptor('engraved with stylized waves', bladed, ['oceans', 'water', 'rivers']),
    new Descriptor.Descriptor('wrapped in {ornamentation} wire', shafted, ['persistence']),
    new Descriptor.Descriptor('covered in carvings of flowers inlaid with {ornamentation}', woodbodied, ['spring', 'nature', 'plants']),
    new Descriptor.Descriptor('engraved with shields inlaid with {ornamentation}', bladed, ['protection']),
    new Descriptor.Descriptor('topped with a {ornamentation} flower', blunthead, ['spring', 'nature', 'plants']),
    new Descriptor.Descriptor('engraved with a symbol of a fist', bladed, ['strength', 'war']),
    new Descriptor.Descriptor('topped with a {head} head in the shape of a fist', blunthead, ['strength', 'war']),
    new Descriptor.Descriptor('covered in carvings of crescent moons', woodbodied, ['the moon', 'night']),
    new Descriptor.Descriptor('with an hourglass inlaid in the hilt', hilted, ['time']),
    new Descriptor.Descriptor('with an hourglass carved into the shaft', shafted, ['time']),
    new Descriptor.Descriptor('with engravings of coins on the blade', bladed, ['trade']),
    new Descriptor.Descriptor('carved with a symbol of a man on horseback', woodbodied, ['travel']),
    new Descriptor.Descriptor('inlaid in {ornamentation} with snowflakes', bladed, ['winter']),
    new Descriptor.Descriptor('carved with an open book', woodbodied, ['wisdom', 'knowledge']),
    new Descriptor.Descriptor('engraved with an open eye', bladed, ['wisdom']),
  ]

  let pairings = [
    {
      method: 'carved with',
      objects: woodbodied,
    },
    {
      method: 'engraved with',
      objects: bladed,
    },
    {
      method: 'painted with',
      objects: woodbodied,
    },
    {
      method: 'stained to resemble',
      objects: woodbodied,
    },
    {
      method: 'with a {ornamentation} hilt engraved with',
      objects: hilted,
    },
    {
      method: 'with a {ornamentation} hilt shaped like',
      objects: hilted,
    },
    {
      method: 'woven to resemble',
      objects: ['whip'],
    },
    {
      method: 'with {head} tips cast to resemble',
      objects: ['flail'],
    },
  ]

  let allDomains = Domain.all()

  for (let i=0;i<allDomains.length;i++) {
    for (let j=0;j<pairings.length;j++) {
      for (let k=0;k<allDomains[i].holySymbols.length;k++) {
        let descriptor = new Descriptor.Descriptor(pairings[j].method + ' ' + Words.article(allDomains[i].holySymbols[k]) + ' ' + allDomains[i].holySymbols[k], pairings[j].objects, [allDomains[i].name])
        descriptors.push(descriptor)
      }
    }
  }

  return descriptors
}

function getAllEffects() {
  return [
    new WeaponEffect('glows with an unearthly light', ['light', 'the sun', 'good']),
    new WeaponEffect('has a perpetual layer of frost', ['winter']),
    new WeaponEffect('glows bright yellow on command', ['light', 'the sun', 'dawn']),
    new WeaponEffect('glows bright green on command', ['light']),
    new WeaponEffect('glows bright blue on command', ['light']),
    new WeaponEffect('glows bright red on command', ['light', 'evil']),
    new WeaponEffect('is sentient and desires combat', ['war']),
    new WeaponEffect('is sentient and aids its wielder', ['wisdom']),
    new WeaponEffect('is sentient and has great knowledge of ages past', ['wisdom', 'knowledge']),
    new WeaponEffect('is wreathed in flame that does not harm its wielder', ['summer', 'fire', 'the sun']),
    new WeaponEffect('is sentient and fights its wielder whenever it can', ['trickery']),
    new WeaponEffect('imparts great strength to its wielder', ['strength']),
    new WeaponEffect('can make plants grow to full size from just a touch', ['plants', 'nature']),
    new WeaponEffect('reveals hidden passages to its wielder', ['wisdom']),
    new WeaponEffect('can heal as well as harm', ['mercy', 'healing', 'hope']),
    new WeaponEffect('allows its wielder to breathe underwater', ['water', 'oceans', 'rivers']),
    new WeaponEffect('allows its wielder to fly', ['sky', 'air']),
    new WeaponEffect('lets its wielder pause time for the rest of creation for a few seconds at a time', ['time']),
    new WeaponEffect('prevents its wielder from dying while they hold it', ['persistence']),
    new WeaponEffect('greatly enhances its wielder\'s speed when trying to reach a friend in need', ['protection']),
    new WeaponEffect('slowly drives its wielder insane', ['evil', 'chaos']),
    new WeaponEffect('allows its wielder to speak and understand all languages', ['languages']),
    new WeaponEffect('shimmers with a white light at night', ['the moon', 'stars']),
    new WeaponEffect('can alter its form to appear as a harmless necklace at will', ['trickery']),
    new WeaponEffect('can summon a mystical steed for its wielder to ride', ['travel']),
    new WeaponEffect('can influence trade bargains in its wielder\'s favor', ['trade']),
    new WeaponEffect('can summon powerful gusts of wind', ['air']),
    new WeaponEffect('allows its wielder to talk to animals', ['animals']),
    new WeaponEffect('allows its wielder to transform into one type of animal', ['animals']),
    new WeaponEffect('causes the blood of its victims to turn to ink', ['art']),
    new WeaponEffect('causes the blood of its victims to turn to paint', ['art']),
    new WeaponEffect('surrounds its wielder with a storm of dead leaves', ['autumn']),
    new WeaponEffect('causes its wielder to take the same damage dealt to its victims', ['balance']),
    new WeaponEffect('surrounds its wielder with a sphere of magical darkness', ['darkness']),
    new WeaponEffect('causes all nearby light sources to temporarily go out', ['darkness']),
    new WeaponEffect('casts a warm yellow light on command', ['dawn']),
    new WeaponEffect('instantly kills anyone harmed by it', ['death']),
    new WeaponEffect('can summon a swarm of imps from the depths of the underworld', ['demons']),
    new WeaponEffect('allows the wielder to summon and banish demons', ['demons']),
    new WeaponEffect('causes everything around the target to be damaged on a strike except the wielder', ['destruction']),
    new WeaponEffect('slowly reduces the light level in the area until it seems to be dusk', ['dusk']),
    new WeaponEffect('can cause stone to melt and reform near the wielder', ['earth']),
    new WeaponEffect('turns its victims into stone', ['earth']),
    new WeaponEffect('causes fear in all who see it other than its wielder', ['fear']),
    new WeaponEffect('causes barren soil and living things to become fertile', ['fertility']),
    new WeaponEffect('allows its wielder to transform into a fox', ['foxes']),
    new WeaponEffect('makes everyone seeing it feel calm and tranquil', ['good']),
    new WeaponEffect('allows its wielder to transform anything into food', ['harvests']),
    new WeaponEffect('can summon a magical steed on command', ['horses']),
    new WeaponEffect('allows its wielder to transform into a horse', ['horses']),
    new WeaponEffect('allows its wielder to track any living thing unerringly', ['hunting']),
    new WeaponEffect('compels its wielder to right all wrongs they perceive', ['justice']),
    new WeaponEffect('embues its wielder with the ability to understand and speak all languages', ['language']),
    new WeaponEffect('prevents all in its presence from breaking any law', ['law']),
    new WeaponEffect('causes flowers to spring up in its wielder\'s footsteps', ['life', 'flowers', 'plants', 'spring']),
    new WeaponEffect('can restore the dead to life', ['life']),
    new WeaponEffect('allows the wielder to call down lightning from the heavens', ['lightning']),
    new WeaponEffect('encourages the seed of love to blossom in everyone in its presence', ['love']),
    new WeaponEffect('endows its wielder with uncanny good luck', ['luck']),
    new WeaponEffect('curses its victims with uncanny bad luck for a time', ['luck']),
    new WeaponEffect('allows its wielder to fill the area with unearthly music', ['music']),
    new WeaponEffect('protects its wielder from filthy peasants', ['nobility']),
    new WeaponEffect('makes its wielder appear to be wealthy beyond compare', ['nobility', 'wealth', 'trade']),
    new WeaponEffect('causes anyone who strikes its wielder to take the same damage and effects in return', ['revenge']),
    new WeaponEffect('causes seeds to grow and flowers to bloom', ['spring', 'plants']),
    new WeaponEffect('periodically teleports objects valuable to their owners into the wielder\'s pockets or backpack', ['thieves']),
    new WeaponEffect('creates a thunderous boom on command', ['thunder']),
  ]
}

function getAllEffectsForTheme(theme) {
  let all = getAllEffects()
  let result = []

  for (let i=0;i<all.length;i++) {
    if (all[i].tags.includes(theme)) {
      result.push(all[i])
    }
  }

  return result
}

export function getAllWeaponCategories() {
  let allTypes = getAllWeaponTypes()

  let result = []

  for (let i=0;i<allTypes.length;i++) {
    if (!result.includes(allTypes[i].category)) {
      result.push(allTypes[i].category)
    }
  }

  return result
}

function getAllWeaponTypes() {
  return [
    new WeaponType('short sword', '1H', 'sword'),
    new WeaponType('long sword', '1H', 'sword'),
    new WeaponType('broadsword', '1H', 'sword'),
    new WeaponType('greatsword', '2H', 'sword'),
    new WeaponType('bastard sword', '1H', 'sword'),
    new WeaponType('scimitar', '1H', 'sword'),
    new WeaponType('falchion', '1H', 'sword'),
    new WeaponType('rapier', '1H', 'sword'),
    new WeaponType('cutlass', '1H', 'sword'),
    new WeaponType('war scythe', '2H', 'scythe'),
    new WeaponType('sickle', '1H', 'scythe'),
    new WeaponType('morningstar', '1H', 'mace'),
    new WeaponType('mace', '1H', 'mace'),
    new WeaponType('dagger', '1H', 'dagger'),
    new WeaponType('kukri', '1H', 'dagger'),
    new WeaponType('knife', '1H', 'knife'),
    new WeaponType('hunting knife', '1H', 'knife'),
    new WeaponType('long bow', '2H', 'bow'),
    new WeaponType('shortbow', '2H', 'bow'),
    new WeaponType('quarterstaff', '2H', 'staff'),
    new WeaponType('staff', '2H', 'staff'),
    new WeaponType('spear', '2H', 'spear'),
    new WeaponType('short spear', '1H', 'spear'),
    new WeaponType('broad axe', '1H', 'axe'),
    new WeaponType('battle axe', '1H', 'axe'),
    new WeaponType('throwing axe', '1H', 'axe'),
    new WeaponType('double-bladed axe', '1H', 'axe'),
    new WeaponType('crossbow', '2H', 'crossbow'),
    new WeaponType('hand crossbow', '1H', 'crossbow'),
    new WeaponType('war hammer', '1H', 'hammer'),
    new WeaponType('maul', '1H', 'hammer'),
    new WeaponType('great maul', '2H', 'hammer'),
    new WeaponType('club', '1H', 'club'),
    new WeaponType('heavy club', '1H', 'club'),
    new WeaponType('great club', '2H', 'club'),
    new WeaponType('whip', '1H', 'whip'),
    new WeaponType('trident', '2H', 'spear'),
    new WeaponType('flail', '1H', 'flail'),
    new WeaponType('war flail', '1H', 'flail'),
    new WeaponType('halberd', '2H', 'polearm'),
    new WeaponType('pole axe', '2H', 'polearm'),
  ]
}

function getWeaponTypesOfCategory(category) {
  let all = getAllWeaponTypes()

  let result = []

  for (let i=0;i<all.length;i++) {
    if (all[i].category == category) {
      result.push(all[i])
    }
  }

  return result
}

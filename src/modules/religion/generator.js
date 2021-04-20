import * as Character from "../characters/common.js"
import * as Deity from "./deity.js"
import * as Domain from "./domain.js"
import * as FantasyCharacter from "../characters/fantasy.js"
import * as iarnd from "../random.js"
import * as Pantheon from "./pantheon.js"
import * as Realm from "./realm.js"
import * as Religion from "./religion.js"
import * as Words from "../words.js"

const random = require("random")

export function generate() {
  let realms = randomRealms()

  let classification = Pantheon.randomClassification()

  let numberOfDeities = random.int(classification.minSize, classification.maxSize)

  let domainSets = randomDomainSets(numberOfDeities)

  let religion = new Religion.Religion('')
  religion.realms = realms
  religion.pantheon = new Pantheon.Pantheon('', '', classification)
  religion.pantheon.deities = randomDeities(domainSets, realms)

  return religion
}

function randomDeities(domainSets, realms) {
  let deities = []

  for (let i=0;i<domainSets.length;i++) {
    let possibleHolyItems = []
    let possibleHolySymbols = []
    let characterDetails = FantasyCharacter.generate()
    let deity = new Deity.Deity(characterDetails.firstName, characterDetails.species, characterDetails.gender, domainSets[i])

    deity.realm = iarnd.item(realms)

    for (let j=0;j<domainSets[i].length;j++) {
      possibleHolyItems = [].concat(possibleHolyItems, domainSets[i].holyItems)
      possibleHolySymbols = [].concat(possibleHolySymbols, domainSets[i].holySymbols)
    }

    deity.holyItem = iarnd.item(possibleHolyItems)
    deity.holySymbol = iarnd.item(possibleHolySymbols)

    let chanceOfRealmTrait = random.int(1, 100)

    let appearanceTraits = []

    for (let k=0;k<characterDetails.traits.length;k++) {
      let trait = characterDetails.traits[k].description
      appearanceTraits.push(trait)
    }

    if (chanceOfRealmTrait > 80) {
      appearanceTraits.push(iarnd.item(deity.realm.appearanceTraits).phrase)
    }

    deity.personality = Character.getRandomPersonality(deity.gender)
    deity.appearance = Words.arrayToPhrase(appearanceTraits)
    deity.description = Deity.describe(deity)

    deities.push(deity)
  }

  return deities
}

function randomDomainSets(numberOfSets) {
  let sets = []

  let domains = iarnd.shuffle(Domain.all())

  for (let i=0;i<numberOfSets;i++) {
    let numberOfDomainsInSet = 1
    let setDomains = []

    let chanceOfMore = random.int(1, 100)
    if (chanceOfMore > 80) {
      numberOfDomainsInSet += random.int(1, 2)
    }

    for (let j=0;j<numberOfDomainsInSet;j++) {
      let d = domains.pop()
      setDomains.push(d)
    }

    sets.push(setDomains)
  }

  return sets
}

function randomRealms() {
  let realms = []

  let numberOfRealms = random.int(1, 3)

  let allConcepts = Realm.allConcepts()
  allConcepts = iarnd.shuffle(allConcepts)

  for (let i=0;i<numberOfRealms;i++) {
    let concept = allConcepts.pop()

    let realmName = iarnd.item(concept.nameOptions)

    let appearanceTraits = Realm.getAllAppearanceTraitsForRealmConcept(concept)

    let description = iarnd.item(concept.descriptionOptions).replace('{name}', Words.uncapitalize(realmName))
    description = Words.capitalize(description)

    let realm = new Realm.Realm(realmName, description, [], appearanceTraits)

    realms.push(realm)
  }

  return realms
}

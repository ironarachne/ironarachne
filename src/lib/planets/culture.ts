import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";

export function generate(): string {
  let possibleTraits = RND.shuffle([
    ["warlike", "violent", "peaceful", "pacifist"],
    ["matriarchal", "patriarchal", "matrilineal", "patrilineal"],
    ["spiritual", "secular"],
    ["chaotic", "orderly", "caste-based"],
    ["conservative", "progressive", "traditional"],
    ["xenophobic", "xenophilic", "welcoming"],
    ["forgiving", "unforgiving"],
  ]);

  let characteristics = [];

  const numberOfTraits = random.int(1, 3);

  for (let i = 0; i < numberOfTraits; i++) {
    let trait = possibleTraits.pop();
    characteristics.push(RND.item(trait));
  }

  return Words.arrayToPhrase(characteristics);
}

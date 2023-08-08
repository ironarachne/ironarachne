import type AppearanceTrait from "$lib/appearance/trait";
import Realm from "./realm";

export function newRealm(
  name: string,
  description: string,
  personalityTraits: string[],
  appearanceTraits: AppearanceTrait[],
): Realm {
  let realm = new Realm();
  realm.name = name;
  realm.description = description;
  realm.personalityTraits = personalityTraits;
  realm.appearanceTraits = appearanceTraits;

  return realm;
}

import AppearanceTrait from "./trait";

export function byBodyPart(traits: AppearanceTrait[], bodyPart: string): AppearanceTrait[] {
  const results: AppearanceTrait[] = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].bodyPart == bodyPart) {
      results.push(traits[i]);
    }
  }

  return results;
}

export function byAnyTag(traits: AppearanceTrait[], tags: string[]): AppearanceTrait[] {
  const results: AppearanceTrait[] = [];

  for (let i = 0; i < traits.length; i++) {
    for (let j = 0; j < tags.length; j++) {
      if (traits[i].tags.includes(tags[j])) {
        results.push(traits[i]);
      }
    }
  }

  return results;
}

export function byTag(traits: AppearanceTrait[], tag: string): AppearanceTrait[] {
  const results: AppearanceTrait[] = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].tags.includes(tag)) {
      results.push(traits[i]);
    }
  }

  return results;
}

export function newTrait(phrase: string, bodyPart: string, tags: string[]): AppearanceTrait {
  let trait = new AppearanceTrait();

  trait.phrase = phrase;
  trait.bodyPart = bodyPart;
  trait.tags = tags;

  return trait;
}

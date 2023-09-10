import type AgeCategory from "$lib/age/age_category";
import type Gender from "$lib/gender/gender";
import type Species from "$lib/species/species";
import type DomainSet from "../domains/domainset";
import type Realm from "../realms/realm";
import Deity from "./deity";

export function newDeity(
  name: string,
  species: Species,
  gender: Gender,
  ageCategory: AgeCategory,
  realm: Realm,
  domains: DomainSet,
) {
  let deity = new Deity();

  deity.name = name;
  deity.species = species;
  deity.gender = gender;
  deity.ageCategory = ageCategory;
  deity.domains = domains;
  deity.realm = realm;

  return deity;
}

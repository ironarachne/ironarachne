import type AgeCategory from "$lib/age/agecategory";
import Gender from "./gender";

export function newGender(
  name: string,
  subj: string,
  obj: string,
  pos: string,
  maxAge: number,
  ageCategories: AgeCategory[],
): Gender {
  let gender = new Gender();
  gender.name = name;
  gender.subjectivePronoun = subj;
  gender.objectivePronoun = obj;
  gender.possessivePronoun = pos;
  gender.maxAge = maxAge;
  gender.ageCategories = ageCategories;

  return gender;
}

import type Title from "./title";

export function getTitleForGender(gender: string, title: Title): string {
  if (gender === "female") {
    return title.femaleTitle;
  }
  return title.maleTitle;
}

export function getHonorific(gender: string, title: Title): string {
  if (gender === "female") {
    return title.femaleHonorific;
  }
  return title.maleHonorific;
}

export function hasHigherPrecedenceThan(title1: Title, title2: Title): boolean {
  return title1.precedence > title2.precedence;
}

export function hasLowerPrecedenceThan(title1: Title, title2: Title): boolean {
  return title1.precedence < title2.precedence;
}

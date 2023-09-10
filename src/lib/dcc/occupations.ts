import DCCOccupation from "./occupation.js";
import * as Dwarf from "./occupations/dwarf.js";
import * as Elf from "./occupations/elf.js";
import * as Halfling from "./occupations/halfling.js";
import * as Human from "./occupations/human.js";

export function all(): DCCOccupation[] {
  let occupations: DCCOccupation[] = [];

  occupations = occupations.concat(Dwarf.all());
  occupations = occupations.concat(Elf.all());
  occupations = occupations.concat(Halfling.all());
  occupations = occupations.concat(Human.all());

  return occupations;
}

export function get(allowedOccupations: string[]): DCCOccupation[] {
  let occupations: DCCOccupation[] = [];

  if (allowedOccupations.includes("dwarf")) {
    occupations = occupations.concat(Dwarf.all());
  }

  if (allowedOccupations.includes("elf")) {
    occupations = occupations.concat(Elf.all());
  }

  if (allowedOccupations.includes("halfling")) {
    occupations = occupations.concat(Halfling.all());
  }

  if (allowedOccupations.includes("human")) {
    occupations = occupations.concat(Human.all());
  }

  return occupations;
}

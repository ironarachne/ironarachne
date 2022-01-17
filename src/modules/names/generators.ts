"use strict";

import NameGenerator from "./generator";
import DragonbornFamilyGenerator from "./generators/dragonbornfamily";
import DragonbornFemaleGenerator from "./generators/dragonbornfemale";
import DragonbornMaleGenerator from "./generators/dragonbornmale";
import DwarfFamilyGenerator from "./generators/dwarffamily";
import DwarfFemaleGenerator from "./generators/dwarffemale";
import DwarfMaleGenerator from "./generators/dwarfmale";
import ElfFamilyGenerator from "./generators/elffamily";
import ElfFemaleGenerator from "./generators/elffemale";
import ElfMaleGenerator from "./generators/elfmale";
import FantasyRegionsGenerator from "./generators/fantasyregions";
import GenericFantasyFamilyGenerator from "./generators/genericfantasyfamily";
import GenericFantasyFemaleGenerator from "./generators/genericfantasyfemale";
import GenericFantasyMaleGenerator from "./generators/genericfantasymale";
import GnomeFamilyGenerator from "./generators/gnomefamily";
import GnomeFemaleGenerator from "./generators/gnomefemale";
import GnomeMaleGenerator from "./generators/gnomemale";
import HalfElfFamilyGenerator from "./generators/half-elffamily";
import HalfElfFemaleGenerator from "./generators/half-elffemale";
import HalfElfMaleGenerator from "./generators/half-elfmale";
import HalfOrcFamilyGenerator from "./generators/half-orcfamily";
import HalfOrcFemaleGenerator from "./generators/half-orcfemale";
import HalfOrcMaleGenerator from "./generators/half-orcmale";
import HalflingFamilyGenerator from "./generators/halflingfamily";
import HalflingFemaleGenerator from "./generators/halflingfemale";
import HalflingMaleGenerator from "./generators/halflingmale";
import HumanFamilyGenerator from "./generators/humanfamily";
import HumanFemaleGenerator from "./generators/humanfemale";
import HumanMaleGenerator from "./generators/humanmale";

export function all(): NameGenerator[] {
  return [
    new DragonbornFamilyGenerator(),
    new DragonbornFemaleGenerator(),
    new DragonbornMaleGenerator(),
    new DwarfFamilyGenerator(),
    new DwarfFemaleGenerator(),
    new DwarfMaleGenerator(),
    new ElfFamilyGenerator(),
    new ElfFemaleGenerator(),
    new ElfMaleGenerator(),
    new FantasyRegionsGenerator(),
    new GenericFantasyFamilyGenerator(),
    new GenericFantasyFemaleGenerator(),
    new GenericFantasyMaleGenerator(),
    new GnomeFamilyGenerator(),
    new GnomeFemaleGenerator(),
    new GnomeMaleGenerator(),
    new HalfElfFamilyGenerator(),
    new HalfElfFemaleGenerator(),
    new HalfElfMaleGenerator(),
    new HalfOrcFamilyGenerator(),
    new HalfOrcFemaleGenerator(),
    new HalfOrcMaleGenerator(),
    new HalflingFamilyGenerator(),
    new HalflingFemaleGenerator(),
    new HalflingMaleGenerator(),
    new HumanFamilyGenerator(),
    new HumanFemaleGenerator(),
    new HumanMaleGenerator(),
  ];
}

export function byName(name: string): NameGenerator {
  const gens = all();

  for (let i=0;i<gens.length;i++) {
    if (gens[i].name == name) {
      return gens[i];
    }
  }
}

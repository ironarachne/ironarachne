import type Species from "$lib/species/species";
import type { NameGenerator } from "@ironarachne/made-up-names";
import type { Pantheon } from "./pantheons/pantheon_types";
import type { DivineRealm } from "./realms/realm_types";

export type Religion = {
    name: string;
    description: string;
    realms: DivineRealm[];
    pantheon: Pantheon | null;
}

export type ReligionCategory = {
  name: string;
  description: string;
  hasDeities: boolean;
  hasLeader: boolean;
  minDeities: number;
  maxDeities: number;
};

export type ReligionGenerationConfig = {
    categories: ReligionCategory[];
    deitySpeciesOptions: Species[];
    nameGenerator: NameGenerator;
    femaleNameGenerator: NameGenerator;
    maleNameGenerator: NameGenerator;
}
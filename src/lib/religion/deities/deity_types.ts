import type { Character, CharacterGenerationConfig } from "$lib/characters";
import type { Domain, DomainFilter, DomainSet } from "../domains";
import type { DivineRealm } from "../realms/realm_types";

export type DeityGenerationConfig = {
    characterGenerationConfig: CharacterGenerationConfig;
    realmOptions: DivineRealm[];
    domainOptions: Domain[];
    domainFilter: DomainFilter;
    minNumberOfDomains: number;
    maxNumberOfDomains: number;
    hasHolyItem: boolean;
    hasHolySymbol: boolean;
}

export type Deity = Character & {
    domains: DomainSet;
    realm: string | null;
    holyItem: string | null;
    holySymbol: string | null;
}


import * as Characters from '$lib/characters';
import * as Words from '@ironarachne/words';
import { RNG } from "@ironarachne/rng";
import type { Deity, DeityGenerationConfig } from "./deity_types";
import { generateDomainSet } from '../domains/domain_generation';
import type { Mutator } from '$lib/mutator';

export function generate(seed: string, config: DeityGenerationConfig): Deity {
    const rng = new RNG(seed);

    // Generate the base character
    let deity = Characters.generate(`deity-${seed}`, config.characterGenerationConfig) as Deity;
    deity.lastName = '';
    deity.name = deity.firstName;

    // Generate domains
    deity.domains = generateDomainSet(
        seed + '-domains',
        config.domainOptions,
        config.domainFilter,
        config.minNumberOfDomains,
        config.maxNumberOfDomains
    );

    // Assign a realm
    let deityRealm = null;
    if (config.realmOptions && config.realmOptions.length > 0) {
        deityRealm = rng.item(config.realmOptions);
    }

    deity.realm = deityRealm ? deityRealm.name : null;

    // Assign holy item and symbol if requested and available
    const primaryDomain = deity.domains.primary;
    deity.holyItem = (config.hasHolyItem && primaryDomain && primaryDomain.holyItems.length > 0)
        ? rng.item(primaryDomain.holyItems)
        : null;
    deity.holySymbol = (config.hasHolySymbol && primaryDomain && primaryDomain.holySymbols.length > 0)
        ? rng.item(primaryDomain.holySymbols)
        : null;

    // Apply any character mutators based on domains or realms
    const allMutators: Mutator<Deity>[] = [];
    deity.domains.primary?.mutators.forEach(m => allMutators.push(m));
    deity.domains.secondary?.mutators.forEach(m => allMutators.push(m));
    deity.domains.tertiary?.mutators.forEach(m => allMutators.push(m));
    if (deityRealm && deityRealm.mutators) {
        deityRealm.mutators.forEach(m => allMutators.push(m));
    }

    const numberOfMutators = Math.min(allMutators.length, 1); // limit to 1 until I add deduplication logic
    const mutatorsToApply: Mutator<Deity>[] = rng.randomSet(numberOfMutators, allMutators);

    mutatorsToApply.forEach((mutator) => {
        deity = mutator.mutate(seed + '-' + mutator.name, deity);
    });

    return deity;
}

export function describeDeity(deity: Deity, rng: RNG): string {
    let desc = `${deity.name} is a deity of`;
    const domains = [deity.domains.primary, deity.domains.secondary, deity.domains.tertiary]
        .filter(Boolean)
        .map(d => d!.name);
    if (domains.length > 0) {
        desc += ` ${Words.arrayToPhrase(domains)}`;
    }
    if (deity.realm) {
        desc += ` ${rng.item(["abiding", "living"])} in the realm of ${deity.realm}`;
    }
    desc += ". ";
    if (deity.holyItem) {
        desc += Words.capitalize(`${Words.pronoun(deity.gender.name, "possessive")} holy item is ${Words.article(deity.holyItem)} ${deity.holyItem}. `);
    }
    if (deity.holySymbol) {
        desc += Words.capitalize(`${Words.pronoun(deity.gender.name, "possessive")} holy symbol is ${Words.article(deity.holySymbol)} ${deity.holySymbol}. `);
    }

    desc += `${deity.name} appears as ${Words.article(deity.species.adjective)} ${deity.species.adjective} ${deity.ageCategory.noun}.`;

    desc += ` ${Words.capitalize(deity.gender.pronouns.subjective)} has ${Words.arrayToPhrase(deity.physicalTraits.map(t => t.description))}.`;

    desc += ` ${Characters.describePersonality(deity)}.`;
    
    return desc.trim();
}
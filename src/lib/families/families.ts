import type { Family, FamilyGenerationConfig } from "./family_types";
import human from "$lib/species/sentient/human";
import { getFantasyNameGeneratorSet } from "$lib/names";
import { RNG } from "@ironarachne/rng";
import type { Character, CharacterGenerationConfig } from "$lib/characters/character_types";
import * as CharacterGenerator from "$lib/characters/character_generation";
import * as AgeCategories from "$lib/age/age_categories";
import { relationshipTypes } from "$lib/relationships/relationships";
import * as SizeMatrix from "$lib/size/size_matrix";
import * as PersonalityTraits from "$lib/characters/personality_traits";

export function generateFamilyGeneration(seed: string, config: FamilyGenerationConfig, family: Family): Family {
    const rng = new RNG(seed + "-family-gen-iter");

    if (family.members.length === 0) {
        addFounder(family, config, rng);
    }

    // Determine the number of years per generation based on species lifespan.
    // We assume the first member's species is representative.
    const species = family.members[0].species;
    const yearsPerGeneration = getYearsPerGeneration(species, rng);

    for (let i = 0; i < config.generations; i++) {
        const genRng = new RNG(seed + "-gen-" + i);
        
        // Age up living members
        ageMembers(family, yearsPerGeneration, config, genRng);

        // Generate marriages
        generateMarriages(family, config, genRng);

        // Generate children
        generateChildren(family, config, genRng);
    }

    return family;
}

function addFounder(family: Family, config: FamilyGenerationConfig, rng: RNG) {
    const species = rng.item(config.speciesOptions);
    const gender = config.dominantGender && config.dominantGender !== 'any' 
        ? species.genders.find(g => g.name === config.dominantGender) || rng.item(species.genders)
        : rng.item(species.genders);

    const charConfig: CharacterGenerationConfig = {
        species: species,
        maleFirstNameGenerator: config.maleNameGenerator,
        femaleFirstNameGenerator: config.femaleNameGenerator,
        familyNameGenerator: config.familyNameGenerator,
        allowedAgeCategoryNames: ['child'],
        allowedGenderNames: [gender.name]
    };

    const founder = CharacterGenerator.generate(rng.randomString(16), charConfig);
    founder.familyId = family.id;
    founder.lastName = family.name;

    addMember(family, founder);
}

function getYearsPerGeneration(species: any, rng: RNG): number {
    const adultCategory = species.ageCategories.find((c: any) => c.name === 'adult');
    if (adultCategory) {
        return adultCategory.minAge + rng.int(0, 5);
    }
    return 20;
}

function ageMembers(family: Family, years: number, config: FamilyGenerationConfig, rng: RNG) {
    for (const member of family.members) {
        if (member.tags.includes('dead')) continue;

        const oldAgeCategoryName = member.ageCategory.name;
        member.age += years;

        // Find max age for species to avoid creating invalid age categories
        const maxPossibleAge = Math.max(...member.species.ageCategories.map((c: any) => c.maxAge));

        if (member.age > maxPossibleAge) {
            member.tags.push('dead');
            // Assign oldest category just in case
            const elder = member.species.ageCategories.find((c: any) => c.name === 'elder');
            if (elder) member.ageCategory = elder;
            member.description = CharacterGenerator.describe(member, rng);
            continue;
        }

        member.ageCategory = AgeCategories.getCategoryFromAge(member.age, member.species.ageCategories);
        
        if (member.ageCategory.name !== 'infant' && member.personalityTraits.length === 0) {
            member.personalityTraits = PersonalityTraits.getRandomPersonalityTraits(rng.randomString(16), rng.int(1, 3)).map(trait => trait.adjective);
        }

        if (member.ageCategory.name !== oldAgeCategoryName) {
            const sizeGeneratorConfig = SizeMatrix.getSizeConfig(
                member.gender.name,
                member.ageCategory.name,
                member.species.sizeGeneratorConfigMatrix,
            );
            member.height = rng.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
            member.weight = rng.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
            member.length = rng.int(sizeGeneratorConfig.minLength, sizeGeneratorConfig.maxLength);
        }

        member.description = CharacterGenerator.describe(member, rng);
        
        // Basic death check based on max age of species or old age
        const maxAge = member.species.ageCategories.find((c: any) => c.name === 'elder')?.maxAge || 100;
        
        // Chance to die random events?
        // Chance to die of old age?
        if (member.age > maxAge) {
             member.tags.push('dead');
        } else if (member.ageCategory.name === 'elder') {
             if (rng.float(0, 1) < 0.2) member.tags.push('dead');
        }
    }
}

function generateMarriages(family: Family, config: FamilyGenerationConfig, rng: RNG) {
    const eligible = family.members.filter(m => 
        !m.tags.includes('dead') && 
        (m.ageCategory.name === 'adult' || m.ageCategory.name === 'young adult') &&
        !hasSpouse(family, m.id)
    );

    for (const member of eligible) {
        if (rng.float(0, 1) > 0.8) continue; // Marriage chance

        const spouseSpecies = config.allowCrossSpeciesMarriages && rng.float(0, 1) < (config.crossSpeciesMarriageChance || 0) 
            ? rng.item(config.speciesOptions) 
            : member.species;

        // Determine spouse gender
        let spouseGenderName = 'female';
        if (member.gender.name === 'female') spouseGenderName = 'male';
        if (config.allowSameGenderMarriage && rng.float(0, 1) < (config.sameGenderMarriageChance || 0)) {
            spouseGenderName = member.gender.name;
        }

        const charConfig: CharacterGenerationConfig = {
            species: spouseSpecies,
            maleFirstNameGenerator: config.maleNameGenerator,
            femaleFirstNameGenerator: config.femaleNameGenerator,
            familyNameGenerator: config.familyNameGenerator, // Spouse takes family name? Or keeps theirs. Let's assume they join family for simplicity or just generation.
            allowedAgeCategoryNames: [member.ageCategory.name],
            allowedGenderNames: [spouseGenderName]
        };

        const spouse = CharacterGenerator.generate(rng.randomString(16), charConfig);
        spouse.familyId = family.id;

        if (config.dominantGender && config.dominantGender !== 'any') {
            if (spouse.gender.name === config.dominantGender && member.gender.name !== config.dominantGender) {
                member.lastName = spouse.lastName;
                member.description = CharacterGenerator.describe(member, rng);
                spouse.description = CharacterGenerator.describe(spouse, rng);
            } else if (member.gender.name === config.dominantGender && spouse.gender.name !== config.dominantGender) {
                spouse.lastName = member.lastName;
                spouse.description = CharacterGenerator.describe(spouse, rng);
            } else {
                spouse.lastName = member.lastName;
                spouse.description = CharacterGenerator.describe(spouse, rng);
            }
        } else {
            spouse.lastName = family.name;
            if (member.lastName !== family.name) {
                member.lastName = family.name;
                member.description = CharacterGenerator.describe(member, rng);
            }
            spouse.description = CharacterGenerator.describe(spouse, rng);
        }

        addMember(family, spouse);
        addRelationship(family, member.id, spouse.id, 'spouse', rng);
    }
}

function generateChildren(family: Family, config: FamilyGenerationConfig, rng: RNG) {
    // Find couples
    const couples = getCouples(family);

    for (const couple of couples) {
        const p1 = getMember(family, couple[0]);
        const p2 = getMember(family, couple[1]);

        if (!p1 || !p2) continue;
        if (p1.tags.includes('dead') || p2.tags.includes('dead')) continue;
        
        // Check fertility age (Adult/Young Adult)
        if (!isFertile(p1) || !isFertile(p2)) continue;

        if (rng.float(0, 1) < (config.fertilityChance || 0.8)) {
            const numChildren = rng.int(config.minMembersPerGeneration, config.maxMembersPerGeneration);
            const siblingIds: string[] = [];
            
            for(let i=0; i<numChildren; i++) {
                // Child inherits species from one parent (naive) or mixed if supported.
                const childSpecies = rng.float(0, 1) > 0.5 ? p1.species : p2.species;
                
                const charConfig: CharacterGenerationConfig = {
                    species: childSpecies,
                    maleFirstNameGenerator: config.maleNameGenerator,
                    femaleFirstNameGenerator: config.femaleNameGenerator,
                    familyNameGenerator: config.familyNameGenerator,
                    allowedAgeCategoryNames: ['child', 'infant'],
                    // However, we just aged up everyone. These children are born "during" the period. 
                    // Let's set them to 'child' generally.
                };

                const child = CharacterGenerator.generate(rng.randomString(16), charConfig);
                child.familyId = family.id;
                child.lastName = p1.lastName;
                child.description = CharacterGenerator.describe(child, rng);
                // Adjust age to be random within 'child' range or relative to parents? 
                
                addMember(family, child);
                addRelationship(family, p1.id, child.id, 'parent', rng);
                addRelationship(family, p2.id, child.id, 'parent', rng);
                
                // Sibling relationships?
                siblingIds.push(child.id);
            }

            // Add sibling relationships if there are multiple children
            for (let j = 0; j < siblingIds.length; j++) {
                for (let k = j + 1; k < siblingIds.length; k++) {
                    addRelationship(family, siblingIds[j], siblingIds[k], 'sibling', rng);
                    addRelationship(family, siblingIds[k], siblingIds[j], 'sibling', rng);
                }
            }
        }
    }
}

function addMember(family: Family, member: Character) {
    family.members.push(member);
    family.memberIds.push(member.id);
}

function getMember(family: Family, id: string): Character | undefined {
    return family.members.find(m => m.id === id);
}

function addRelationship(family: Family, originId: string, targetId: string, typeName: string, rng: RNG) {
    const type = relationshipTypes.find(r => r.name === typeName);
    if (!type) return;

    family.relationships.push({
        id: rng.randomString(16),
        originatorId: originId,
        recipientId: targetId,
        type: type,
        description: type.descriptionPhraseTemplates[0] // naive
    });

    if (!type.isOneSided) {
        const recipType = relationshipTypes.find(r => r.name === type.reciprocalName);
        if(recipType) {
             family.relationships.push({
                id: rng.randomString(16),
                originatorId: targetId,
                recipientId: originId,
                type: recipType,
                description: recipType.descriptionPhraseTemplates[0]
            });
        }
    }
}


function hasSpouse(family: Family, memberId: string): boolean {
    return family.relationships.some(r => r.originatorId === memberId && r.type.name === 'spouse');
}

function getCouples(family: Family): [string, string][] {
    const couples: [string, string][] = [];
    const processed = new Set<string>();

    for (const rel of family.relationships) {
        if (rel.type.name === 'spouse' && !processed.has(rel.originatorId) && !processed.has(rel.recipientId)) {
            couples.push([rel.originatorId, rel.recipientId]);
            processed.add(rel.originatorId);
            processed.add(rel.recipientId);
        }
    }
    return couples;
}

function isFertile(member: Character): boolean {
    return ['young adult', 'adult'].includes(member.ageCategory.name);
}




export function generateNewFamily(seed: string, config: FamilyGenerationConfig): Family {
    const rng = new RNG(seed + "-family-gen");
    const familyId = rng.randomString(16);
    const familyName = config.familyNameGenerator.generate(1)[0];

    const family: Family = {
        id: familyId,
        name: familyName,
        members: [],
        memberIds: [],
        relationships: [],
        femaleNameGenerator: config.femaleNameGenerator,
        maleNameGenerator: config.maleNameGenerator
    };

    return family;
}

export function getDefaultFamilyGenerationConfig(seed: string): FamilyGenerationConfig {
    // By default, this will generate "traditional" families for humans in a fantasy setting.
    const rng = new RNG(seed + "-family");
    const nameGeneratorSet = getFantasyNameGeneratorSet("human", rng);
    return {
        speciesOptions: [human],
        familyNameGenerator: nameGeneratorSet.family,
        femaleNameGenerator: nameGeneratorSet.female,
        maleNameGenerator: nameGeneratorSet.male,
        dominantGender: "male",
        generations: 3,
        minMembersPerGeneration: 2,
        maxMembersPerGeneration: 5,
        allowAdoption: false,
        allowIllegitimateChildren: false,
        allowMultipleMarriages: false,
        allowSameGenderMarriage: false,
        allowCrossSpeciesMarriages: false,
        adoptionChance: 0.0, // 0-1
        crossSpeciesMarriageChance: 0.0, // 0-1
        infantMortalityChance: 0.01, // 0-1
        illegitimateChildChance: 0.0, // 0-1
        multipleMarriageChance: 0.0, // 0-1
        sameGenderMarriageChance: 0.0, // 0-1
        fertilityChance: 0.8, // 0-1
    }
}
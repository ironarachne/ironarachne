import type { RNG } from "@ironarachne/rng";
import type { RelationshipType } from "./relationship_types";

export const relationshipTypes: RelationshipType[] = [
    {
        name: "friend",
        reciprocalName: "friend",
        descriptionPhraseTemplates: ["{originator} is friends with {recipient}"],
        incompatibleWithTypes: ["enemy", "rival"],
        isOneSided: false,
        tags: ["positive", "social"]
    },
    {
        name: "enemy",
        reciprocalName: "enemy",
        descriptionPhraseTemplates: ["{originator} is an enemy of {recipient}"],
        incompatibleWithTypes: ["friend", "ally"],
        isOneSided: false,
        tags: ["negative", "social"]
    },
    {
        name: "mentor",
        reciprocalName: "mentee",
        descriptionPhraseTemplates: ["{originator} mentors {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: false,
        tags: ["positive", "educational"]
    },
    {
        name: "rival",
        reciprocalName: "rival",
        descriptionPhraseTemplates: ["{originator} is a rival of {recipient}"],
        incompatibleWithTypes: ["friend"],
        isOneSided: false,
        tags: ["negative", "social"]
    },
    {
        name: "ally",
        reciprocalName: "ally",
        descriptionPhraseTemplates: ["{originator} is an ally of {recipient}"],
        incompatibleWithTypes: ["enemy"],
        isOneSided: false,
        tags: ["positive", "social"]
    },
    {
        name: "spouse",
        reciprocalName: "spouse",
        descriptionPhraseTemplates: ["{originator} is married to {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: false,
        tags: ["positive", "familial"]
    },
    {
        name: "parent",
        reciprocalName: "child",
        descriptionPhraseTemplates: ["{originator} is the parent of {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: false,
        tags: ["familial"]
    },
    {
        name: "sibling",
        reciprocalName: "sibling",
        descriptionPhraseTemplates: ["{originator} is the sibling of {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: false,
        tags: ["familial"]
    },
    {
        name: "colleague",
        reciprocalName: "colleague",
        descriptionPhraseTemplates: ["{originator} is a colleague of {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: false,
        tags: ["professional", "social"]
    },
    {
        name: "commander",
        reciprocalName: "subordinate",
        descriptionPhraseTemplates: ["{originator} commands {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: false,
        tags: ["professional", "hierarchical"]
    },
    {
        name: "subordinate",
        reciprocalName: "commander",
        descriptionPhraseTemplates: ["{originator} is subordinate to {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: false,
        tags: ["professional", "hierarchical"]
    },
    {
        name: "desire",
        reciprocalName: "",
        descriptionPhraseTemplates: ["{originator} desires {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: true,
        tags: ["emotional"]
    },
    {
        name: "hate",
        reciprocalName: "",
        descriptionPhraseTemplates: ["{originator} hates {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: true,
        tags: ["emotional"]
    },
    {
        name: "envy",
        reciprocalName: "",
        descriptionPhraseTemplates: ["{originator} envies {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: true,
        tags: ["emotional"]
    },
    {
        name: "admiration",
        reciprocalName: "",
        descriptionPhraseTemplates: ["{originator} admires {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: true,
        tags: ["emotional"]
    },
    {
        name: "trust",
        reciprocalName: "",
        descriptionPhraseTemplates: ["{originator} trusts {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: true,
        tags: ["emotional"]
    },
    {
        name: "distrust",
        reciprocalName: "",
        descriptionPhraseTemplates: ["{originator} distrusts {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: true,
        tags: ["emotional"]
    },
    {
        name: "fear",
        reciprocalName: "",
        descriptionPhraseTemplates: ["{originator} fears {recipient}"],
        incompatibleWithTypes: [],
        isOneSided: true,
        tags: ["emotional"]
    }
];

export function filterRelationshipTypes(allowedTags: string[], disallowedTags: string[]): RelationshipType[] {
    return relationshipTypes.filter(type => {
        const hasAllowedTags = allowedTags.length === 0 || allowedTags.every(tag => type.tags.includes(tag));
        const hasDisallowedTags = disallowedTags.some(tag => type.tags.includes(tag));
        return hasAllowedTags && !hasDisallowedTags;
    });
}

export function generateRelationshipDescription(rng: RNG, originatorName: string, recipientName: string, type: RelationshipType): string {
    const template = rng.item(type.descriptionPhraseTemplates);
    return template
        .replace("{originator}", originatorName)
        .replace("{recipient}", recipientName);
}

export function getInverseRelationshipType(type: RelationshipType): RelationshipType | null {
    const inverseType = relationshipTypes.find(t => t.name === type.reciprocalName);
    return inverseType || null;
}
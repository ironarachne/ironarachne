import type { PersonalityTrait } from './character_types';
import { RNG } from '@ironarachne/rng';

export const allPersonalityTraits: Record<string, PersonalityTrait> = {
	aloof: {
		adjective: "aloof",
		conflictingTraits: ["friendly"]
	},
	belligerent: {
		adjective: "belligerent",
		conflictingTraits: ["calm"]
	},
	calm: {
		adjective: "calm",
		conflictingTraits: ["belligerent", "grumpy"]
	},
	friendly: {
		adjective: "friendly",
		conflictingTraits: ["aloof"]
	},
	grumpy: {
		adjective: "grumpy",
		conflictingTraits: ["calm"]
	},
	loyal: {
		adjective: "loyal",
		conflictingTraits: ["unreliable"]
	},
	unreliable: {
		adjective: "unreliable",
		conflictingTraits: ["loyal"]
	},
	optimistic: {
		adjective: "optimistic",
		conflictingTraits: ["pessimistic"]
	},
	pessimistic: {
		adjective: "pessimistic",
		conflictingTraits: ["optimistic"]
	},
	sarcastic: {
		adjective: "sarcastic"
	},
	shy: {
		adjective: "shy",
		conflictingTraits: ["outgoing"]
	},
	outgoing: {
		adjective: "outgoing",
		conflictingTraits: ["shy"]
	},
	thoughtful: {
		adjective: "thoughtful",
		conflictingTraits: ["thoughtless"]
	},
	thoughtless: {
		adjective: "thoughtless",
		conflictingTraits: ["thoughtful", "kind"]
	},
	kind: {
		adjective: "kind",
		conflictingTraits: ["thoughtless", "cruel", "belligerent"]
	},
	cruel: {
		adjective: "cruel",
		conflictingTraits: ["kind"]
	},
	bubbly: {
		adjective: "bubbly",
		conflictingTraits: ["serious"]
	},
	serious: {
		adjective: "serious",
		conflictingTraits: ["bubbly"]
	},
	confident: {
		adjective: "confident",
		conflictingTraits: ["insecure"]
	},
	insecure: {
		adjective: "insecure",
		conflictingTraits: ["confident"]
	}
};

export function getRandomPersonalityTraits(seed: string, count: number): PersonalityTrait[] {
	const rng = new RNG(seed);
	const traitKeys = Object.keys(allPersonalityTraits);
	const selectedTraits: PersonalityTrait[] = [];

	while (selectedTraits.length < count && traitKeys.length > 0) {
		const randomIndex = rng.int(0, traitKeys.length - 1);
		const traitKey = traitKeys[randomIndex];
		const trait = allPersonalityTraits[traitKey];

		// Check for conflicting traits
		const hasConflict = selectedTraits.some(selectedTrait =>
			trait.conflictingTraits?.includes(selectedTrait.adjective)
		);

		if (!hasConflict) {
			selectedTraits.push(trait);
		}

		// Remove the trait from consideration
		traitKeys.splice(randomIndex, 1);
	}

	return selectedTraits;
}
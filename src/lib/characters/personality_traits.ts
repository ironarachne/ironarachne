import type { PersonalityTrait } from './character_types';

export const allPersonalityTraits: Record<string, PersonalityTrait> = {
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
		conflictingTraits: []
	},
	grumpy: {
		adjective: "grumpy",
		conflictingTraits: ["calm"]
	},
};
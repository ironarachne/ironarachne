import type { DivineRealmType } from "./realm_types";
import { RNG } from "@ironarachne/rng";

export const divineRealmTypes: DivineRealmType[] = [
	{
		name: "sky",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                'The Eternal Heavens',
                'The Heavens Above',
                'Heaven',
                'The Sky',
                'The Heavens',
                'The Celestial Realm',
                'The Empyrean',
                'The Firmament',
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "A realm of light and splendor high above the mortal world.",
                "A place of eternal sunshine and boundless skies.",
                "The heavens, where light and beauty reign supreme.",
                "A celestial paradise, far removed from mortal concerns.",
            ]);
		},
		mutators: [],
		canBeAfterlife: true,
		afterlifeType: "reward",
		canBeDivineAbode: true,
		canBeMortalRealm: false,
		isSingleBiome: false,
		biomeOptions: [], // e.g., cloud, sky, celestial biomes
	},
	{
		name: "earth",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The Mortal Realm",
                "The World of Men",
                "The Land of the Living",
                "The Earthly Plane",
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The home of mortals, full of cities and countryside.",
                "A realm of bustling towns and serene villages.",
                "The land where mortals live and toil.",
                "A world of diverse landscapes and cultures.",
            ]);
        },
		mutators: [],
		canBeAfterlife: false,
		canBeDivineAbode: false,
		canBeMortalRealm: true,
		isSingleBiome: false,
		biomeOptions: [], // e.g., plains, forests, mountains, etc.
	},
	{
		name: "forest",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The Eternal Forest",
                "The Great Woodland",
                "The Verdant Expanse",
                "The Infinite Grove",
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "An infinite forest of beauty and mystery.",
                "A vast woodland teeming with life and secrets.",
                "A realm where trees stretch endlessly towards the sky.",
                "A mystical forest, ancient and untouched by time.",
            ]);
        },
		mutators: [],
		canBeAfterlife: false,
		canBeDivineAbode: true,
		canBeMortalRealm: false,
		isSingleBiome: true,
		biomeOptions: [], // e.g., forest biomes
	},
	{
		name: "underworld",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The Underworld",
                "The Realm of Shadows",
                "The Dark Abyss",
                "The Eternal Night",
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "A realm of perpetual darkness where the dead rest forever.",
                "A shadowy domain, where the souls of the departed dwell.",
                "An underworld of mystery and eternal night.",
                "A place of darkness and silence, far from the living world.",
            ]);
        },
		mutators: [],
		canBeAfterlife: true,
		afterlifeType: "neutral",
		canBeDivineAbode: false,
		canBeMortalRealm: false,
		isSingleBiome: false,
		biomeOptions: [], // e.g., shadow, cavern, void biomes
	},
	{
		name: "ocean",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The Vast Sea",
                "The Infinite Ocean",
                "The Boundless Deep",
                "The Eternal Waters",
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "A realm apart from mortal seas, full of life and infinitely deep.",
                "An endless ocean, teeming with mysterious creatures.",
                "A vast expanse of water, stretching beyond the horizon.",
                "A watery domain, where the waves sing eternal songs.",
            ]);
        },
		mutators: [],
		canBeAfterlife: false,
		canBeDivineAbode: true,
		canBeMortalRealm: false,
		isSingleBiome: true,
		biomeOptions: [], // e.g., ocean, sea biomes
	},
	{
		name: "mountain",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The Mountain Realm",
                "The High Peaks",
                "The Skyward Mountains",
                "The Celestial Heights",
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "A towering paradise covered in forests and waterfalls.",
                "Majestic mountains reaching towards the heavens.",
                "A realm of high peaks and serene valleys.",
                "An elevated domain, where the air is pure and the views are endless.",
            ]);
        },
		mutators: [],
		canBeAfterlife: false,
		canBeDivineAbode: true,
		canBeMortalRealm: false,
		isSingleBiome: true,
		biomeOptions: [], // e.g., mountain biomes
	},
	{
		name: "void",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The Nameless Void",
                "The Abyssal Expanse",
                "The Infinite Chasm",
                "The Eternal Emptiness",
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "A realm of eternal darkness and emptiness.",
                "An endless void, where nothingness reigns supreme.",
                "A chasm of infinite depth, devoid of life and light.",
                "A place of absolute emptiness, where time and space cease to exist.",
            ]);
        },
		mutators: [],
		canBeAfterlife: true,
		afterlifeType: "punishment",
		canBeDivineAbode: false,
		canBeMortalRealm: false,
		isSingleBiome: false,
		biomeOptions: [], // e.g., void, abyss biomes
	},
	{
		name: "dream",
		nameGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "The Realm of Dreams",
                "The Dreamscape",
                "The Ethereal Plane",
                "The Surreal Domain",
            ]);
        },
		descriptionGenerator: (seed: string) => {
            const rng = new RNG(seed);
            return rng.item([
                "A place where the impossible becomes reality.",
                "A realm of endless imagination and wonder.",
                "A domain where dreams and reality intertwine.",
                "An ethereal plane, filled with surreal landscapes and fantastical creatures.",
            ]);
        },
		mutators: [],
		canBeAfterlife: false,
		canBeDivineAbode: true,
		canBeMortalRealm: false,
		isSingleBiome: false,
		biomeOptions: [], // e.g., ethereal, surreal biomes
	},
];
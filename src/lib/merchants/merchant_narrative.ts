import type { RNG } from '@ironarachne/rng';
import type {
  ResolvedHonestyLevel,
  ResolvedPriceLevel,
  ResolvedShopType,
  ResolvedVenueType,
} from './merchant_types.js';
import { SHOP_TYPE_LABELS } from './shop_catalog.js';

const SHOP_SUFFIXES: Record<ResolvedShopType, string[]> = {
  general: ['Goods', 'Wares', 'Trading Post', 'Emporium', 'Market'],
  weaponsmith: ['Blades', 'Armory', 'Forge', 'Steel', 'Arms'],
  armorer: ['Armory', 'Harness', 'Mail', 'Plate', 'Defense'],
  apothecary: ['Apothecary', 'Herbalist', 'Remedies', 'Physick', 'Stillroom'],
  clothier: ['Clothier', 'Tailor', 'Raiment', 'Wardrobe', 'Fabrics'],
  provisioner: ['Provisions', 'Pantry', 'Stores', 'Vittles', 'Larder'],
  tavern: ['Tavern', 'Inn', 'Rest', 'Cup', 'Hearth'],
  stable: ['Stable', 'Livery', 'Horses', 'Mews', 'Farrier'],
  scribe: ['Scriptorium', 'Inkwell', 'Scrolls', 'Letters', 'Records'],
  jeweler: ['Jeweler', 'Goldsmith', 'Silversmith', 'Gems', 'Baubles'],
};

const SHOP_ADJECTIVES = [
  'Golden',
  'Silver',
  'Copper',
  'Iron',
  'Lucky',
  'Wandering',
  'Honest',
  'Hidden',
  'Old',
  'Red',
  'Green',
  'Blue',
  'Crown',
  'Crossed',
  'Three',
];

const SHOP_NOUNS = [
  'Anvil',
  'Tankard',
  'Key',
  'Boot',
  'Coin',
  'Hammer',
  'Wheel',
  'Lantern',
  'Shield',
  'Arrow',
  'Crown',
  'Bell',
  'Oak',
  'Rose',
  'Star',
];

const VENUE_LABELS: Record<ResolvedVenueType, string> = {
  shop: 'Shop',
  stall: 'Market stall',
  cart: 'Pushcart',
  tent: 'Tent',
  market_booth: 'Market booth',
  wagon: 'Wagon',
};

export const RESOLVED_VENUE_TYPES: ResolvedVenueType[] = [
  'shop',
  'stall',
  'cart',
  'tent',
  'market_booth',
  'wagon',
];

export const RESOLVED_HONESTY_LEVELS: ResolvedHonestyLevel[] = [
  'honest',
  'fair',
  'shrewd',
  'shifty',
  'swindler',
];

export const RESOLVED_PRICE_LEVELS: ResolvedPriceLevel[] = [
  'bargain',
  'standard',
  'expensive',
  'extortionate',
];

export function getVenueTypeLabel(venueType: ResolvedVenueType): string {
  return VENUE_LABELS[venueType];
}

export function generateShopName(rng: RNG, shopType: ResolvedShopType, familyName: string): string {
  const suffix = rng.item(SHOP_SUFFIXES[shopType]);
  const patterns = [
    () => `The ${rng.item(SHOP_ADJECTIVES)} ${rng.item(SHOP_NOUNS)}`,
    () => `${familyName}'s ${suffix}`,
    () => `The ${suffix} of ${familyName}`,
    () => `${rng.item(SHOP_NOUNS)} and ${rng.item(SHOP_NOUNS)}`,
    () => `The ${rng.item(SHOP_ADJECTIVES)} ${suffix}`,
  ];
  return rng.item(patterns)();
}

const VENUE_DESCRIPTIONS: Record<ResolvedVenueType, string[]> = {
  shop: [
    'A stout timber building with a painted sign creaking above the door.',
    "Stone walls and a narrow front window display the merchant's best wares.",
    'The shop front is tidy, with shutters folded back to show shelves of goods within.',
    'A bell above the door rings when customers enter the cramped but well-stocked room.',
  ],
  stall: [
    'A wooden stall with an awning of patched canvas shields goods from sun and rain.',
    'Open crates and hanging bundles crowd a market stall on a busy thoroughfare.',
    'The stall is lashed together from boards and rope, with prices chalked on a slate.',
  ],
  cart: [
    'A two-wheeled pushcart piled with goods waits at a crossroads.',
    "The cart's canvas cover can be tied back to reveal trays of merchandise.",
    'A battered cart with a squeaking wheel serves as a roving storefront.',
  ],
  tent: [
    "A round tent of striped canvas marks this traveling merchant's pitch.",
    'Guy ropes anchor a weather-stained tent filled with crates and bundles.',
    'The tent flap is tied open to invite passersby into a dim, fragrant interior.',
  ],
  market_booth: [
    'A permanent booth under the market hall roof holds shelves of goods.',
    'This booth shares a row with fishmongers and cloth sellers, but smells of leather and oil.',
    'A low counter separates the merchant from the crowd in the covered market.',
  ],
  wagon: [
    'A covered wagon has been drawn up with its tailgate lowered into a counter.',
    "Painted panels on the wagon sides advertise the merchant's trade.",
    'The wagon doubles as storage and shop, with goods stacked to the canvas roof.',
  ],
};

const LOCATION_BLURBS = [
  'Near the town gate, where travelers first stop for supplies.',
  'On the market square, amid the noise of haggling and livestock.',
  'Down a side lane, away from the busiest crowds.',
  'Beside the temple district, where pilgrims browse for offerings.',
  'Along the river road, convenient for bargemen and carters.',
  "At the edge of the craftsmen's quarter, surrounded by workshops.",
  'On the high street, between a baker and a cobbler.',
  'Outside the castle walls, catering to soldiers and mercenaries.',
];

const SHOP_INTERIOR: Record<ResolvedShopType, string[]> = {
  general: [
    'Shelves hold a jumble of everyday goods, from nails to dried apples.',
    'Barrels, bundles, and boxed goods leave barely room to turn around.',
  ],
  weaponsmith: [
    'Blades hang from pegs above a scarred workbench and a cold forge.',
    'The smell of oil and steel hangs in the air above racks of hafted weapons.',
  ],
  armorer: [
    'Mannequins and stands display mail, helms, and shields in various states of finish.',
    'A padded fitting stool sits near rows of armor hung on wooden frames.',
  ],
  apothecary: [
    'Dried herbs hang from the rafters above rows of stoppered jars and labeled bundles.',
    'Mortars, scales, and a small still occupy one corner of the cluttered room.',
  ],
  clothier: [
    'Bolts of cloth lean in one corner while finished garments hang along the walls.',
    'A measuring rod and shears lie ready on a cutting table amid folded fabrics.',
  ],
  provisioner: [
    'Sacks of grain, wheels of cheese, and casks of salt pork fill the storeroom.',
    'The air smells of smoke, spice, and vinegar from preserved goods.',
  ],
  tavern: [
    'Trestle tables and a long bar dominate the room behind the serving hatch.',
    'Casks are stacked behind the counter, and a hearth warms the common room.',
  ],
  stable: [
    'Stalls line one wall while tack, feed sacks, and grooming tools fill the rest.',
    'The smell of hay and horses drifts in from the yard behind the counter.',
  ],
  scribe: [
    'Shelves of ledgers, stacks of parchment, and stoppered ink pots line the walls.',
    'A writing desk with a good lamp serves customers who need letters copied.',
  ],
  jeweler: [
    'A locked glass case displays rings and brooches under a single bright lamp.',
    'Fine tools for engraving and setting gems cover a velvet-draped counter.',
  ],
};

const HONESTY_NOTES: Record<ResolvedHonestyLevel, string[]> = {
  honest: [
    'This merchant weighs goods fairly and stands by every sale.',
    'Prices are marked clearly and match the quality on display.',
    "Locals speak well of this trader's reputation.",
  ],
  fair: [
    'Prices are reasonable, though a little haggling may win a small discount.',
    'The merchant answers direct questions honestly, if not always volunteered.',
    'A fair dealer, though not above a modest profit.',
  ],
  shrewd: [
    'Always inspect goods carefully before paying.',
    'The merchant highlights premium wares and downplays flaws with practiced ease.',
    'Expect sharp bargaining and few unasked concessions.',
  ],
  shifty: [
    'Some items may not be exactly as described.',
    'Weights and measures should be checked before coin changes hands.',
    'The merchant avoids direct answers about where certain goods were obtained.',
  ],
  swindler: [
    'Buyer beware. Counterfeits and short weights are rumored.',
    "Travelers warn that this trader's smile outpaces their scruples.",
    'Several customers have complained, though none within earshot of the proprietor.',
  ],
};

const HAGGLING_ADVICE: Record<ResolvedHonestyLevel, Record<ResolvedPriceLevel, string[]>> = {
  honest: {
    bargain: [
      'Little room to haggle; prices are already low.',
      'A bulk purchase may earn a small courtesy discount.',
    ],
    standard: [
      'Fair prices leave little need to bargain.',
      'The merchant may trim a few coppers for repeat custom.',
    ],
    expensive: [
      'Even honest merchants charge for convenience here.',
      'Ask about damaged or older stock for a better price.',
    ],
    extortionate: [
      'Unusual for an honest trader; verify you are reading the prices correctly.',
      'Compare with the market square before buying.',
    ],
  },
  fair: {
    bargain: [
      'Prices are already favorable; polite haggling may save a little.',
      'Offer to buy two items together.',
    ],
    standard: [
      'Expect to negotiate a few percent off listed prices.',
      'Cash upfront sometimes wins a discount.',
    ],
    expensive: [
      'Push back firmly; there is room to move.',
      'Walk away once and see if a better offer follows.',
    ],
    extortionate: [
      'Treat every price as an opening bid.',
      'Bring a friend who looks like they know the market.',
    ],
  },
  shrewd: {
    bargain: [
      'Still worth haggling; the first price is rarely the last.',
      'Inspect quality before celebrating a deal.',
    ],
    standard: ['Plan to spend time bargaining.', 'Compare similar items and cite rival prices.'],
    expensive: [
      'Assume listed prices are inflated.',
      'Offer well below asking and stand your ground.',
    ],
    extortionate: [
      'Only the naive pay the first price.',
      'Consider sourcing elsewhere unless you are desperate.',
    ],
  },
  shifty: {
    bargain: [
      'Verify weight, count, and quality even at low prices.',
      'Do not buy sealed bundles unopened.',
    ],
    standard: [
      'Haggle aggressively and recheck goods after agreement.',
      'Pay only after inspecting each item.',
    ],
    expensive: [
      'Strong suspicion of mislabeling is warranted.',
      'Bring your own scales if possible.',
    ],
    extortionate: [
      'Walk away unless you have no choice.',
      'Assume at least one item in the lot is not what it seems.',
    ],
  },
  swindler: {
    bargain: [
      'A low price may hide a low quality trap.',
      'Do not buy anything you cannot fully inspect.',
    ],
    standard: [
      'Refuse bundled deals and mystery lots.',
      'Count change carefully and recheck every item.',
    ],
    expensive: ['You are likely being fleeced.', 'Leave unless the item is truly irreplaceable.'],
    extortionate: [
      'This is robbery with a smile.',
      'Warn other travelers and spend your coin elsewhere.',
    ],
  },
};

export function generateVenueDescription(
  rng: RNG,
  venueType: ResolvedVenueType,
  shopType: ResolvedShopType,
): { description: string; locationBlurb: string } {
  const exterior = rng.item(VENUE_DESCRIPTIONS[venueType]);
  const interior = rng.item(SHOP_INTERIOR[shopType]);
  const locationBlurb = rng.item(LOCATION_BLURBS);
  const description = `${exterior} Inside, ${interior.charAt(0).toLowerCase()}${interior.slice(1)}`;
  return { description, locationBlurb };
}

export function generateHonestyNotes(rng: RNG, honesty: ResolvedHonestyLevel): string {
  return rng.item(HONESTY_NOTES[honesty]);
}

export function generateHagglingAdvice(
  rng: RNG,
  honesty: ResolvedHonestyLevel,
  priceLevel: ResolvedPriceLevel,
): string {
  return rng.item(HAGGLING_ADVICE[honesty][priceLevel]);
}

export function getShopTypeLabel(shopType: ResolvedShopType): string {
  return SHOP_TYPE_LABELS[shopType];
}

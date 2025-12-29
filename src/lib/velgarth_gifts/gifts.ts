import type Gift from "./gift";
import type GiftGeneratorConfig from "./generator_config";
import * as RNG from "@ironarachne/rng";
import type GiftPossibility from "./gift_possibility";

export function generate(config: GiftGeneratorConfig): Gift[] {
  const numberOfGifts = RNG.int(config.min_gifts, config.max_gifts);

  const gifts: Gift[] = [];

  let possibilities = config.possibilities;

  for (let i = 0; i < numberOfGifts; i++) {
    const gift = generateGift(possibilities);
    gifts.push(gift);
    possibilities = removePossibility(possibilities, gift);
  }

  return gifts;
}

function generateGift(possibilities: GiftPossibility[]): Gift {
  const possibility = RNG.weighted(
    possibilities.map((p) => {
      return { commonality: p.commonality, value: p };
    }),
  );
  const strength = RNG.weighted(
    possibility.strength_levels.map((s) => {
      return { commonality: s.commonality, value: s };
    }),
  );

  return {
    name: possibility.name,
    description: `${possibility.description} ${strength.description}`,
    strength: strength.strength,
  };
}

function removePossibility(
  possibilities: GiftPossibility[],
  gift: Gift,
): GiftPossibility[] {
  return possibilities.filter((p) => p.name !== gift.name);
}

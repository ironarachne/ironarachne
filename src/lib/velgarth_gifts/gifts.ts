import random from "random";
import type Gift from "./gift";
import type GiftGeneratorConfig from "./generator_config";
import * as RND from "@ironarachne/rng";
import type GiftPossibility from "./gift_possibility";

export function generate(config: GiftGeneratorConfig): Gift[] {
  const numberOfGifts = random.int(config.min_gifts, config.max_gifts);

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
  const possibility = RND.weighted(possibilities);
  const strength = RND.weighted(possibility.strength_levels);

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

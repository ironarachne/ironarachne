import * as RND from "@ironarachne/rng";
import * as Biomes from "./biomes/biomes";
import * as Climates from "./climates/climates";
import type Environment from "./environment";

export function generate(): Environment {
  let climate = RND.item(Climates.all());
  climate.description = Climates.describe(climate);
  let config = Biomes.getDefaultConfig();
  config.climate = climate;
  const biome = Biomes.generate(config);

  let environment: Environment = { biome, climate, description: "" };

  environment.description = `${RND.item(biome.descriptions)} ${RND.item(biome.features)}`;
  environment.description += " " + environment.climate.description;

  return environment;
}

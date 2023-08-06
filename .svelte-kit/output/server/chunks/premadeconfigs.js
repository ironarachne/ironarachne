import { p as pc, b as CharacterGeneratorConfig } from "./fantasy.js";
function getFantasy() {
  const speciesOptions = pc();
  let config = new CharacterGeneratorConfig();
  config.speciesOptions = speciesOptions;
  config.useAdaptiveNames = true;
  return config;
}
export {
  getFantasy as g
};

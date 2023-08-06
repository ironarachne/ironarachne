import { p as pc, a as CharacterGeneratorConfig } from './fantasy-9c67857f.js';

function getFantasy() {
  const speciesOptions = pc();
  let config = new CharacterGeneratorConfig();
  config.speciesOptions = speciesOptions;
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premadeconfigs-97e1b388.js.map

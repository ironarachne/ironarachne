import { p as pc, b as CharacterGeneratorConfig } from "./generatorconfig2.js";
import "./sentry-release-injection-file.js";
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
//# sourceMappingURL=premadeconfigs.js.map

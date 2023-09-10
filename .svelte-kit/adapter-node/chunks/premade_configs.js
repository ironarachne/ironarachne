import { m as getDefaultCharacterGeneratorConfig, i as byTag, e as all } from "./characters.js";
import "./sentry-release-injection-file.js";
function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all);
  config.useAdaptiveNames = true;
  return config;
}
export {
  getFantasy as g
};
//# sourceMappingURL=premade_configs.js.map

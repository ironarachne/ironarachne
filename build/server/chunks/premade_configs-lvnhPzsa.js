import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-wBnaQE5g.js';
import './sentry-release-injection-file-nUrLnAlE.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-lvnhPzsa.js.map

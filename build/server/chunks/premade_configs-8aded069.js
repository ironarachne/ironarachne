import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-b1b427b2.js';
import './sentry-release-injection-file-d0339e6f.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-8aded069.js.map

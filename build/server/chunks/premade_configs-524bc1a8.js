import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-ea7ef542.js';
import './sentry-release-injection-file-50b0c374.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-524bc1a8.js.map

import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-1346bee7.js';
import './sentry-release-injection-file-e93f6426.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-370ad353.js.map

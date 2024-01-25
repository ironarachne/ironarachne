import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-YGqZPfvd.js';
import './sentry-release-injection-file-ZosiLFNS.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-fyZJCnHx.js.map

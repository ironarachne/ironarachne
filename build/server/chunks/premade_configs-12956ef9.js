import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-b77e95cc.js';
import './sentry-release-injection-file-2a50013d.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-12956ef9.js.map

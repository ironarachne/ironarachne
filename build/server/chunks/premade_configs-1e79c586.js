import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-09ba8c89.js';
import './sentry-release-injection-file-2d896b4a.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-1e79c586.js.map

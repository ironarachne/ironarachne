import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-47fbeb76.js';
import './sentry-release-injection-file-e75cc0ec.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-4da98017.js.map

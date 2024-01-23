import { a as getDefaultCharacterGeneratorConfig, b as byTag, c as all$1 } from './characters-Pt2zWnuP.js';
import './sentry-release-injection-file-o9u5woV9.js';

function getFantasy() {
  let config = getDefaultCharacterGeneratorConfig();
  config.speciesOptions = byTag("sentient", all$1);
  config.useAdaptiveNames = true;
  return config;
}

export { getFantasy as g };
//# sourceMappingURL=premade_configs-sCMDeycZ.js.map

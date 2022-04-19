'use strict';

import LanguageFamilyGeneratorConfig from "./familygeneratorconfig";

export default class LanguageFamilyGenerator {
  config: LanguageFamilyGeneratorConfig;

  constructor(config: LanguageFamilyGeneratorConfig) {
    this.config = config;
  }
}

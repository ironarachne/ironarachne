import * as Characters from '$lib/characters';
import * as MercCompany from './fantasy/mercenary_company.js';
import * as TradingCompany from './fantasy/trading_company.js';
import * as WizardSchool from './fantasy/wizard_school.js';
import type * as RNG from '@ironarachne/rng';
import type OrganizationGeneratorConfig from './organization_generator_config.js';
import type OrganizationType from './organization_type.js';

export function getDefaultConfig(rng: RNG.RNG): OrganizationGeneratorConfig {
  const mercCompany = MercCompany.generateType(rng);
  const tradingCompany = TradingCompany.generateType(rng);
  const wizardSchool = WizardSchool.generateType(rng);

  return {
    organizationTypes: [mercCompany, tradingCompany, wizardSchool],
    characterConfig: Characters.getDefaultCharacterGenerationConfig(`character-${rng.randomString(13)}`),
    rng: rng,
  };
}

export function getTypes(rng: RNG.RNG): OrganizationType[] {
  const mercCompany = MercCompany.generateType(rng);
  const tradingCompany = TradingCompany.generateType(rng);
  const wizardSchool = WizardSchool.generateType(rng);

  return [mercCompany, tradingCompany, wizardSchool];
}

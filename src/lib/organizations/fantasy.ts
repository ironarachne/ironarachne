import * as PremadeConfigs from "$lib/characters/premade_configs";
import * as MercCompany from "./fantasy/mercenary_company.js";
import * as TradingCompany from "./fantasy/trading_company.js";
import * as WizardSchool from "./fantasy/wizard_school.js";
import type OrganizationGeneratorConfig from "./organization_generator_config.js";
import type OrganizationType from "./organization_type.js";

export function getDefaultConfig(): OrganizationGeneratorConfig {
  const mercCompany = MercCompany.generateType();
  const tradingCompany = TradingCompany.generateType();
  const wizardSchool = WizardSchool.generateType();

  return {
    organizationTypes: [mercCompany, tradingCompany, wizardSchool],
    characterConfig: PremadeConfigs.getFantasy(),
  };
}

export function getTypes(): OrganizationType[] {
  const mercCompany = MercCompany.generateType();
  const tradingCompany = TradingCompany.generateType();
  const wizardSchool = WizardSchool.generateType();

  return [mercCompany, tradingCompany, wizardSchool];
}

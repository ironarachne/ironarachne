import { ADND_2E_RULESET_DESCRIPTOR, ADND_2E_RULESET_REF } from './adnd_2e/descriptor';
import { ADND_2E_OPEN_RULES_SOURCE } from './adnd_2e/source_manifest';
import { DCC_LEGACY_RULESET_DESCRIPTOR, DCC_LEGACY_RULESET_REF } from './dcc/descriptor';
import { DND_5E_RULESET_DESCRIPTOR, DND_5E_RULESET_REF } from './dnd_5e/descriptor';
import { DND_5E_SRD_SOURCE } from './dnd_5e/source_manifest';
import { IRONARACHNE_RULESET_DESCRIPTOR, IRONARACHNE_RULESET_REF } from './ironarachne/descriptor';
import { IRONARACHNE_ORIGINAL_SOURCE } from './ironarachne/source_manifest';
import type {
  RulesDataSource,
  RulesetDefinition,
  RulesetDescriptor,
  RulesetRef,
} from './ruleset_types';

type RulesetCatalogEntry = {
  descriptor: RulesetDescriptor;
  load: () => Promise<RulesetDefinition>;
};

const RULESET_CATALOG: RulesetCatalogEntry[] = [
  {
    descriptor: IRONARACHNE_RULESET_DESCRIPTOR,
    load: async () => {
      const { ironArachneRuleset } = await import('./ironarachne/definition.js');
      return ironArachneRuleset;
    },
  },
  {
    descriptor: ADND_2E_RULESET_DESCRIPTOR,
    load: async () => {
      const { adnd2eRuleset } = await import('./adnd_2e/definition.js');
      return adnd2eRuleset;
    },
  },
  {
    descriptor: DCC_LEGACY_RULESET_DESCRIPTOR,
    load: async () => {
      const { dccLegacyRuleset } = await import('./dcc/definition.js');
      return dccLegacyRuleset;
    },
  },
  {
    descriptor: DND_5E_RULESET_DESCRIPTOR,
    load: async () => {
      const { dnd5eRuleset } = await import('./dnd_5e/definition.js');
      return dnd5eRuleset;
    },
  },
];

const RULES_DATA_SOURCES: RulesDataSource[] = [
  IRONARACHNE_ORIGINAL_SOURCE,
  ADND_2E_OPEN_RULES_SOURCE,
  DND_5E_SRD_SOURCE,
];

export function sameRulesetRef(left: RulesetRef, right: RulesetRef): boolean {
  return left.id === right.id && left.release === right.release;
}

export function allRulesets(): RulesetDescriptor[] {
  return RULESET_CATALOG.map(({ descriptor }) => ({
    ...descriptor,
    ref: { ...descriptor.ref },
    capabilities: [...descriptor.capabilities],
    sourceIds: [...descriptor.sourceIds],
  }));
}

export function allRulesDataSources(): RulesDataSource[] {
  return RULES_DATA_SOURCES.map((source) => ({
    ...source,
    grant: { ...source.grant },
  }));
}

export function findRulesetDescriptor(ref: RulesetRef): RulesetDescriptor | undefined {
  return RULESET_CATALOG.find(({ descriptor }) => sameRulesetRef(descriptor.ref, ref))?.descriptor;
}

export function findRulesetLoader(ref: RulesetRef): (() => Promise<RulesetDefinition>) | undefined {
  return RULESET_CATALOG.find(({ descriptor }) => sameRulesetRef(descriptor.ref, ref))?.load;
}

export function findRulesDataSource(id: string): RulesDataSource | undefined {
  return RULES_DATA_SOURCES.find((source) => source.id === id);
}

export { ADND_2E_RULESET_REF, DCC_LEGACY_RULESET_REF, DND_5E_RULESET_REF, IRONARACHNE_RULESET_REF };

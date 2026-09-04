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
];

const RULES_DATA_SOURCES: RulesDataSource[] = [IRONARACHNE_ORIGINAL_SOURCE];

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

export { IRONARACHNE_RULESET_REF };

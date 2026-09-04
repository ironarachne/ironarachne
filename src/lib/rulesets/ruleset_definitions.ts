import { MECHANICS_SUBJECTS } from './ruleset_types';
import type { RulesetCapability, RulesetDefinition, RulesetDescriptor } from './ruleset_types';

function hasCapability(descriptor: RulesetDescriptor, capability: RulesetCapability): boolean {
  return descriptor.capabilities.includes(capability);
}

/**
 * Defines one runtime package and rejects a descriptor that lies about its implemented services.
 * This is a developer error, so it throws while the module is loaded rather than becoming a
 * stored-data failure later.
 */
export function defineRuleset(definition: RulesetDefinition): RulesetDefinition {
  const { descriptor } = definition;
  const duplicateCapability = descriptor.capabilities.find(
    (capability, index) => descriptor.capabilities.indexOf(capability) !== index,
  );
  if (duplicateCapability !== undefined) {
    throw new Error(`ruleset capability "${duplicateCapability}" is declared more than once`);
  }

  for (const subject of MECHANICS_SUBJECTS) {
    const version = definition.mechanics?.schemaVersion(subject);
    if (hasCapability(descriptor, subject) !== (version !== undefined)) {
      throw new Error('ruleset mechanics codec and subject capabilities do not agree');
    }
    if (version !== undefined && (!Number.isInteger(version) || version < 1)) {
      throw new Error(`ruleset ${subject} mechanics schema version must be a positive integer`);
    }
  }

  const services: [RulesetCapability, unknown][] = [
    ['currency', definition.currency],
    ['equipment', definition.equipment],
    ['treasure-items', definition.treasureItems],
  ];
  for (const [capability, service] of services) {
    if (hasCapability(descriptor, capability) !== (service !== undefined)) {
      throw new Error(`ruleset ${capability} service and capability do not agree`);
    }
  }

  return definition;
}

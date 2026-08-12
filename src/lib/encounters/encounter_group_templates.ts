import type { EncounterGroupTemplate } from './encounter_types';

import { ENCOUNTER_GROUP_TEMPLATES } from './encounter_group_template_data';

/**
 * Every encounter group template. The returned array is shared and must not be mutated.
 */
export function allTemplates(): EncounterGroupTemplate[] {
  return ENCOUNTER_GROUP_TEMPLATES;
}

export function getGroupTemplateByName(name: string): EncounterGroupTemplate {
  const template = allTemplates().find((template) => template.name === name);

  if (!template) {
    throw new Error(`Encounter group template with name "${name}" not found.`);
  }

  return template;
}

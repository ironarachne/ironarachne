import type { EncounterTemplate } from './encounter_types';

import { FANTASY_ENCOUNTER_TEMPLATES } from './encounter_template_data';

/**
 * Every fantasy encounter template. The returned array is shared and must not be mutated.
 */
export function getAllFantasyEncounterTemplates(): EncounterTemplate[] {
  return FANTASY_ENCOUNTER_TEMPLATES;
}

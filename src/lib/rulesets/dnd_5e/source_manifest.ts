import { defineRulesDataSource } from '../ruleset_sources';

export const DND_5E_SRD_ATTRIBUTION =
  'This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") ' +
  'by Wizards of the Coast LLC and available at ' +
  'https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed ' +
  'under the Creative Commons Attribution 4.0 International License available at ' +
  'https://creativecommons.org/licenses/by/4.0/legalcode.';

/** The exact Creative Commons release used by this package; SRD 5.2 is a different source. */
export const DND_5E_SRD_SOURCE = defineRulesDataSource({
  id: 'dnd-srd.5.1-cc-by-4.0',
  title: 'System Reference Document 5.1',
  version: '5.1 (Creative Commons release, 27 January 2023)',
  publisher: 'Wizards of the Coast LLC',
  url: 'https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf',
  grant: {
    id: 'cc-by-4.0',
    name: 'Creative Commons Attribution 4.0 International',
    url: 'https://creativecommons.org/licenses/by/4.0/legalcode',
    scope: 'open-content',
    notice: DND_5E_SRD_ATTRIBUTION,
  },
  attribution: DND_5E_SRD_ATTRIBUTION,
  redistributable: true,
});

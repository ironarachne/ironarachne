import { defineRulesDataSource } from '../ruleset_sources';

/** Source record for Iron Arachne's existing normalized mechanics. */
export const IRONARACHNE_ORIGINAL_SOURCE = defineRulesDataSource({
  id: 'ironarachne.normalized-mechanics.v1',
  title: 'Iron Arachne normalized mechanics',
  version: '1',
  publisher: 'Iron Arachne contributors',
  grant: {
    id: 'project-original',
    name: 'Original project content',
    scope: 'original',
    notice: 'Original mechanics authored for Iron Arachne.',
  },
  attribution: 'Iron Arachne contributors',
  redistributable: true,
});

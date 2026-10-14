import { getGeologicalResources } from './geological_resources';
import type { GeologicalSourceDefinition, RawResourceDefinition } from './raw_source_types';

const reviewedReferences: Record<string, string> = {
  'tungsten-ore': 'https://pubs.usgs.gov/sir/2023/5012/sir20235012.pdf',
  'molybdenum-ore': 'https://pubs.usgs.gov/of/1999/of99-556/',
  'tantalum-ore': 'https://pubs.usgs.gov/publication/sir20235082/full',
  'bismuth-ore': 'https://pubs.usgs.gov/sir/2023/5012/sir20235012.pdf',
  'native-sulfur':
    'https://www.usgs.gov/observatories/hvo/news/volcano-watch-many-forms-sulfur-are-found-kilauea-volcano',
  'silica-sand': 'https://pubs.usgs.gov/bul/1019h/report.pdf',
  'red-ochre-earth': 'https://pubs.usgs.gov/bul/b2004/html/bull2004oolitic_ironstones.htm',
  'yellow-ochre-earth': 'https://pubs.usgs.gov/bul/b2004/html/bull2004oolitic_ironstones.htm',
  'trona-ore': 'https://pubs.usgs.gov/of/1982/0795/report.pdf',
  'potassium-salt-ore':
    'https://www.usgs.gov/publications/potash-a-global-overview-evaporate-related-potash-resources-including-spatial',
  'dolomite-rock': 'https://www.usgs.gov/publications/mineral-resource-month-ferrous-slag',
};

export function geologicalRawKey(name: string): string {
  const exceptions: Record<string, string> = {
    salt: 'salt-ore',
    dolomite: 'dolomite-rock',
    sand: 'generic-sand',
  };
  return exceptions[name] ?? name.replaceAll(' ', '-');
}

export function getGeologicalRawResources(): RawResourceDefinition[] {
  return getGeologicalResources().map((entry) => ({
    id: geologicalRawKey(entry.resource.name),
    resource: entry.resource,
    uses:
      entry.category === 'stone'
        ? ['construction', 'industrial']
        : entry.category === 'gemstone'
          ? ['ornament']
          : ['industrial'],
    food: { kind: 'not-food' },
  }));
}

export function getGeologicalSourceDefinitions(): GeologicalSourceDefinition[] {
  return getGeologicalResources().map((occurrence) => {
    const rawResourceId = geologicalRawKey(occurrence.resource.name);
    return {
      id: `fantasy:source:${rawResourceId}:deposit:v1`,
      rawResourceId,
      occurrence,
      requirements: occurrence.extractionMethods.map((method) => `${method} tools and access`),
      reviewRefs: [reviewedReferences[rawResourceId] ?? 'https://pubs.usgs.gov/bul/b1693/'],
      reviewNote:
        rawResourceId in reviewedReferences
          ? 'Reviewed coarse fictional occurrence, not an assay, quantity or refining capability.'
          : 'Retained baseline occurrence rule; metal properties are not mineral composition or grade.',
    };
  });
}

import { speciesNameToBadgeSlug } from './species_badge_slug.js';

const badgeSvgModules = import.meta.glob('./assets/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const badgeSvgBySlug = new Map<string, string>(
  Object.entries(badgeSvgModules).map(([path, svg]) => {
    const filename = path.split('/').pop() ?? '';
    const slug = filename.replace(/\.svg$/, '');
    return [slug, svg];
  }),
);

export function getSpeciesBadgeSvg(slug: string): string | undefined {
  return badgeSvgBySlug.get(slug);
}

export function getSpeciesBadgeSvgForName(speciesName: string): string | undefined {
  return getSpeciesBadgeSvg(speciesNameToBadgeSlug(speciesName));
}

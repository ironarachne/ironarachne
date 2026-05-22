import { archetypeNameToBadgeSlug } from './archetype_badge_slug.js';

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

export function getArchetypeBadgeSvg(slug: string): string | undefined {
  return badgeSvgBySlug.get(slug);
}

export function getArchetypeBadgeSvgForName(archetypeName: string): string | undefined {
  return getArchetypeBadgeSvg(archetypeNameToBadgeSlug(archetypeName));
}

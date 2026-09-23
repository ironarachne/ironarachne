import type { Artifact, ArtifactAssetRead, ArtifactSummary } from '$lib/artifacts';
import type { Project } from '$lib/projects';

export type PublicationBlock =
  | { type: 'heading'; text: string; level: number }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'facts'; facts: { label: string; value: string }[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'image'; asset: ArtifactAssetRead; caption?: string }
  | { type: 'notice'; text: string };

export type PublicationEntry = {
  sourceId: string;
  title: string;
  kindLabel: string;
  status: 'ready' | 'incomplete';
  blocks: PublicationBlock[];
  warnings: string[];
};

export type ProjectPublication = {
  title: string;
  description?: string;
  setting: string[];
  entries: PublicationEntry[];
};

type MarkdownPresenter = (value: never) => string;
type PresenterLoader = () => Promise<MarkdownPresenter>;

/** Kept as explicit imports so Vite can split each tool's generator and presentation code. */
export const PRESENTERS: Record<string, PresenterLoader> = {
  'arms-manufacturer': async () =>
    (await import('$lib/arms_manufacturer/arms_manufacturer_presentation'))
      .armsManufacturerToMarkdown,
  'character.adnd-2e': async () =>
    (await import('$lib/adnd/adnd_presentation')).adndCharacterToMarkdown,
  'character.dcc': async () => (await import('$lib/dcc/dcc_presentation')).dccCharacterToMarkdown,
  'character.swn': async () => (await import('$lib/swn/swn_presentation')).swnCharacterToMarkdown,
  'character.uncharted-worlds': async () =>
    (await import('$lib/unchartedworlds/uw_presentation')).uwCharacterToMarkdown,
  'chop-shop': async () =>
    (await import('$lib/chopshop/chop_shop_presentation')).chopShopToMarkdown,
  character: async () =>
    (await import('$lib/characters/character_presentation')).characterToMarkdown,
  culture: async () => (await import('$lib/culture/culture_presentation')).cultureToMarkdown,
  drug: async () => (await import('$lib/drug/drug_presentation')).drugToMarkdown,
  dungeon: async () => (await import('$lib/dungeon/dungeon_presentation')).dungeonToMarkdown,
  encounter: async () =>
    (await import('$lib/encounters/encounter_presentation')).encounterToMarkdown,
  environment: async () =>
    (await import('$lib/environment/environment_presentation')).environmentToMarkdown,
  family: async () => (await import('$lib/families/family_presentation')).familyToMarkdown,
  heraldry: async () => heraldryMarkdown,
  item: async () => (await import('$lib/equipment/item_presentation')).itemToMarkdown,
  language: async () => (await import('$lib/languages/language_presentation')).languageToMarkdown,
  merchant: async () => (await import('$lib/merchants/merchant_presentation')).merchantToMarkdown,
  organization: async () =>
    (await import('$lib/organizations/organization_presentation')).organizationToMarkdown,
  planet: async () =>
    (await import('$lib/astronomical_bodies/planet_presentation')).planetToMarkdown,
  potion: async () => (await import('$lib/potions/potion_presentation')).potionToMarkdown,
  region: async () => (await import('$lib/regions/region_presentation')).regionToMarkdown,
  religion: async () => (await import('$lib/religion/religion_presentation')).religionToMarkdown,
  settlement: async () =>
    (await import('$lib/settlements/settlement_presentation')).settlementToMarkdown,
  'spooky-ship': async () =>
    (await import('$lib/spooky_ship/spooky_ship_presentation')).spookyShipToMarkdown,
  'star-nation': async () =>
    (await import('$lib/civilizations/star_nation_presentation')).starNationToMarkdown,
  'star-system': async () =>
    (await import('$lib/astronomical_bodies/star_system_presentation')).starSystemToMarkdown,
  'starship.swn': async () =>
    (await import('$lib/swn/swn_starship_presentation')).swnStarshipToMarkdown,
  'treasure-hoard': async () =>
    (await import('$lib/treasure/treasure_hoard_presentation')).hoardToMarkdown,
  'velgarth-gifts': async () =>
    (await import('$lib/velgarth_gifts/velgarth_gifts_presentation')).velgarthGiftsToMarkdown,
};

/** These existing presentation functions already accept the validated stored shape. */
const SNAPSHOT_PRESENTERS = new Set([
  'drug',
  'dungeon',
  'encounter',
  'environment',
  'family',
  'heraldry',
  'item',
  'language',
  'merchant',
  'organization',
  'planet',
  'potion',
  'region',
  'star-system',
  'starship.swn',
  'treasure-hoard',
]);

export function publicationNeedsLiveValue(kind: string): boolean {
  return !SNAPSHOT_PRESENTERS.has(kind);
}

function heraldryMarkdown(value: never): string {
  const arms = value as { name: string; blazon: string };
  return `# ${arms.name}\n\n## Blazon\n\n${arms.blazon}\n`;
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

/** Parse the existing reader-facing Markdown, never a stored object's shape. */
export function presentationMarkdownToBlocks(markdown: string): PublicationBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: PublicationBlock[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (line === '') {
      index += 1;
      continue;
    }
    if (/^# /.test(line)) {
      // The artifact's saved name is the book entry title; the generated title can differ.
      index += 1;
      continue;
    }
    const heading = /^(#{2,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        text: stripInlineMarkdown(heading[2]),
      });
      index += 1;
      continue;
    }
    if (/^\|/.test(line) && index + 1 < lines.length && /^\|?[\s:|-]+\|?$/.test(lines[index + 1])) {
      const cells = (row: string) =>
        row
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => stripInlineMarkdown(cell.trim()));
      const columns = cells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && /^\|/.test(lines[index].trim())) {
        rows.push(cells(lines[index].trim()));
        index += 1;
      }
      blocks.push({ type: 'table', columns, rows });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoted.push(stripInlineMarkdown(lines[index].trim().replace(/^>\s?/, '')));
        index += 1;
      }
      blocks.push({ type: 'quote', text: quoted.join(' ') });
      continue;
    }
    if (/^(?:[-*]|\d+\.)\s+/.test(line)) {
      const items: string[] = [];
      const ordered = /^\d+\./.test(line);
      while (index < lines.length && /^(?:[-*]|\d+\.)\s+/.test(lines[index].trim())) {
        items.push(stripInlineMarkdown(lines[index].trim().replace(/^(?:[-*]|\d+\.)\s+/, '')));
        index += 1;
      }
      const facts = items.map((item) => /^([^:]{1,50}):\s+(.+)$/.exec(item));
      if (facts.every((item) => item !== null)) {
        blocks.push({
          type: 'facts',
          facts: facts.map((item) => ({ label: item![1], value: item![2] })),
        });
      } else {
        blocks.push({ type: 'list', items, ordered });
      }
      continue;
    }
    const paragraph = [stripInlineMarkdown(line)];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !/^(?:#|[-*]\s|\d+\.\s|\||>)/.test(lines[index].trim())
    ) {
      paragraph.push(stripInlineMarkdown(lines[index].trim()));
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }
  return blocks;
}

export function incompleteEntry(
  summary: ArtifactSummary,
  kindLabel: string,
  message: string,
): PublicationEntry {
  return {
    sourceId: summary.id,
    title: summary.name,
    kindLabel,
    status: 'incomplete',
    blocks: [{ type: 'notice', text: message }],
    warnings: [message],
  };
}

export async function presentArtifact(
  artifact: Artifact,
  assets: ArtifactAssetRead[],
  kindLabel: string,
  value: unknown,
): Promise<PublicationEntry> {
  const loader = PRESENTERS[artifact.kind];
  if (loader === undefined) {
    return incompleteEntry(
      artifact,
      kindLabel,
      'A publication view is unavailable for this artifact.',
    );
  }
  try {
    const presenter = await loader();
    const blocks = presentationMarkdownToBlocks(
      presenter((publicationNeedsLiveValue(artifact.kind) ? value : artifact.payload) as never),
    );
    const warnings: string[] = [];
    const primaryImages: PublicationBlock[] = [];
    for (const asset of assets) {
      if (['image/png', 'image/jpeg', 'image/svg+xml'].includes(asset.blob.type)) {
        const image: PublicationBlock = {
          type: 'image',
          asset,
          caption: asset.metadata.role === 'primary-preview' ? undefined : 'Saved illustration',
        };
        if (asset.metadata.role === 'primary-preview') primaryImages.push(image);
        else blocks.push(image);
      } else if (asset.blob.type.startsWith('image/')) {
        warnings.push(`An image for “${artifact.name}” could not be included.`);
      }
    }
    blocks.unshift(...primaryImages);
    if (blocks.length === 0)
      blocks.push({ type: 'notice', text: 'This artifact has no printable content.' });
    for (const warning of warnings) blocks.push({ type: 'notice', text: warning });
    return {
      sourceId: artifact.id,
      title: artifact.name,
      kindLabel,
      status: warnings.length > 0 ? 'incomplete' : 'ready',
      blocks,
      warnings,
    };
  } catch {
    return incompleteEntry(
      artifact,
      kindLabel,
      'This artifact could not be prepared for publication.',
    );
  }
}

export function projectPublication(
  project: Project,
  entries: PublicationEntry[],
): ProjectPublication {
  return {
    title: project.name,
    description: project.description,
    setting: [
      project.genre && `Genre: ${project.genre}`,
      project.system && `System: ${project.system}`,
      project.ruleset && `Ruleset: ${project.ruleset.id} ${project.ruleset.release}`,
    ].filter((line): line is string => Boolean(line)),
    entries,
  };
}

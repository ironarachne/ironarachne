import type { RegionDocument } from './region_presentation';

/** UI-only structure; saved descriptions and text/PDF export documents remain unchanged. */
export type RegionUiEntry = {
  heading: string;
  body: string;
  paragraphs?: string[];
  character?: string[];
  characterHeading?: string;
  factId?: string;
  hook?: string;
  hookHeading?: string;
  warning?: string;
};
export type RegionUiSection = { heading: string; entries: RegionUiEntry[] };
export type RegionUiDocument = Omit<RegionDocument, 'sections'> & { sections: RegionUiSection[] };

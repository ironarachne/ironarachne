import type { RegionLandscapeReference } from './region_landscape_reading_types';
import type { RegionDocument } from './region_presentation';

/** UI-only structure; saved descriptions and text/PDF export documents remain unchanged. */
export type RegionUiEntry = {
  heading: string;
  body: string;
  historyEventId?: string;
  summary?: string;
  possibleWork?: string;
  location?: string;
  references?: { label: string; anchorId: string }[];
  relatedAnchorId?: string;
  anchorId?: string;
  inspectionFactIds?: string[];
  paragraphs?: string[];
  character?: string[];
  characterHeading?: string;
  factId?: string;
  hook?: string;
  hookHeading?: string;
  warning?: string;
};
export type RegionUiSection = {
  heading: string;
  entries: RegionUiEntry[];
  landscapeReferences?: RegionLandscapeReference[];
};
export type RegionUiDocument = Omit<RegionDocument, 'sections'> & { sections: RegionUiSection[] };

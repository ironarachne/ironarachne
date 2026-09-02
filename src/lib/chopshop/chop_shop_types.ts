/**
 * A cyberpunk chop shop: a paragraph of prose, and nothing else.
 *
 * Decision 4 of docs/tool-readiness.md: a prose generator's artifact is the prose. The thing a
 * user wants to keep is the paragraph, the editing view is a textarea, and the re-roll is the
 * whole tool.
 */
export type ChopShop = {
  text: string;
};

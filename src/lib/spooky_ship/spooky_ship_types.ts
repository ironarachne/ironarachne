/**
 * A haunted derelict: a paragraph of prose, and nothing else.
 *
 * Decision 4 of docs/tool-readiness.md: a prose generator's artifact is the prose. The thing a
 * user wants to keep is the paragraph, the editing view is a textarea, and the re-roll is the
 * whole tool.
 *
 * **Its own kind rather than a share of `starship`**, which #71 asks to be settled deliberately.
 * Decision 6 of docs/readiness-objects.md settles it: this and `/swn/starship` are the same noun
 * from opposite directions and nothing else. A `StarshipSWN` is a hull with a mass, power and
 * hardpoint budget; this is a sentence about something drifting in the dark. One kind would put a
 * fitting editor in front of a paragraph, and a vault listing could not keep a haunted freighter
 * apart from a corvette a player is flying.
 */
export type SpookyShip = {
  text: string;
};

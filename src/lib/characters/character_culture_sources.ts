import {
  CULTURE_ARTIFACT_KIND,
  loadSavedCultures,
  mergeCultureChoices,
  type Culture,
} from '$lib/culture';
import { loadActiveProjectArtifactValues } from '$lib/workshop';

/**
 * The cultures a character can be named from.
 *
 * Seven generators offer this and each of them used to read the old `localStorage` scope directly,
 * which stopped being the whole answer when the culture generator started saving into projects
 * instead. Gathering both here means those seven agree about what a user has saved, rather than
 * each having its own opinion — and it is the only place that has to change again when the old
 * scope finally goes with `/saved-data` (#44).
 *
 * Asynchronous because the project store is: the vault is IndexedDB, and a synchronous read of it
 * is not a thing that exists. Callers should not make generating a character wait on this — a
 * dropdown of naming sources filling in a moment after the page does is unremarkable, where a
 * blank page until the database answers is not.
 */
export async function loadCulturesForNaming(): Promise<Culture[]> {
  const projectCultures = (await loadActiveProjectArtifactValues(
    CULTURE_ARTIFACT_KIND,
  )) as Culture[];
  return mergeCultureChoices(projectCultures, loadSavedCultures());
}

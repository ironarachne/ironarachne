import type { Culture } from './culture_types';

/**
 * The cultures a tool can offer a user, drawn from both places cultures live during the move.
 *
 * The open project is where cultures are saved now; the legacy `localStorage` scope is where they
 * were saved before, and it still holds whatever a user kept there. A tool that read only one of
 * them would either lose sight of everything saved before the workshop or stop seeing anything
 * saved since, and both look like the tool has forgotten the user's work.
 *
 * **The project wins a name.** Legacy adoption copies the old scope into a project without
 * emptying it — deliberately, so a bug in the migration has a fallback — which means the same
 * culture is very often in both. Offering it twice would make the user choose between two
 * identical-looking entries, and the project's copy is the one they can edit, reference, and
 * export, so it is the one that should be there.
 *
 * Names are what the older format has instead of ids, so a name is all there is to match on.
 */
export function mergeCultureChoices(
  projectCultures: Culture[],
  legacyCultures: Culture[],
): Culture[] {
  const claimed = new Set(projectCultures.map((culture) => culture.name));
  return [...projectCultures, ...legacyCultures.filter((culture) => !claimed.has(culture.name))];
}

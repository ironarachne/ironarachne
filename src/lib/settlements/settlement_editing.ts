import type { SettlementSnapshot, StoredSettlementNotable } from './settlement_snapshot.js';
import type { SettlementEconomicRole, SettlementProblem } from './settlement_types.js';

/** Every economic role a settlement may be given, for the control that offers them. */
export const SETTLEMENT_ECONOMIC_ROLES: SettlementEconomicRole[] = [
  'agrarian',
  'market',
  'industrial',
  'extractive',
  'mixed',
];

/**
 * The prose fields a settlement shows as a paragraph each, and so must let a user rewrite.
 *
 * Named as a set rather than given a function apiece because they behave identically: a string
 * shown to the user that the user may replace.
 */
export type SettlementTextField = 'name' | 'description' | 'tradeBlurb';

/** The four derived facets, each an integer the settlement displays on a 0–10 scale. */
export type SettlementFacetField = 'lawAndOrder' | 'commerce' | 'foodSecurity' | 'publicHealth';

/** The two counts a settlement shows beside its category. */
export type SettlementCountField = 'population' | 'prosperity';

/** Which of a settlement's two problem lists an edit applies to. */
export type SettlementProblemList = 'acuteProblems' | 'creepingProblems';

/** The parts of a trade layer that are lists of goods. */
export type SettlementTradeList = 'primaryImports' | 'primaryExports';

/** The fields of one notable a user would reasonably rewrite. */
export type SettlementNotableField = 'roleDisplay' | 'importance';

/**
 * Editing a stored settlement, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 in practice — rewriting one problem must not disturb the others, and renaming
 * the place must not touch its notables — and it is what lets the editing framework compare what
 * is on screen against what was read to decide whether there is anything to save.
 *
 * They work on the **snapshot**, not a live `Settlement`, because the snapshot is what is stored
 * and what the kind's `validate` speaks. An editor that worked on live values would run the codec
 * both ways on every keystroke, and the codec's reading half loads the whole charge library.
 *
 * Enrichment is opt-in, so most of these fields are optional and most settlements do not have
 * them. Each function below is written to leave a settlement that has no such layer exactly as it
 * was, rather than growing an empty one: an unenriched settlement is a shape of this kind, not a
 * settlement missing something.
 */
export function setSettlementText(
  snapshot: SettlementSnapshot,
  field: SettlementTextField,
  value: string,
): SettlementSnapshot {
  return { ...snapshot, [field]: value };
}

/**
 * Set one of the four facets, clamped to the 0–10 scale the settlement is displayed on.
 *
 * Clamped rather than rejected: the control is a number input, and a user who drags it past the
 * end means the end. A facet outside the scale would print as a value the legend beside it says
 * is impossible.
 */
export function setSettlementFacet(
  snapshot: SettlementSnapshot,
  field: SettlementFacetField,
  value: number,
): SettlementSnapshot {
  if (!Number.isFinite(value)) {
    return snapshot;
  }
  return { ...snapshot, [field]: Math.min(10, Math.max(0, Math.round(value))) };
}

/**
 * Rename the size band this settlement is described as being in.
 *
 * The name only. `minSize` and `maxSize` are the table row the settlement was drawn from, and a
 * user calling their city a "port city" is renaming what it is called, not asserting a new
 * population band for every city on the site.
 */
export function setSettlementCategoryName(
  snapshot: SettlementSnapshot,
  name: string,
): SettlementSnapshot {
  return { ...snapshot, category: { ...snapshot.category, name } };
}

/** Set the economic posture. Anything not in the table leaves the settlement alone. */
export function setSettlementEconomicRole(
  snapshot: SettlementSnapshot,
  role: string,
): SettlementSnapshot {
  if (!SETTLEMENT_ECONOMIC_ROLES.includes(role as SettlementEconomicRole)) {
    return snapshot;
  }
  return { ...snapshot, economicRole: role as SettlementEconomicRole };
}

/** Rewrite the description of the land the settlement sits in. */
export function setSettlementEnvironmentDescription(
  snapshot: SettlementSnapshot,
  description: string,
): SettlementSnapshot {
  return { ...snapshot, environment: { ...snapshot.environment, description } };
}

/**
 * Replace the hook tags from a comma-separated line.
 *
 * A line rather than a field each, for the same reason the trade lists are one: `river_trade,
 * highland` is one thought. Unlike trade, every settlement has this list, so there is no absent
 * layer to leave alone.
 */
export function setSettlementTags(snapshot: SettlementSnapshot, value: string): SettlementSnapshot {
  return {
    ...snapshot,
    settlementTags: value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== ''),
  };
}

/** Set population or prosperity. A non-number leaves the settlement alone. */
export function setSettlementCount(
  snapshot: SettlementSnapshot,
  field: SettlementCountField,
  value: number,
): SettlementSnapshot {
  if (!Number.isFinite(value) || value < 0) {
    return snapshot;
  }
  return { ...snapshot, [field]: Math.round(value) };
}

function problemsAt(
  snapshot: SettlementSnapshot,
  list: SettlementProblemList,
): SettlementProblem[] {
  return snapshot[list] ?? [];
}

function hasProblemAt(
  snapshot: SettlementSnapshot,
  list: SettlementProblemList,
  index: number,
): boolean {
  return Number.isInteger(index) && index >= 0 && index < problemsAt(snapshot, list).length;
}

/** Rewrite one problem's summary or detail, leaving every other problem alone. */
export function setSettlementProblem(
  snapshot: SettlementSnapshot,
  list: SettlementProblemList,
  index: number,
  field: 'summary' | 'detail',
  value: string,
): SettlementSnapshot {
  if (!hasProblemAt(snapshot, list, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    [list]: problemsAt(snapshot, list).map((problem, position) =>
      position === index ? { ...problem, [field]: value } : problem,
    ),
  };
}

/**
 * Add a blank problem to one of the lists.
 *
 * A problem is a summary and an optional detail — prose, all of it — so an empty one is a field
 * waiting to be filled rather than a broken record. That is why problems can be added and
 * notables, further down, cannot.
 */
export function addSettlementProblem(
  snapshot: SettlementSnapshot,
  list: SettlementProblemList,
  summary = '',
): SettlementSnapshot {
  const kind = list === 'acuteProblems' ? 'acute' : 'creeping';
  return { ...snapshot, [list]: [...problemsAt(snapshot, list), { kind, summary }] };
}

export function removeSettlementProblem(
  snapshot: SettlementSnapshot,
  list: SettlementProblemList,
  index: number,
): SettlementSnapshot {
  if (!hasProblemAt(snapshot, list, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    [list]: problemsAt(snapshot, list).filter((_problem, position) => position !== index),
  };
}

/**
 * Replace one of the trade lists from a comma-separated line.
 *
 * A line rather than a field per good, because that is how the page prints them and how a user
 * thinks of them: "salt, timber, wool" is one thought. Blank entries are dropped, so a trailing
 * comma does not leave an empty item behind in the export (requirement 6.4).
 */
export function setSettlementTradeList(
  snapshot: SettlementSnapshot,
  list: SettlementTradeList,
  value: string,
): SettlementSnapshot {
  if (snapshot[list] === undefined) {
    return snapshot;
  }
  const goods = value
    .split(',')
    .map((good) => good.trim())
    .filter((good) => good !== '');
  return { ...snapshot, [list]: goods };
}

function notablesOf(snapshot: SettlementSnapshot): StoredSettlementNotable[] {
  return snapshot.importantPeople ?? [];
}

function hasNotableAt(snapshot: SettlementSnapshot, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < notablesOf(snapshot).length;
}

function replaceNotable(
  snapshot: SettlementSnapshot,
  index: number,
  change: (notable: StoredSettlementNotable) => StoredSettlementNotable,
): SettlementSnapshot {
  if (!hasNotableAt(snapshot, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    importantPeople: notablesOf(snapshot).map((notable, position) =>
      position === index ? change(notable) : notable,
    ),
  };
}

/** Rewrite a notable's civic title or the sentence saying why they matter. */
export function setSettlementNotableField(
  snapshot: SettlementSnapshot,
  index: number,
  field: SettlementNotableField,
  value: string,
): SettlementSnapshot {
  return replaceNotable(snapshot, index, (notable) => ({ ...notable, [field]: value }));
}

/**
 * Rename one notable.
 *
 * The name lives on the character inside the notable, not on the notable, which is why this is not
 * another {@link SettlementNotableField}: a settlement's notable is a role held by a person, and
 * the person is `$lib/characters`' record.
 */
export function setSettlementNotableName(
  snapshot: SettlementSnapshot,
  index: number,
  field: 'firstName' | 'lastName',
  value: string,
): SettlementSnapshot {
  return replaceNotable(snapshot, index, (notable) => ({
    ...notable,
    character: { ...notable.character, [field]: value },
  }));
}

/**
 * Drop a notable from the settlement.
 *
 * There is deliberately no way to add one. A notable is a generated character with a species, an
 * age, a set of physical traits, and an archetype; an empty one would be a broken record rather
 * than a blank field, the same reason `$lib/religion` will remove a deity but not add one.
 */
export function removeSettlementNotable(
  snapshot: SettlementSnapshot,
  index: number,
): SettlementSnapshot {
  if (!hasNotableAt(snapshot, index)) {
    return snapshot;
  }
  return {
    ...snapshot,
    importantPeople: notablesOf(snapshot).filter((_notable, position) => position !== index),
  };
}

/** Rewrite an organization's name or the line the settlement introduces it with. */
export function setSettlementOrganizationField(
  snapshot: SettlementSnapshot,
  index: number,
  field: 'name' | 'hook',
  value: string,
): SettlementSnapshot {
  const organizations = snapshot.organizations ?? [];
  if (!Number.isInteger(index) || index < 0 || index >= organizations.length) {
    return snapshot;
  }
  return {
    ...snapshot,
    organizations: organizations.map((organization, position) => {
      if (position !== index) {
        return organization;
      }
      return field === 'name'
        ? { ...organization, name: value }
        : { ...organization, profile: { ...organization.profile, hook: value } };
    }),
  };
}

# Characters

This library generates **characters**: a species and gender, an age and a body to match, a name
drawn from the right naming tradition, personality and physical traits, an archetype, and the
titles they answer to. A `Character` extends `Creature`, so anything that works on creatures works
on characters too.

Generation is seeded — `generate(seed, config)` builds its own `RNG` — so the same seed and config
always produce the same person. `rollCharacter(seed, config)` is the single path the Fantasy
Character generator and a re-roll from provenance both take; prefer it over calling `generate`
directly, because it is where the settings a re-roll reads back are defined.

## This library implements no game system

Deliberately, and it is worth saying plainly (requirement 8.4 of [the readiness
spec](../../../docs/workshop.md#tool-release-readiness)). A character here has **no levels, no
classes, no attribute scores, and no derived combat numbers** — an archetype is an occupation and a
flavour, not a character class, and `combatProfile` is the generic creature default rather than
anything a ruleset would recognise. A character is a _person_: someone to put behind a counter or at
the head of a household, usable at any table.

Where a system's character lives instead: `$lib/adnd` (AD&D 2E), `$lib/dcc`, `$lib/swn`, and
`$lib/unchartedworlds`. That is also why the artifact kind here is `character`, unqualified, and
theirs are `character.adnd-2e` and the like — see
[docs/fantasy-character.md](../../../docs/fantasy-character.md), decision 1.

## Features

- **Types** — `Character`, `CharacterGenerationConfig`, `PersonalityTrait`, and `Title`.
- **Generation** — `generate`, with `getDefaultCharacterGenerationConfig` and
  `getCharacterGenerationConfigForNameSet` for a config that shares one naming source with the
  settlement, organization, and notable generators.
- **Description** — `describe` writes a paragraph about a character; `describePersonality` and
  `describeTraits` return the pieces.
- **Names** — `generateCharacterName`, `resolveCharacterNameGeneratorSet`,
  `buildCharacterNameSource`, `formatCharacterDisplayName`, `applyGeneratedCharacterName`,
  `restoreLockedCharacterName` (for a name the user has pinned while rerolling everything else),
  and the system-specific bridges `fantasyHintToNameSetName`, `dccOccupationToNameSetHint`, and
  `generateDccCharacterNames`.
- **Cultures to name from** — `loadCulturesForNaming`, which gathers the open project's cultures
  and whatever is still in the older `localStorage` scope into one list, so the seven generators
  that offer "name this character from a saved culture" agree about what the user has saved.
- **Personality traits** — `allPersonalityTraits` and `getRandomPersonalityTraits`, which respects
  each trait's `conflictingTraits` so a character is not both bold and timid.
- **Rolling** — `rollCharacter` and `rollCharacterSnapshot`, with
  `CharacterGeneratorConfigRecord` and `readCharacterGeneratorConfig` — the typed boundary where an
  artifact's untyped provenance becomes settings a roll can take. A roll reports the pattern set it
  actually used and any part of the recorded config this build could no longer supply.
- **Storing** — `toCharacterSnapshot` and `toStoredCharacter` write a character with its species,
  archetype, and arms as names; `characterFromSnapshot`, `characterFromStored`,
  `speciesFromStoredName` and `isUnknownSpeciesName` read one back. `StoredCharacter` lives here
  rather than in `$lib/settlements`, which embeds it for its notables.
- **The artifact kind** — `characterArtifactKind`, `CHARACTER_ARTIFACT_KIND`,
  `validateCharacterSnapshot`, `migrateCharacterSnapshot`.
- **Editing a saved character** — `character_editing.ts`: one function per field, each taking a
  snapshot and returning a new one. Species is not among them; see the module comment for why.
- **Presentation** — `characterToDocument`, `characterToMarkdown`, `characterToPlainText`,
  `characterFileStem`, and `characterTitleLine`, for the Markdown and PDF exports.
- **Titles** — `getStandardNobleTitles`, `getNobleTitleByName`, `getTitle`, `getHonorific`,
  `getTitleForGender`, `createTitleFromCore`, and the precedence helpers
  (`hasHigherPrecedenceThan`, `hasLowerPrecedenceThan`, `getHighestPrecedenceTitle`).

## Usage

```typescript
import { describe, generate, getDefaultCharacterGenerationConfig } from '$lib/characters';

const seed = 'some seed';
const config = getDefaultCharacterGenerationConfig(seed);
const character = generate(seed, config);

character.firstName;
character.archetype?.name;
```

Narrow what may be generated through the config: `archetypeOptions`, the archetype and personality
tag allow/deny lists, `allowedGenderNames`, `allowedAgeCategoryNames`, and
`physicalTraitOverrides`. To have a character share a settlement's naming tradition, build the
config from that name set:

```typescript
import { getCharacterGenerationConfigForNameSet } from '$lib/characters';

const config = getCharacterGenerationConfigForNameSet(seed, nameSet);
```

Titles are separate from generation — apply them to a character and read them back:

```typescript
import { getNobleTitleByName, getTitle } from '$lib/characters';

character.titles = [getNobleTitleByName('Duke')];
getTitle(character); // the form matching the character's gender
```

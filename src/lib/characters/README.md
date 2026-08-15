# Characters

This library generates **characters**: a species and gender, an age and a body to match, a name
drawn from the right naming tradition, personality and physical traits, an archetype, and the
titles they answer to. A `Character` extends `Creature`, so anything that works on creatures works
on characters too.

Generation is seeded — `generate(seed, config)` builds its own `RNG` — so the same seed and config
always produce the same person.

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

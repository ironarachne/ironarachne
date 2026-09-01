# Uncharted Worlds

This library implements character generation for **Uncharted Worlds**: origin, careers, skills,
workspaces, and the assets a character has accumulated, plus the PDF sheet.

Uncharted Worlds characters are defined by what they have done rather than by a class, so careers
are the spine of generation — each contributes skills and assets, and a character is the
accumulation of several.

## What is implemented, and what is not

This covers **Uncharted Worlds character creation**, and only that: the ten careers with their
skills, workspaces, descriptors and advancements, the ten origins, the standard stat array
(+2/+1/+1/0/-1), and the assets a starting character has accumulated.

Deliberately absent: everything about play rather than creation — the moves, Data Points, factions,
crew and ship sheets beyond the assets a character personally owns, and advancement past the first
one a character picks. A character generated here is a starting character; a player who advances one
edits the saved artifact rather than asking the tool for a veteran.

**Which printing the tables were transcribed from is not recorded anywhere in this repository**, and
this file is not the place to guess it. What requirement 8.4 asks for that can be stated honestly is
above: what is here, and what is not. Anyone who knows the answer should replace this paragraph with
it. Iron Arachne is unofficial and unaffiliated with the game's publisher.

## Features

- **Types** — `UWCharacter`, `Origin`, `Career`, `Skill`, `Workspace`, `Asset`, `AssetType`,
  `AssetTemplate`, `Upgrade`, and `UpgradeWithExtras`.
- **Generation** — `generate(rng)` and `createUwCharacter`, with `create*` constructors for
  building each piece programmatically (`createCareer`, `createSkill`, `createWorkspace`,
  `createAsset`, `createAssetType`, `createAssetTemplate`, `createUpgrade`,
  `createUpgradeWithExtras`). The content this library ships with is written as literals in the
  data modules below rather than through these, so a caller adding content should edit those.
- **Skill descriptions** — `parseSkillDescription` turns a skill's description into
  `SkillDescriptionBlock`s: plain text blocks and options blocks, so a skill that offers a choice
  renders as a list rather than as a run-on sentence.
- **PDF** — `buildUwCharacterPdf` returns a `Blob`; `downloadUwCharacterPdf` saves it, drawn with
  the sci-fi layout in [`$lib/pdf`](../pdf/README.md).

## Data tables

The content lives in its own modules, so the generator reads as generation logic rather than as
pages of content. To add or change content, edit these rather than `character.ts`:

- `asset_data.ts` — the asset templates, their types, common traits, and upgrades.
- `career_data.ts` — the careers, with their workspaces, advancements, and skills.
- `origin_data.ts` — the origins and the skills each one grants.

These tables are shared, module-level constants: treat them as read-only. Generation copies each
row it actually uses — a chosen template, the two careers kept, the picked origin — before taking
it apart. That copy is load bearing, because building a character shuffles those lists in place
and pops from them; working on a table row directly would reorder it and gradually empty it for
every character generated afterwards.

## Saving a character

The character generator is Release-ready (issue #50), which means everything it produces can be
kept:

- `uw_character_snapshot.ts` — the stored form. **Rulebook rows travel by name and their prose is
  derived on read**: a career, an origin, a workspace and a skill are all rows a character points
  at, so a corrected description reaches a character saved last month, and an artifact does not
  carry several kilobytes of this repository's own text. Assets are the exception and are stored in
  full, because an asset is assembled at generation time rather than looked up.
- `uw_character_artifact_kind.ts` — the `character.uncharted-worlds` kind: validation, the payload
  version, and what to call an artifact whose character was never named (their careers, because in
  this game that is what a character is).
- `uw_character_roll.ts` — the single path from a seed to a character, names included. Both the
  generator page and a re-roll from the vault go through it.
- `uw_character_editing.ts` — one function per field, each returning a new snapshot. There is no
  function for a skill's description, and that is the point: what a user changes is _which_ skill
  they have.
- `uw_presentation.ts` — the character as a document, and the Markdown export written from it.
  Empty sections are dropped here rather than in each renderer.

A row this build no longer has rebuilds as a placeholder wearing the stored name, rather than
throwing: a character whose career was renamed is still that character, and their stats, skills and
assets are all still on the sheet.

## Usage

```typescript
import { generate, parseSkillDescription } from '$lib/unchartedworlds';

const character = generate(rng);

character.careers;
character.skills;

const blocks = parseSkillDescription(character.skills[0].description);
```

`generate` takes an existing `RNG` rather than a seed, so seed it yourself when the result has to be
reproducible.

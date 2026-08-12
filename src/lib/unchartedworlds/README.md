# Uncharted Worlds

This library implements character generation for **Uncharted Worlds**: origin, careers, skills,
workspaces, and the assets a character has accumulated, plus the PDF sheet.

Uncharted Worlds characters are defined by what they have done rather than by a class, so careers
are the spine of generation — each contributes skills and assets, and a character is the
accumulation of several.

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

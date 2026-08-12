# Uncharted Worlds

This library implements character generation for **Uncharted Worlds**: origin, careers, skills,
workspaces, and the assets a character has accumulated, plus the PDF sheet.

Uncharted Worlds characters are defined by what they have done rather than by a class, so careers
are the spine of generation — each contributes skills and assets, and a character is the
accumulation of several.

## Features

- **Types** — `UWCharacter`, `Origin`, `Career`, `Skill`, `Workspace`, `Asset`, `AssetType`,
  `AssetTemplate`, `Upgrade`, and `UpgradeWithExtras`.
- **Generation** — `generate(rng)` and `createUwCharacter`, with `create*` constructors for each
  piece (`createCareer`, `createSkill`, `createWorkspace`, `createAsset`, `createAssetType`,
  `createAssetTemplate`, `createUpgrade`, `createUpgradeWithExtras`).
- **Skill descriptions** — `parseSkillDescription` turns a skill's description into
  `SkillDescriptionBlock`s: plain text blocks and options blocks, so a skill that offers a choice
  renders as a list rather than as a run-on sentence.
- **PDF** — `buildUwCharacterPdf` returns a `Blob`; `downloadUwCharacterPdf` saves it, drawn with
  the sci-fi layout in [`$lib/pdf`](../pdf/README.md).

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

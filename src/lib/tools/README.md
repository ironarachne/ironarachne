# Tools

The catalog of user-facing tools on the site — every generator, editor, and reference page —
together with the metadata that describes them.

Its job is to answer "what tools does Iron Arachne have, and what are they for?" in one place,
so navigation, filtering, and search all agree.

## Metadata model

Each entry carries a route path, a nav label, a `kind` (`generator`, `editor`, or `reference`),
the `domain` it is listed under, and its `maturity`. Beyond that it is a `TaggedItem` from
[`$lib/tags`](../tags), which is where the descriptive metadata lives.

**Genre** and **game system** are both optional and are stored as namespaced tags:

| Tag           | Meaning                                     |
| ------------- | ------------------------------------------- |
| `genre:*`     | `fantasy`, `scifi`, `cyberpunk`, `horror`   |
| `system:*`    | `adnd-2e`, `dcc`, `swn`, `uncharted-worlds` |
| `maturity:*`  | `experimental`, `beta`, `release-ready`     |
| anything else | free-form, e.g. `character`, `map`, `magic` |

Storing them as tags rather than as fields means `applyTagFilter` works on tools unchanged, so
a genre filter, a system filter, and a free-form tag filter are all the same operation and
compose with each other.

A tool may have more than one genre (the Spooky Starship generator is both `scifi` and
`horror`), and a tool that is genre- or system-agnostic simply has no such tag. The environment
generator carries no genre because its biomes suit any setting; the culture generator carries no
system because its output is not written to any ruleset.

## Maturity

`maturity` is the one piece of metadata that is a **promise to the user** rather than a description
of the content, and it is the only required one besides the identifying fields. The levels come from
the maturity levels in [`docs/workshop.md`](../../../docs/workshop.md), measured against the
readiness spec in the same document:

| Level           | What it promises                                                                  |
| --------------- | --------------------------------------------------------------------------------- |
| `experimental`  | May change or disappear, and its output may not be savable.                       |
| `beta`          | Output saves as a durable artifact, but editing it may be partial or unavailable. |
| `release-ready` | A full citizen of the workshop: it saves, edits, and composes.                    |

Two consequences follow from it being a promise:

- **There is no default.** A defaulted maturity would let a tool claim a level nobody assessed,
  which is the single failure the levels exist to prevent. Omitting it is a type error.
- **It is both a field and a tag.** Readers want exactly one value, which only a field guarantees;
  `defineTool` derives the `maturity:` tag from it so "durable fantasy tools" is one
  `applyTagFilter` call rather than a filter plus a second pass. The authoring site sets one value,
  so the two cannot disagree.

`maturityDisplayName` and `maturityDescription` give the badge its text; `toolsWithMaturity` and
`toolMaturityForPath` are the readers. Raising a tool's level belongs in the change that earns it —
`tool_catalog.test.ts` pins the tools currently assessed above `experimental` so a level cannot
rise as a side effect of an unrelated edit.

The UI shows it in two places: `ToolMaturityBadge` beside the heading on the tool's own page
(via `GeneratorPage`, which requires the catalog path for exactly this reason), and beside every
entry in `ToolBrowser`.

## Usage

Entries are written with `defineTool`, which expands `genres`, `systems`, and `maturity` into tags:

```ts
defineTool({
  path: '/swn/character',
  label: 'Stars Without Number Character',
  kind: 'generator',
  domain: 'characters',
  maturity: 'experimental',
  genres: ['scifi'],
  systems: ['swn'],
  tags: ['character'],
});
```

Reading metadata back:

```ts
import { findToolByPath, toolGenres, toolSystems, toolsWithGenre, filterTools } from '$lib/tools';

const tool = findToolByPath('/swn/character');
toolGenres(tool); // ['scifi']
toolSystems(tool); // ['swn']
tool.maturity; // 'experimental'

toolsWithGenre('fantasy'); // every fantasy tool
toolsWithMaturity('release-ready'); // every tool that will keep the user's work
filterTools({ includeAllTags: ['genre:fantasy'], excludeTags: ['system:adnd-2e'] });
```

`genresOf` and `systemsOf` return the distinct genres and systems present in a list of tools,
in display order — useful for building filter controls that only offer values that match
something. `genreDisplayName`, `systemDisplayName`, `maturityDisplayName`, and
`domainDisplayName` turn a tag value or domain into prose for the UI.

## Searching

`searchTools` narrows a list of tools by name, genre, and system at once. Criteria that are left
out do not narrow anything, so `searchTools(tools, {})` returns everything.

```ts
searchTools(allTools(), { query: 'star char', genre: 'scifi', system: 'swn' });
```

The name match takes each whitespace-separated term and requires it to appear somewhere in the
label, so `star char` finds "Stars Without Number Character" without the user typing the whole
name in order.

The system rule is worth stating plainly, because it is the one filter meant to be
non-negotiable: **a tool written for a different system is excluded, and a tool with no system
tag is kept.** System-neutral content — a culture, a region, a language — mixes nothing, because
it has no rules of its own to clash with. Excluding it as well would leave a Stars Without Number
table with two tools. `isCompatibleWithSystem` is that rule on its own if you need it elsewhere.

`groupToolsByDomain` buckets tools under their domain in navigation order and drops empty
domains, which is what a filtered list wants. `firstToolInBrowseOrder` returns the tool such a
list shows first, for a UI that has to open with something selected.

## Adding a tool

Add a `defineTool` entry in nav order, then link it from the relevant index component with
`toolsByPath`. The index components render labels and hrefs from the catalog, so a tool that is
in the catalog but not linked anywhere, or linked with a path the catalog does not know, is
caught by the unit tests or throws on page load rather than drifting quietly.

Assess its maturity rather than copying the entry above it. A new tool is `experimental` unless it
clears a higher bar in `docs/workshop.md`, and its page passes the same path to `GeneratorPage`, so
the level it declares is the level the user reads.

## Searching by maturity

`searchTools` deliberately does not take a maturity: nothing in the UI narrows by it yet, and the
tag makes it a one-line filter when something does —
`filterTools({ includeAllTags: [maturityTag('release-ready')] })`, or `toolsWithMaturity` for the
common case.

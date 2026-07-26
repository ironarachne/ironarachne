# Tools

The catalog of user-facing tools on the site — every generator, editor, and reference page —
together with the metadata that describes them.

Its job is to answer "what tools does Iron Arachne have, and what are they for?" in one place,
so navigation, filtering, and search all agree.

## Metadata model

Each entry carries a route path, a nav label, a `kind` (`generator`, `editor`, or `reference`),
and the `domain` it is listed under. Beyond that it is a `TaggedItem` from
[`$lib/tags`](../tags), which is where the descriptive metadata lives.

**Genre** and **game system** are both optional and are stored as namespaced tags:

| Tag           | Meaning                                     |
| ------------- | ------------------------------------------- |
| `genre:*`     | `fantasy`, `scifi`, `cyberpunk`, `horror`   |
| `system:*`    | `adnd-2e`, `dcc`, `swn`, `uncharted-worlds` |
| anything else | free-form, e.g. `character`, `map`, `magic` |

Storing them as tags rather than as fields means `applyTagFilter` works on tools unchanged, so
a genre filter, a system filter, and a free-form tag filter are all the same operation and
compose with each other.

A tool may have more than one genre (the Spooky Starship generator is both `scifi` and
`horror`), and a tool that is genre- or system-agnostic simply has no such tag. The environment
generator carries no genre because its biomes suit any setting; the culture generator carries no
system because its output is not written to any ruleset.

## Usage

Entries are written with `defineTool`, which expands `genres` and `systems` into tags:

```ts
defineTool({
  path: '/swn/character',
  label: 'Stars Without Number Character',
  kind: 'generator',
  domain: 'characters',
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

toolsWithGenre('fantasy'); // every fantasy tool
filterTools({ includeAllTags: ['genre:fantasy'], excludeTags: ['system:adnd-2e'] });
```

`genresOf` and `systemsOf` return the distinct genres and systems present in a list of tools,
in display order — useful for building filter controls that only offer values that match
something. `genreDisplayName`, `systemDisplayName`, and `domainDisplayName` turn a tag value or
domain into prose for the UI.

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
